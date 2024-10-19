// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSwap is Ownable {
    mapping(address => mapping(address => uint256)) public exchangeRates;

    event RateSet(address indexed fromToken, address indexed toToken, uint256 rate);
    event Swap(address indexed user, address indexed fromToken, address indexed toToken, uint256 fromAmount, uint256 toAmount);
    event TokensWithdrawn(address indexed token, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function setExchangeRate(address fromToken, address toToken, uint256 rate) external onlyOwner {
        require(rate > 0, "Rate must be positive");
        exchangeRates[fromToken][toToken] = rate;
        emit RateSet(fromToken, toToken, rate);
    }

    function getExchangeRate(address fromToken, address toToken) public view returns (uint256) {
        return exchangeRates[fromToken][toToken];
    }

    function getContractBalance(address token) external view returns (uint256) {
    return IERC20(token).balanceOf(address(this));
}

    function swap(address fromToken, address toToken, uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        uint256 rate = getExchangeRate(fromToken, toToken);
        require(rate > 0, "Exchange rate not set");

        uint256 toAmount = (amount * rate) / 1e18;
        require(IERC20(toToken).balanceOf(address(this)) >= toAmount, "Insufficient contract balance");

        require(IERC20(fromToken).transferFrom(msg.sender, address(this), amount), "Transfer from failed");
        require(IERC20(toToken).transfer(msg.sender, toAmount), "Transfer to failed");

        emit Swap(msg.sender, fromToken, toToken, amount, toAmount);
    }

    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        require(IERC20(token).transfer(owner(), amount), "Transfer failed");
        emit TokensWithdrawn(token, amount);
    }
}