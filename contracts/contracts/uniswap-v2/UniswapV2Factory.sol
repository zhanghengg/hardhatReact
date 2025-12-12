// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./UniswapV2Pair.sol";

/// @title Uniswap V2 工厂合约
/// @notice 负责创建和管理所有交易对
contract UniswapV2Factory {
    // 协议费接收地址
    address public feeTo;
    // 有权设置 feeTo 的地址
    address public feeToSetter;

    // 交易对映射: token0 => token1 => pair
    mapping(address => mapping(address => address)) public getPair;
    // 所有交易对数组
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256);

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    /// @notice 获取所有交易对数量
    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    /// @notice 创建新的交易对
    /// @param tokenA 代币A地址
    /// @param tokenB 代币B地址
    /// @return pair 新创建的交易对地址
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "UniswapV2: IDENTICAL_ADDRESSES");
        
        // 排序，确保 token0 < token1
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "UniswapV2: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "UniswapV2: PAIR_EXISTS");

        // 使用 CREATE2 部署交易对合约
        bytes memory bytecode = type(UniswapV2Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        // 初始化交易对
        UniswapV2Pair(pair).initialize(token0, token1);
        
        // 双向映射
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    /// @notice 设置协议费接收地址
    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "UniswapV2: FORBIDDEN");
        feeTo = _feeTo;
    }

    /// @notice 转移 feeToSetter 权限
    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, "UniswapV2: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }
}
