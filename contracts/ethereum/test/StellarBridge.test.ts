import { expect } from "chai";
import { ethers } from "hardhat";
import { StellarBridge } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("StellarBridge", function () {
  let bridge: StellarBridge;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let tokenAddr: string;

  // 56-byte Stellar G-address
  const STELLAR_RECIPIENT = Buffer.from(
    "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN"
  );
  const RANDOM_HASH = `0x${"ab".repeat(32)}`;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    // Use a random-looking but valid address as a token placeholder
    tokenAddr = "0x" + "1234567890abcdef".repeat(2) + "12345678";

    const BridgeFactory = await ethers.getContractFactory("StellarBridge");
    bridge = (await BridgeFactory.deploy(owner.address)) as StellarBridge;
  });

  it("deploys with correct owner", async () => {
    expect(await bridge.owner()).to.equal(owner.address);
  });

  it("addToken marks token as supported", async () => {
    await bridge.addToken(tokenAddr);
    expect(await bridge.supportedTokens(tokenAddr)).to.be.true;
  });

  it("addToken reverts for non-owner", async () => {
    await expect(
      bridge.connect(user).addToken(tokenAddr)
    ).to.be.revertedWithCustomError(bridge, "OwnableUnauthorizedAccount");
  });

  it("deposit reverts (not implemented yet)", async () => {
    await expect(
      bridge.connect(user).deposit(tokenAddr, 100n, STELLAR_RECIPIENT, 1n)
    ).to.be.revertedWith("not implemented");
  });

  it("release reverts (not implemented yet)", async () => {
    await expect(
      bridge.release(user.address, tokenAddr, 100n, RANDOM_HASH)
    ).to.be.revertedWith("not implemented");
  });

  it("release reverts for non-owner", async () => {
    await expect(
      bridge.connect(user).release(user.address, tokenAddr, 100n, RANDOM_HASH)
    ).to.be.revertedWithCustomError(bridge, "OwnableUnauthorizedAccount");
  });
});
