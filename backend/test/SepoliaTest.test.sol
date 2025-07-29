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
} from "../src/interfaces/SepoliaConstants.sol";

contract DEXSepoliaTest is Test {
    DEX private dex;
    IERC20 private dai;
    IERC20 private usdc;
    IERC20 private weth;
    IERC20 private wbtc;

    address private testAccount1 = 0x1234567890123456789012345678901234567890;
    address private testAccount2 = 0x2234567890123456789012345678901234567890;
    address private testAccount3 = 0x3234567890123456789012345678901234567890;
    
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

        
        deal(address(dai), address(this), 50000 * 1e18);   // 50,000 DAI
        deal(address(usdc), address(this), 50000 * 1e6);   // 50,000 USDC
        deal(address(weth), address(this), 50 * 1e18);     // 50 WETH
        deal(address(wbtc), address(this), 5 * 1e8);       // 5 WBTC

        
        
        // Approve DEX to spend tokens
        dai.approve(address(dex), type(uint256).max);
        usdc.approve(address(dex), type(uint256).max);
        weth.approve(address(dex), type(uint256).max);
        wbtc.approve(address(dex), type(uint256).max);
    }

    function fundAccountFromFaucets() public {
        
        vm.skip(true); // Skip this function in tests
    }

    // ====== SWAP TESTS ======

    function test_swapExactInputSingle_DAI_USDC() public {
        uint256 amountIn = 100 * 1e18;  // Reduced amount for testnet
        uint256 amountOutMinimum = 90 * 1e6;  // 90 USDC minimum

        uint256 usdcBefore = usdc.balanceOf(address(this));
        uint256 daiBefore = dai.balanceOf(address(this));

        // Skip if pool doesn't exist
        if (!dex.poolExists(DAI, USDC, FEE_100)) {
            vm.skip(true);
            return;
        }

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
        uint256 amountIn = 1000 * 1e6;  // 1000 USDC
        uint256 amountOutMinimum = 0.2 * 1e18;  // 0.2 WETH minimum

        uint256 wethBefore = weth.balanceOf(address(this));
        uint256 usdcBefore = usdc.balanceOf(address(this));

        // Skip if pool doesn't exist
        if (!dex.poolExists(USDC, WETH, FEE_500)) {
            vm.skip(true);
            return;
        }

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
        uint256 amountIn = 2000 * 1e18;  // Reduced for testnet
        uint256 amountOutMinimum = 0.005 * 1e8;  // 0.005 WBTC minimum

        uint256 wbtcBefore = wbtc.balanceOf(address(this));
        uint256 daiBefore = dai.balanceOf(address(this));

        // Skip if pools don't exist
        if (!dex.poolExists(DAI, WETH, FEE_3000) || !dex.poolExists(WETH, WBTC, FEE_3000)) {
            vm.skip(true);
            return;
        }

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
        uint256 amountOut = 100 * 1e6;  // 100 USDC
        uint256 amountInMaximum = 110 * 1e18;  // 110 DAI maximum

        uint256 usdcBefore = usdc.balanceOf(address(this));
        uint256 daiBefore = dai.balanceOf(address(this));

        // Skip if pool doesn't exist
        if (!dex.poolExists(DAI, USDC, FEE_100)) {
            vm.skip(true);
            return;
        }

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
        uint256 amountOut = 0.005 * 1e8;  // 0.005 WBTC
        uint256 amountInMaximum = 1500 * 1e18;  // 1500 DAI maximum

        uint256 wbtcBefore = wbtc.balanceOf(address(this));
        uint256 daiBefore = dai.balanceOf(address(this));

        // Skip if pools don't exist
        if (!dex.poolExists(DAI, WETH, FEE_3000) || !dex.poolExists(WETH, WBTC, FEE_3000)) {
            vm.skip(true);
            return;
        }

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
        uint256 amount0Desired = 100 * 1e18;  // Reduced amounts for testnet
        uint256 amount1Desired = 100 * 1e6; 
        int24 tickLower = -120;
        int24 tickUpper = 120;

        // Skip if pool doesn't exist
        if (!dex.poolExists(DAI, USDC, FEE_100)) {
            vm.skip(true);
            return;
        }

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
        uint256 amount1Desired = 0.5 * 1e18;  // Reduced WETH amount
        int24 tickLower = -60;
        int24 tickUpper = 60;

        // Skip if pool doesn't exist
        if (!dex.poolExists(USDC, WETH, FEE_500)) {
            vm.skip(true);
            return;
        }

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
        // Skip if pool doesn't exist
        if (!dex.poolExists(DAI, USDC, FEE_100)) {
            vm.skip(true);
            return;
        }

        (uint256 tokenId,,,) = dex.addLiquidity(
            DAI,
            USDC,
            FEE_100,
            -120,
            120,
            100 * 1e18,  // Reduced amounts
            100 * 1e6,
            0,
            0
        );

        (,,,,,uint128 initialLiquidity) = dex.getPositionInfo(tokenId);

        (uint128 liquidityDelta, uint256 amount0, uint256 amount1) = 
        dex.increaseLiquidity(
            tokenId,
            50 * 1e18,  // Reduced amounts
            50 * 1e6,  
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
        // Skip if pool doesn't exist
        if (!dex.poolExists(DAI, USDC, FEE_100)) {
            vm.skip(true);
            return;
        }

        (uint256 tokenId, uint128 liquidity,,) = dex.addLiquidity(
            DAI,
            USDC,
            FEE_100,
            -120,
            120,
            100 * 1e18,  // Reduced amounts
            100 * 1e6,
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

        (,,,,,uint128 remainingLiquidity) = dex.getPositionInfo(tokenId);
        assertEq(remainingLiquidity, 0);
    }

    // ====== VIEW FUNCTION TESTS ======

   

    
    
    function test_getUserPositions() public {
        uint256[] memory positions = dex.getUserPositions(address(this));
        assertEq(positions.length, 0);

        // Skip if pool doesn't exist
        if (!dex.poolExists(DAI, USDC, FEE_100)) {
            vm.skip(true);
            return;
        }

        (uint256 tokenId,,,) = dex.addLiquidity(
            DAI,
            USDC,
            FEE_100,
            -120,
            120,
            100 * 1e18,
            100 * 1e6,
            0,
            0
        );

        positions = dex.getUserPositions(address(this));
        assertEq(positions.length, 1);
        assertEq(positions[0], tokenId);
    }

    function test_getPositionInfo() public {
        // Skip if pool doesn't exist
        if (!dex.poolExists(DAI, USDC, FEE_100)) {
            vm.skip(true);
            return;
        }

        (uint256 tokenId,,,) = dex.addLiquidity(
            DAI,
            USDC,
            FEE_100,
            -120,
            120,
            100 * 1e18,
            100 * 1e6,
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
            100 * 1e18,
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
            100 * 1e6,
            100 * 1e18,
            0,
            0
        );
    }

    // ====== SEPOLIA-SPECIFIC HELPER FUNCTIONS ======

    function test_checkTokenBalances() public view {
        console2.log("=== Token Balances ===");
        console2.log("DAI balance:", dai.balanceOf(address(this)));
        console2.log("USDC balance:", usdc.balanceOf(address(this)));
        console2.log("WETH balance:", weth.balanceOf(address(this)));
        console2.log("WBTC balance:", wbtc.balanceOf(address(this)));
    }

    function test_checkPoolExistence() public view {
        console2.log("=== Pool Existence Check ===");
        console2.log("DAI/USDC (100):", dex.poolExists(DAI, USDC, FEE_100));
        console2.log("DAI/USDC (500):", dex.poolExists(DAI, USDC, FEE_500));
        console2.log("USDC/WETH (500):", dex.poolExists(USDC, WETH, FEE_500));
        console2.log("DAI/WETH (3000):", dex.poolExists(DAI, WETH, FEE_3000));
        console2.log("WETH/WBTC (3000):", dex.poolExists(WETH, WBTC, FEE_3000));
    }
}
