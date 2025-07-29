// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

//0x3e5fea22DF05025F584aCd03dE1F96d64AAb7a86 
// verified contract 0x04d21AB7ED0B2F3d1f5Db4235Af692AA24185668 

import {IERC20} from "../interfaces/IERC20.sol";
import {IERC721} from "../interfaces/IERC721.sol";
import {INonfungiblePositionManager} from "../interfaces/INonFungibleManager.sol";
import {IUniswapV3Factory} from "../interfaces/Factory.sol";
import {IUniswapV3Pool} from "../interfaces/Pool.sol";
import {ISwapRouter} from "../interfaces/ISwapRouter.sol";
import {ReentrancyGuard} from "../../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract DEX is ReentrancyGuard {
    address private UNISWAP_V3_NFT_MANAGER;
    address private UNISWAP_V3_FACTORY;
    address private SWAP_ROUTER;

    INonfungiblePositionManager private liquid;
    ISwapRouter private swapRouter;
    IUniswapV3Factory private factory;

    mapping(address => uint256[]) private userPositions;
    
    event SwapExecuted(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed user, uint256 indexed tokenId, address token0, address token1, uint256 amount0, uint256 amount1, uint128 liquidity);
    event LiquidityRemoved(address indexed user, uint256 indexed tokenId, uint256 amount0, uint256 amount1);

    constructor(address _uniswapV3NftManager, address _uniswapV3Factory, address _swapRouter) {
        UNISWAP_V3_NFT_MANAGER = _uniswapV3NftManager;
        UNISWAP_V3_FACTORY = _uniswapV3Factory;
        SWAP_ROUTER = _swapRouter;
        
        liquid = INonfungiblePositionManager(UNISWAP_V3_NFT_MANAGER);
        swapRouter = ISwapRouter(SWAP_ROUTER);
        factory = IUniswapV3Factory(UNISWAP_V3_FACTORY);
    }

    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external nonReentrant returns (uint256 amountOut) {
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(swapRouter), amountIn);
        
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient: msg.sender,
            amountIn: amountIn,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0
        });
            
        amountOut = swapRouter.exactInputSingle(params);
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function swapExactInput(
        address tokenIn,
        address tokenMid,
        address tokenOut,
        uint24 fee1,
        uint24 fee2,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external nonReentrant returns (uint256 amountOut) {
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(swapRouter), amountIn);
        
        bytes memory path = abi.encodePacked(tokenIn, fee1, tokenMid, fee2, tokenOut);
        
        ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
            path: path,
            recipient: msg.sender,
            amountIn: amountIn,
            amountOutMinimum: amountOutMinimum
        });
            
        amountOut = swapRouter.exactInput(params);
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function swapExactOutputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountOut,
        uint256 amountInMaximum
    ) external nonReentrant returns (uint256 amountIn) {
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountInMaximum);
        IERC20(tokenIn).approve(address(swapRouter), amountInMaximum);
        
        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient: msg.sender,
            amountOut: amountOut,
            amountInMaximum: amountInMaximum,
            sqrtPriceLimitX96: 0
        });
            
        amountIn = swapRouter.exactOutputSingle(params);
        
        if (amountInMaximum > amountIn) {
            IERC20(tokenIn).transfer(msg.sender, amountInMaximum - amountIn);
        }
        
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function swapExactOutput(
        address tokenIn,
        address tokenMid,
        address tokenOut,
        uint24 fee1,
        uint24 fee2,
        uint256 amountOut,
        uint256 amountInMaximum
    ) external nonReentrant returns (uint256 amountIn) {
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountInMaximum);
        IERC20(tokenIn).approve(address(swapRouter), amountInMaximum);
        
        bytes memory path = abi.encodePacked(tokenOut, fee2, tokenMid, fee1, tokenIn);
        
        ISwapRouter.ExactOutputParams memory params = ISwapRouter.ExactOutputParams({
            path: path,
            recipient: msg.sender,
            amountOut: amountOut,
            amountInMaximum: amountInMaximum
        });
            
        amountIn = swapRouter.exactOutput(params);
        
        if (amountInMaximum > amountIn) {
            IERC20(tokenIn).transfer(msg.sender, amountInMaximum - amountIn);
        }
        
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function addLiquidity(
        address token0,
        address token1,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    ) external nonReentrant returns (
        uint256 tokenId,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    ) {
        IERC20(token0).transferFrom(msg.sender, address(this), amount0Desired);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1Desired);
        
        IERC20(token0).approve(address(liquid), amount0Desired);
        IERC20(token1).approve(address(liquid), amount1Desired);
        
        (tokenId, liquidity, amount0, amount1) = liquid.mint(
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: fee,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: amount0Min,
                amount1Min: amount1Min,
                recipient: msg.sender,
                deadline: block.timestamp
            })
        );
        
        userPositions[msg.sender].push(tokenId);
        
        if (amount0Desired > amount0) {
            IERC20(token0).transfer(msg.sender, amount0Desired - amount0);
        }
        if (amount1Desired > amount1) {
            IERC20(token1).transfer(msg.sender, amount1Desired - amount1);
        }
        
        emit LiquidityAdded(msg.sender, tokenId, token0, token1, amount0, amount1, liquidity);
    }

    function increaseLiquidity(
        uint256 tokenId,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    ) external nonReentrant returns (
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    ) {
        (,, address token0, address token1,,,,,,,,) = liquid.positions(tokenId);
        
        IERC20(token0).transferFrom(msg.sender, address(this), amount0Desired);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1Desired);
        
        IERC20(token0).approve(address(liquid), amount0Desired);
        IERC20(token1).approve(address(liquid), amount1Desired);
        
        (liquidity, amount0, amount1) = liquid.increaseLiquidity(
            INonfungiblePositionManager.IncreaseLiquidityParams({
                tokenId: tokenId,
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: amount0Min,
                amount1Min: amount1Min,
                deadline: block.timestamp
            })
        );
        
        if (amount0Desired > amount0) {
            IERC20(token0).transfer(msg.sender, amount0Desired - amount0);
        }
        if (amount1Desired > amount1) {
            IERC20(token1).transfer(msg.sender, amount1Desired - amount1);
        }
    }

    function removeLiquidity(
        uint256 tokenId,
        uint128 liquidity,
        uint256 amount0Min,
        uint256 amount1Min
    ) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        (amount0, amount1) = liquid.decreaseLiquidity(
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: tokenId,
                liquidity: liquidity,
                amount0Min: amount0Min,
                amount1Min: amount1Min,
                deadline: block.timestamp
            })
        );
        
        liquid.collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: msg.sender,
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            })
        );
        
        emit LiquidityRemoved(msg.sender, tokenId, amount0, amount1);
    }

    function getSpotPrice(
        address token0,
        address token1,
        uint24 fee
    ) external view returns (uint256 price) {
        address poolAddress = factory.getPool(token0, token1, fee);
        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);
        IUniswapV3Pool.Slot0 memory slot0 = pool.slot0();
        uint160 sqrtPriceX96 = slot0.sqrtPriceX96;
        price = (uint256(sqrtPriceX96) * uint256(sqrtPriceX96)) >> 192;
    }

    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    function poolExists(
        address token0,
        address token1,
        uint24 fee
    ) external view returns (bool exists) {
        address poolAddress = factory.getPool(token0, token1, fee);
        return poolAddress != address(0);
    }

    function getPositionInfo(uint256 tokenId) external view returns (
        address token0,
        address token1,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity
    ) {
        (,, token0, token1, fee, tickLower, tickUpper, liquidity,,,,) = liquid.positions(tokenId);
    }
}
