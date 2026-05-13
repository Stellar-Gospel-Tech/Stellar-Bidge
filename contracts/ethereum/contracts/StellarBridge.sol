// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StellarBridge
 * @notice Locks ERC-20 tokens on Ethereum so the relayer can mint SEP-41
 *         equivalents on Stellar, and releases them when the relayer confirms
 *         a deposit on the Stellar side.
 *
 * ## Flow
 * ETH → Stellar: deposit() locks tokens → relayer observes → mints on Stellar
 * Stellar → ETH: relayer calls release() after observing Stellar deposit event
 */
contract StellarBridge is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    event Deposit(
        address indexed from,
        address indexed token,
        uint256 amount,
        bytes stellarRecipient,
        uint64 nonce
    );

    event Release(
        address indexed to,
        address indexed token,
        uint256 amount,
        bytes32 stellarTxHash
    );

    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);

    mapping(address => bool) public supportedTokens;
    mapping(bytes32 => bool) public processed;

    constructor(address initialOwner) Ownable(initialOwner) {}

    // ── Admin ─────────────────────────────────────────────────────────────────

    function addToken(address token) external onlyOwner {
        require(token != address(0), "zero address");
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    // ── Bridge actions ────────────────────────────────────────────────────────

    /**
     * @notice Lock `amount` of `token` from msg.sender into this contract.
     *
     * @param token            ERC-20 token address (must be whitelisted)
     * @param amount           Amount to lock (must be > 0)
     * @param stellarRecipient Stellar G-address as raw bytes (56 bytes)
     * @param nonce            Caller-supplied nonce for deduplication
     */
    function deposit(
        address token,
        uint256 amount,
        bytes calldata stellarRecipient,
        uint64 nonce
    ) external nonReentrant {
        require(supportedTokens[token], "token not supported");
        require(amount > 0, "amount must be > 0");
        require(stellarRecipient.length == 56, "invalid stellar recipient");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, token, amount, stellarRecipient, nonce);
    }

    /**
     * @notice Release locked `amount` of `token` to `to`.
     *         Only callable by the owner (relayer).
     *
     * @param to              Recipient on Ethereum
     * @param token           ERC-20 token address
     * @param amount          Amount to release
     * @param stellarTxHash   Stellar transaction hash — replay protection key
     *
     * TODO (SB-010 contributor issue)
     * The current implementation is complete for single-relayer operation.
     * A future contributor should add multisig validation here so that
     * `release` requires m-of-n relayer signatures before executing.
     * See issue SB-020 for the multisig upgrade path.
     */
    function release(
        address to,
        address token,
        uint256 amount,
        bytes32 stellarTxHash
    ) external onlyOwner nonReentrant {
        require(to != address(0), "zero address");
        require(amount > 0, "amount must be > 0");
        require(!processed[stellarTxHash], "already processed");

        processed[stellarTxHash] = true;
        IERC20(token).safeTransfer(to, amount);
        emit Release(to, token, amount, stellarTxHash);
    }
}
