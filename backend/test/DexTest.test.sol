// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";
import {IERC721} from "../src/interfaces/IERC721.sol";
import {DEX} from "../src/DEX/DEX.sol";
import {
    WETH,
    USDC,
    DAI,
    WBTC,
    UNISWAP_V3_FACTORY,
    UNISWAP_V3_NONFUNGIBLE_POSITION_MANAGER,
    UNISWAP_V3_SWAP_ROUTER_02
} from "../src/interfaces/TestingConstants.sol";

contract DEXTest is Test {
    DEX private dex;
    IERC20 private dai;
    IERC20 private usdc;
    IERC20 private weth;
    IERC20 private wbtc;

    address private constant DAI_WHALE = 0x28C6c06298d514Db089934071355E5743bf21d60;
    address private constant USDC_WHALE = 0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503;
    address private constant WETH_WHALE = 0x8EB8a3b98659Cce290402893d0123abb75E3ab28;
    
    uint24 private constant FEE_100 = 100;
    uint24 private constant FEE_500 = 500;
    uint24 private constant FEE_3000 = 3000;

    function setUp() public {
        dex = new DEX(
            UNISWAP_V3_NONFUNGIBLE_POSITION_MANAGER,
            UNISWAP_V3_FACTORY,
            UNISWAP_V3_SWAP_ROUTER_02
        );

        dai = IERC20(DAI);
        usdc = IERC20(USDC);
        weth = IERC20(WETH);
        wbtc = IERC20(WBTC);

        vm.deal(DAI_WHALE, 1 ether);
        vm.startPrank(DAI_WHALE);
        dai.transfer(address(this), 10000 * 1e18);
        vm.stopPrank();

        vm.deal(USDC_WHALE, 1 ether);
        vm.startPrank(USDC_WHALE);
        usdc.transfer(address(this), 10000 * 1e6);
        vm.stopPrank();

        vm.deal(WETH_WHALE, 1 ether);
        vm.startPrank(WETH_WHALE);
        weth.transfer(address(this), 10 * 1e18);
        vm.stopPrank();

        dai.approve(address(dex), type(uint256).max);
        usdc.approve(address(dex), type(uint256).max);
        weth.approve(address(dex), type(uint256).max);
        wbtc.approve(address(dex), type(uint256).max);
    }

    // ====== SWAP TESTS ======

    function test_swapExactInputSingle_DAI_USDC() public {
        uint256 amountIn = 1000 * 1e18; 
        uint256 amountOutMinimum = 990 * 1e6; 

        uint256 usdcBefore = usdc.balanceOf(address(this));
        uint256 daiBefore = dai.balanceOf(address(this));

        uint256 amountOut = dex.swapExactInputSingle(
            DAI,
            USDC,
            FEE_100,
            amountIn,
            amountOutMinimum
        );

        uint256 usdcAfter = usdc.balanceOf(address(this));
        uint256 daiAfter = dai.balanceOf(address(this));

        console2.log("USDC amount out:", amountOut);
        
        assertEq(daiBefore - daiAfter, amountIn);
        assertEq(usdcAfter - usdcBefore, amountOut);
        assertGt(amountOut, amountOutMinimum);
    }

    function test_swapExactInputSingle_USDC_WETH() public {
        uint256 amountIn = 1000 * 1e6; 
        uint256 amountOutMinimum = 0.25 * 1e18;

        uint256 wethBefore = weth.balanceOf(address(this));
        uint256 usdcBefore = usdc.balanceOf(address(this));

        uint256 amountOut = dex.swapExactInputSingle(
            USDC,
            WETH,
            FEE_500,
            amountIn,
            amountOutMinimum
        );

        uint256 wethAfter = weth.balanceOf(address(this));
        uint256 usdcAfter = usdc.balanceOf(address(this));

        console2.log("WETH amount out:", amountOut);
        
        assertEq(usdcBefore - usdcAfter, amountIn);
        assertEq(wethAfter - wethBefore, amountOut);
        assertGt(amountOut, amountOutMinimum);
    }

    function test_swapExactInput_DAI_WETH_WBTC() public {
        uint256 amountIn = 5000 * 1e18; 
        uint256 amountOutMinimum = 0.01 * 1e8; 

        uint256 wbtcBefore = wbtc.balanceOf(address(this));
        uint256 daiBefore = dai.balanceOf(address(this));

        uint256 amountOut = dex.swapExactInput(
            DAI,
            WETH,
            WBTC,
            FEE_3000,
            FEE_3000,
            amountIn,
            amountOutMinimum
        );

        uint256 wbtcAfter = wbtc.balanceOf(address(this));
        uint256 daiAfter = dai.balanceOf(address(this));

        console2.log("WBTC amount out:", amountOut);
        
        assertEq(daiBefore - daiAfter, amountIn);
        assertEq(wbtcAfter - wbtcBefore, amountOut);
        assertGt(amountOut, amountOutMinimum);
    }

    function test_swapExactOutputSingle_DAI_USDC() public {
        uint256 amountOut = 1000 * 1e6; 
        uint256 amountInMaximum = 1010 * 1e18; 

        uint256 usdcBefore = usdc.balanceOf(address(this));
        uint256 daiBefore = dai.balanceOf(address(this));

        uint256 amountIn = dex.swapExactOutputSingle(
            DAI,
            USDC,
            FEE_100,
            amountOut,
            amountInMaximum
        );

        uint256 usdcAfter = usdc.balanceOf(address(this));
        uint256 daiAfter = dai.balanceOf(address(this));

        console2.log("DAI amount in:", amountIn);
        
        assertEq(daiBefore - daiAfter, amountIn);
        assertEq(usdcAfter - usdcBefore, amountOut);
        assertLe(amountIn, amountInMaximum);
    }

    function test_swapExactOutput_DAI_WETH_WBTC() public {
        uint256 amountOut = 0.01 * 1e8; 
        uint256 amountInMaximum = 3000 * 1e18; 

        uint256 wbtcBefore = wbtc.balanceOf(address(this));
        uint256 daiBefore = dai.balanceOf(address(this));

        uint256 amountIn = dex.swapExactOutput(
            DAI,
            WETH,
            WBTC,
            FEE_3000,
            FEE_3000,
            amountOut,
            amountInMaximum
        );

        uint256 wbtcAfter = wbtc.balanceOf(address(this));
        uint256 daiAfter = dai.balanceOf(address(this));

        console2.log("DAI amount in:", amountIn);
        
        assertEq(daiBefore - daiAfter, amountIn);
        assertEq(wbtcAfter - wbtcBefore, amountOut);
        assertLe(amountIn, amountInMaximum);
    }

    // ====== LIQUIDITY TESTS ======

    function test_addLiquidity_DAI_USDC() public {
        uint256 amount0Desired = 1000 * 1e18; 
        uint256 amount1Desired = 1000 * 1e6; 
        int24 tickLower = -120;
        int24 tickUpper = 120;

        (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) = 
        dex.addLiquidity(
            DAI,
            USDC,
            FEE_100,
            tickLower,
            tickUpper,
            amount0Desired,
            amount1Desired,
            0,
            0
        );

        console2.log("Token ID:", tokenId);
        console2.log("Liquidity:", liquidity);
        console2.log("Amount0 used:", amount0);
        console2.log("Amount1 used:", amount1);

        assertGt(tokenId, 0);
        assertGt(liquidity, 0);
        assertTrue(amount0 > 0 || amount1 > 0);

        uint256[] memory userPositions = dex.getUserPositions(address(this));
        assertEq(userPositions.length, 1);
        assertEq(userPositions[0], tokenId);
    }

    function test_addLiquidity_USDC_WETH() public {
        uint256 amount0Desired = 1000 * 1e6; 
        uint256 amount1Desired = 1 * 1e18; 
        int24 tickLower = -60;
        int24 tickUpper = 60;

        (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) = 
        dex.addLiquidity(
            USDC,
            WETH,
            FEE_500,
            tickLower,
            tickUpper,
            amount0Desired,
            amount1Desired,
            0,
            0
        );

        console2.log("Token ID:", tokenId);
        console2.log("Liquidity:", liquidity);
        console2.log("Amount0 used:", amount0);
        console2.log("Amount1 used:", amount1);

        assertGt(tokenId, 0);
        assertGt(liquidity, 0);
        assertTrue(amount0 > 0 || amount1 > 0); 
    }

    function test_increaseLiquidity() public {
        (uint256 tokenId,,,) = dex.addLiquidity(
            DAI,
            USDC,
            FEE_100,
            -120,
            120,
            1000 * 1e18,
            1000 * 1e6,
            0,
            0
        );

        (,,,,,uint128 initialLiquidity) = dex.getPositionInfo(tokenId);

        (uint128 liquidityDelta, uint256 amount0, uint256 amount1) = 
        dex.increaseLiquidity(
            tokenId,
            500 * 1e18, 
            500 * 1e6,  
            0,
            0
        );

        console2.log("Liquidity delta:", liquidityDelta);
        console2.log("Amount0 added:", amount0);
        console2.log("Amount1 added:", amount1);

        (,,,,,uint128 finalLiquidity) = dex.getPositionInfo(tokenId);

        assertGt(liquidityDelta, 0);
        assertGt(finalLiquidity, initialLiquidity);
    }

    function test_removeLiquidity() public {
        (uint256 tokenId, uint128 liquidity,,) = dex.addLiquidity(
            DAI,
            USDC,
            FEE_100,
            -120,
            120,
            1000 * 1e18,
            1000 * 1e6,
            0,
            0
        );

        IERC721 nft = IERC721(UNISWAP_V3_NONFUNGIBLE_POSITION_MANAGER);
        nft.approve(address(dex), tokenId);

        uint256 daiBefore = dai.balanceOf(address(this));
        uint256 usdcBefore = usdc.balanceOf(address(this));

        (uint256 amount0, uint256 amount1) = dex.removeLiquidity(
            tokenId,
            liquidity,
            0,
            0
        );

        uint256 daiAfter = dai.balanceOf(address(this));
        uint256 usdcAfter = usdc.balanceOf(address(this));

        console2.log("Amount0 removed:", amount0);
        console2.log("Amount1 removed:", amount1);

        assertTrue(amount0 > 0 || amount1 > 0);
        
        if (amount0 > 0) {
            assertGt(daiAfter, daiBefore);
        }
        if (amount1 > 0) {
            assertGt(usdcAfter, usdcBefore);
        }

        // Check that liquidity is now 0
        (,,,,,uint128 remainingLiquidity) = dex.getPositionInfo(tokenId);
        assertEq(remainingLiquidity, 0);
    }

    // ====== VIEW FUNCTION TESTS ======

    function test_getSpotPrice_DAI_USDC() public view {
        uint256 price = dex.getSpotPrice(DAI, USDC, FEE_100);
        console2.log("DAI/USDC spot price:", price);
        
        
    }

    function test_getSpotPrice_USDC_WETH() public view {
        uint256 price = dex.getSpotPrice(USDC, WETH, FEE_500);
        console2.log("USDC/WETH spot price:", price);
        
        assertGt(price, 0);
    }

    function test_poolExists() public view {
        bool exists = dex.poolExists(DAI, USDC, FEE_100);
        assertTrue(exists);

        bool nonExistent = dex.poolExists(DAI, WBTC, FEE_100);
        assertFalse(nonExistent);
    }

    function test_getUserPositions() public {
        uint256[] memory positions = dex.getUserPositions(address(this));
        assertEq(positions.length, 0);

        (uint256 tokenId,,,) = dex.addLiquidity(
            DAI,
            USDC,
            FEE_100,
            -120,
            120,
            1000 * 1e18,
            1000 * 1e6,
            0,
            0
        );

        positions = dex.getUserPositions(address(this));
        assertEq(positions.length, 1);
        assertEq(positions[0], tokenId);
    }

    function test_getPositionInfo() public {
        (uint256 tokenId,,,) = dex.addLiquidity(
            DAI,
            USDC,
            FEE_100,
            -120,
            120,
            1000 * 1e18,
            1000 * 1e6,
            0,
            0
        );

        (
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity
        ) = dex.getPositionInfo(tokenId);

        assertEq(token0, DAI);
        assertEq(token1, USDC);
        assertEq(fee, FEE_100);
        assertEq(tickLower, -120);
        assertEq(tickUpper, 120);
        assertGt(liquidity, 0);
    }

    // ====== ERROR HANDLING TESTS ======

    function testRevert_swapExactInputSingle_ZeroAmount() public {
        vm.expectRevert();
        dex.swapExactInputSingle(
            DAI,
            USDC,
            FEE_100,
            0,
            0
        );
    }

    function testRevert_swapWithoutApproval() public {
        dai.approve(address(dex), 0);
        
        vm.expectRevert();
        dex.swapExactInputSingle(
            DAI,
            USDC,
            FEE_100,
            1000 * 1e18,
            0
        );
        
        dai.approve(address(dex), type(uint256).max);
    }

    function testRevert_addLiquidityInvalidTokenOrder() public {
        vm.expectRevert();
        dex.addLiquidity(
            USDC, 
            DAI,  
            FEE_100,
            -120,
            120,
            1000 * 1e6,
            1000 * 1e18,
            0,
            0
        );
    }
}
