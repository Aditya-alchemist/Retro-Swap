// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

// Tokens on Sepolia
address constant WETH = 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14;
address constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238; // USDC (6 decimals)
address constant USDT = 0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0; // USDT (6 decimals)
address constant DAI = 0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6; // DAI (18 decimals)
address constant WBTC = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC (8 decimals)

// Uniswap V2 on Sepolia
address constant UNISWAP_V2_ROUTER_02 = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
address constant UNISWAP_V2_FACTORY = 0x7E0987E5b3a30e3f2828572Bb659A548460a3003;

// Uniswap V3 on Sepolia
address constant UNISWAP_V3_FACTORY = 0x0227628f3F023bb0B980b67D528571c95c6DaC1c;
address constant UNISWAP_V3_NONFUNGIBLE_POSITION_MANAGER = 0x1238536071E1c677A632429e3655c799b22cDA52;
address constant UNISWAP_V3_SWAP_ROUTER_02 = 0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E;

// Note: Specific pool addresses on Sepolia would need to be looked up individually
// as they are created dynamically and may not exist for all pairs
// You can find pool addresses using the factory contract or Uniswap interface

// Common Sepolia V3 Pools (if they exist):
// These addresses may not be accurate and should be verified:
address constant UNISWAP_V3_POOL_WETH_USDC_500 = address(0); // Need to verify
address constant UNISWAP_V3_POOL_WETH_USDC_3000 = address(0); // Need to verify

// Sushiswap on Sepolia (if deployed):
// Note: Sushiswap may not be fully deployed on Sepolia
address constant SUSHISWAP_V2_FACTORY = address(0); // Not available on Sepolia
address constant SUSHISWAP_V2_ROUTER_02 = address(0); // Not available on Sepolia
