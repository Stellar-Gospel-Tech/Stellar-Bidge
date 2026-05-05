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
 *         a burn on the Stellar side.
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

    mapping(address => bool) public supportedTokens;
    mapping(bytes32 => bool) public processed;

    constructor(address initialOwner) Ownable(initialOwner) {}

    function addToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    /**
     * TODO: Lock `amount` of `token` from msg.sender into this contract.
     * - Validate token is supported and amount > 0
     * - stellarRecipient must be 56 bytes (Stellar strkey G-address)
     * - Pull tokens in with safeTransferFrom
     * - Emit Deposit event
     */
    function deposit(
        address token,
        uint256 amount,
        bytes calldata stellarRecipient,
        uint64 nonce
    ) external nonReentrant {
        revert("not implemented");
    }

    /**
     * TODO: Release locked `amount` of `token` to `to`.
     * - Only callable by owner (relayer)
     * - Replay protection: revert if stellarTxHash already processed
     * - Mark hash as processed, then safeTransfer tokens out
     * - Emit Release event
     */
    function release(
        address to,
        address token,
        uint256 amount,
        bytes32 stellarTxHash
    ) external onlyOwner nonReentrant {
        revert("not implemented");
    }
}
