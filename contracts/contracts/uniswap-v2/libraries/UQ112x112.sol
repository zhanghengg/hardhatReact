// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title UQ112x112 定点数库
/// @notice 用于价格累积计算的定点数运算
/// @dev 使用 112.112 位定点数格式，支持范围 [0, 2^112 - 1]
library UQ112x112 {
    uint224 constant Q112 = 2**112;

    /// @notice 将 uint112 编码为 UQ112x112 格式
    function encode(uint112 y) internal pure returns (uint224 z) {
        z = uint224(y) * Q112; // 不会溢出
    }

    /// @notice 将 UQ112x112 除以 uint112，返回 UQ112x112
    function uqdiv(uint224 x, uint112 y) internal pure returns (uint224 z) {
        z = x / uint224(y);
    }
}
