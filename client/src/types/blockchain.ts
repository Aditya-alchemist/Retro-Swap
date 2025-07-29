export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMinimum: string;
  fee?: number;
  tokenMid?: string;
  fee1?: number;
  fee2?: number;
}

export interface LiquidityParams {
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  amount0Desired: string;
  amount1Desired: string;
  amount0Min: string;
  amount1Min: string;
}

export interface Position {
  tokenId: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
}

export interface Pool {
  token0: TokenInfo;
  token1: TokenInfo;
  fee: number;
  liquidity: string;
  sqrtPriceX96: string;
  tick: number;
}

export interface SwapRoute {
  path: string[];
  fees: number[];
  isMultiHop: boolean;
}
