import { expect } from "chai";
import { ethers } from "hardhat";
import { StellarBridge } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("StellarBridge", function () {
  let bridge: StellarBridge;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let token: any;

  // 56-byte Stellar G-address placeholder (raw bytes)
  const STELLAR_RECIPIENT = Buffer.alloc(56, 0x47); // 56 × 'G'
  const TX_HASH_1 = `0x${"ab".repeat(32)}`;
  const TX_HASH_2 = `0x${"cd".repeat(32)}`;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    // Deploy a minimal ERC-20 mock
    const ERC20 = await ethers.getContractFactory("MockERC20");
    token = await ERC20.deploy("Mock", "MCK", 18);
    await token.mint(user.address, ethers.parseEther("1000"));

    const BridgeFactory = await ethers.getContractFactory("StellarBridge");
    bridge = (await BridgeFactory.deploy(owner.address)) as StellarBridge;
    await bridge.addToken(await token.getAddress());
  });

  // ── Ownership ──────────────────────────────────────────────────────────────

  it("deploys with correct owner", async () => {
    expect(await bridge.owner()).to.equal(owner.address);
  });

  // ── Token whitelist ────────────────────────────────────────────────────────

  it("addToken marks token as supported", async () => {
    expect(await bridge.supportedTokens(await token.getAddress())).to.be.true;
  });

  it("addToken reverts for non-owner", async () => {
    await expect(
      bridge.connect(user).addToken(await token.getAddress())
    ).to.be.revertedWithCustomError(bridge, "OwnableUnauthorizedAccount");
  });

  it("removeToken marks token as unsupported", async () => {
    await bridge.removeToken(await token.getAddress());
    expect(await bridge.supportedTokens(await token.getAddress())).to.be.false;
  });

  // ── Deposit ────────────────────────────────────────────────────────────────

  it("deposit locks tokens and emits event", async () => {
    const amount = ethers.parseEther("10");
    await token.connect(user).approve(await bridge.getAddress(), amount);

    await expect(
      bridge.connect(user).deposit(await token.getAddress(), amount, STELLAR_RECIPIENT, 1n)
    )
      .to.emit(bridge, "Deposit")
      .withArgs(user.address, await token.getAddress(), amount, STELLAR_RECIPIENT, 1n);

    expect(await token.balanceOf(await bridge.getAddress())).to.equal(amount);
  });

  it("deposit reverts for unsupported token", async () => {
    const other = await (await ethers.getContractFactory("MockERC20")).deploy("X", "X", 18);
    await expect(
      bridge.connect(user).deposit(await other.getAddress(), 1n, STELLAR_RECIPIENT, 1n)
    ).to.be.revertedWith("token not supported");
  });

  it("deposit reverts for zero amount", async () => {
    await expect(
      bridge.connect(user).deposit(await token.getAddress(), 0n, STELLAR_RECIPIENT, 1n)
    ).to.be.revertedWith("amount must be > 0");
  });

  it("deposit reverts for invalid stellar recipient length", async () => {
    await expect(
      bridge.connect(user).deposit(await token.getAddress(), 1n, Buffer.from("short"), 1n)
    ).to.be.revertedWith("invalid stellar recipient");
  });

  // ── Release ────────────────────────────────────────────────────────────────

  it("release transfers tokens and emits event", async () => {
    // Fund the bridge first
    const amount = ethers.parseEther("10");
    await token.mint(await bridge.getAddress(), amount);

    await expect(
      bridge.release(user.address, await token.getAddress(), amount, TX_HASH_1)
    )
      .to.emit(bridge, "Release")
      .withArgs(user.address, await token.getAddress(), amount, TX_HASH_1);

    expect(await token.balanceOf(user.address)).to.equal(
      ethers.parseEther("1010")
    );
  });

  it("release reverts for non-owner", async () => {
    await expect(
      bridge.connect(user).release(user.address, await token.getAddress(), 1n, TX_HASH_1)
    ).to.be.revertedWithCustomError(bridge, "OwnableUnauthorizedAccount");
  });

  it("release reverts on duplicate stellarTxHash (replay protection)", async () => {
    const amount = ethers.parseEther("5");
    await token.mint(await bridge.getAddress(), amount * 2n);

    await bridge.release(user.address, await token.getAddress(), amount, TX_HASH_1);
    await expect(
      bridge.release(user.address, await token.getAddress(), amount, TX_HASH_1)
    ).to.be.revertedWith("already processed");
  });

  it("release marks hash as processed", async () => {
    const amount = ethers.parseEther("1");
    await token.mint(await bridge.getAddress(), amount);
    await bridge.release(user.address, await token.getAddress(), amount, TX_HASH_2);
    expect(await bridge.processed(TX_HASH_2)).to.be.true;
  });
});
