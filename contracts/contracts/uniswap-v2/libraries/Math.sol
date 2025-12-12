// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Uniswap V2 数学库
/// @notice 提供基础数学运算
library Math {
    /// @notice 返回两个数中的较小值
    function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x < y ? x : y;
    }

    /// @notice 计算平方根 (巴比伦方法)
    /// @dev 用于计算流动性代币数量
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
