import { ethers } from 'ethers';
import { TokenInfo, SwapParams, LiquidityParams, Position, SwapRoute } from '../types/blockchain';

const DEX_CONTRACT_ADDRESS = import.meta.env.VITE_DEX_CONTRACT_ADDRESS || '0x04d21AB7ED0B2F3d1f5Db4235Af692AA24185668';
const SWAP_ROUTER_ADDRESS = import.meta.env.VITE_SWAP_ROUTER_ADDRESS || '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';
const NFT_MANAGER_ADDRESS = import.meta.env.VITE_NFT_MANAGER_ADDRESS || '0x1238536071E1c677A632429e3655c799b22cDA52';
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS || '0x0227628f3F023bb0B980b67D528571c95c6DaC1c';

const DEX_ABI = [
  // Swap functions
  "function swapExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint256 amountOutMinimum) external returns (uint256 amountOut)",
  "function swapExactInput(address tokenIn, address tokenMid, address tokenOut, uint24 fee1, uint24 fee2, uint256 amountIn, uint256 amountOutMinimum) external returns (uint256 amountOut)",
  "function swapExactOutputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint256 amountInMaximum) external returns (uint256 amountIn)",
  "function swapExactOutput(address tokenIn, address tokenMid, address tokenOut, uint24 fee1, uint24 fee2, uint256 amountOut, uint256 amountInMaximum) external returns (uint256 amountIn)",
  
  // Liquidity functions
  "function addLiquidity(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min) external returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
  "function increaseLiquidity(uint256 tokenId, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min) external returns (uint128 liquidity, uint256 amount0, uint256 amount1)",
  "function removeLiquidity(uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min) external returns (uint256 amount0, uint256 amount1)",
  
  // View functions
  "function getSpotPrice(address token0, address token1, uint24 fee) external view returns (uint256 price)",
  "function getUserPositions(address user) external view returns (uint256[] memory)",
  "function poolExists(address token0, address token1, uint24 fee) external view returns (bool exists)",
  "function getPositionInfo(uint256 tokenId) external view returns (address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

export const SUPPORTED_TOKENS: Record<string, TokenInfo> = {
  USDC: {
    address: import.meta.env.VITE_USDC_ADDRESS || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6
  },
  WETH: {
    address: import.meta.env.VITE_WETH_ADDRESS || '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18
  },
  WBTC: {
    address: import.meta.env.VITE_WBTC_ADDRESS || '0x29f2D40B0605204364af54EC677bD022dA425d03',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8
  },
  DAI: {
    address: import.meta.env.VITE_DAI_ADDRESS || '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18
  }
};

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private dexContract: ethers.Contract | null = null;

  async connect(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    await this.provider.send('eth_requestAccounts', []);
    this.signer = await this.provider.getSigner();
    
    this.dexContract = new ethers.Contract(DEX_CONTRACT_ADDRESS, DEX_ABI, this.signer);

    // Switch to Sepolia testnet
    const chainId = await this.provider.getNetwork();
    if (chainId.chainId !== 11155111n) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
        });
      } catch (error: any) {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }]
          });
        }
      }
    }
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not connected');
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();
    
    return ethers.formatUnits(balance, decimals);
  }

  async getTokenAllowance(tokenAddress: string, userAddress: string, spenderAddress: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not connected');
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const allowance = await tokenContract.allowance(userAddress, spenderAddress);
    const decimals = await tokenContract.decimals();
    
    return ethers.formatUnits(allowance, decimals);
  }

  async approveToken(tokenAddress: string, spenderAddress: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('Signer not available');
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
    const decimals = await tokenContract.decimals();
    const amountBN = ethers.parseUnits(amount, decimals);
    
    const tx = await tokenContract.approve(spenderAddress, amountBN);
    await tx.wait();
    
    return tx.hash;
  }

  async detectSwapRoute(tokenIn: string, tokenOut: string): Promise<SwapRoute> {
    if (!this.dexContract) throw new Error('Contract not initialized');

    // Check direct pools first
    const directPools = [
      { fee: 500, exists: false },
      { fee: 3000, exists: false },
      { fee: 10000, exists: false }
    ];

    for (const pool of directPools) {
      try {
        pool.exists = await this.dexContract.poolExists(tokenIn, tokenOut, pool.fee);
        if (pool.exists) {
          return {
            path: [tokenIn, tokenOut],
            fees: [pool.fee],
            isMultiHop: false
          };
        }
      } catch (error) {
        console.error('Error checking pool existence:', error);
      }
    }

    // If no direct pool, try multi-hop through WETH or USDC
    const intermediateTokens = [SUPPORTED_TOKENS.WETH.address, SUPPORTED_TOKENS.USDC.address];
    
    for (const intermediate of intermediateTokens) {
      if (intermediate === tokenIn || intermediate === tokenOut) continue;
      
      try {
        const pool1Exists = await this.dexContract.poolExists(tokenIn, intermediate, 3000);
        const pool2Exists = await this.dexContract.poolExists(intermediate, tokenOut, 3000);
        
        if (pool1Exists && pool2Exists) {
          return {
            path: [tokenIn, intermediate, tokenOut],
            fees: [3000, 3000],
            isMultiHop: true
          };
        }
      } catch (error) {
        console.error('Error checking multi-hop route:', error);
      }
    }

    throw new Error('No swap route found');
  }

  async executeSwap(params: SwapParams): Promise<string> {
    if (!this.dexContract || !this.signer) throw new Error('Contract or signer not available');

    const userAddress = await this.signer.getAddress();
    
    // Check and approve tokens if needed
    const tokenContract = new ethers.Contract(params.tokenIn, ERC20_ABI, this.signer);
    const decimals = await tokenContract.decimals();
    const amountBN = ethers.parseUnits(params.amountIn, decimals);
    
    const allowance = await this.getTokenAllowance(params.tokenIn, userAddress, DEX_CONTRACT_ADDRESS);
    if (parseFloat(allowance) < parseFloat(params.amountIn)) {
      await this.approveToken(params.tokenIn, DEX_CONTRACT_ADDRESS, params.amountIn);
    }

    let tx;
    if (params.tokenMid) {
      // Multi-hop swap
      tx = await this.dexContract.swapExactInput(
        params.tokenIn,
        params.tokenMid,
        params.tokenOut,
        params.fee1 || 3000,
        params.fee2 || 3000,
        amountBN,
        ethers.parseUnits(params.amountOutMinimum, await this.getTokenDecimals(params.tokenOut))
      );
    } else {
      // Single hop swap
      tx = await this.dexContract.swapExactInputSingle(
        params.tokenIn,
        params.tokenOut,
        params.fee || 3000,
        amountBN,
        ethers.parseUnits(params.amountOutMinimum, await this.getTokenDecimals(params.tokenOut))
      );
    }

    await tx.wait();
    return tx.hash;
  }

  async addLiquidity(params: LiquidityParams): Promise<string> {
    if (!this.dexContract || !this.signer) throw new Error('Contract or signer not available');

    const userAddress = await this.signer.getAddress();
    
    // Approve both tokens
    const decimals0 = await this.getTokenDecimals(params.token0);
    const decimals1 = await this.getTokenDecimals(params.token1);
    
    const allowance0 = await this.getTokenAllowance(params.token0, userAddress, DEX_CONTRACT_ADDRESS);
    const allowance1 = await this.getTokenAllowance(params.token1, userAddress, DEX_CONTRACT_ADDRESS);
    
    if (parseFloat(allowance0) < parseFloat(params.amount0Desired)) {
      await this.approveToken(params.token0, DEX_CONTRACT_ADDRESS, params.amount0Desired);
    }
    
    if (parseFloat(allowance1) < parseFloat(params.amount1Desired)) {
      await this.approveToken(params.token1, DEX_CONTRACT_ADDRESS, params.amount1Desired);
    }

    const tx = await this.dexContract.addLiquidity(
      params.token0,
      params.token1,
      params.fee,
      params.tickLower,
      params.tickUpper,
      ethers.parseUnits(params.amount0Desired, decimals0),
      ethers.parseUnits(params.amount1Desired, decimals1),
      ethers.parseUnits(params.amount0Min, decimals0),
      ethers.parseUnits(params.amount1Min, decimals1)
    );

    await tx.wait();
    return tx.hash;
  }

  async getUserPositions(userAddress: string): Promise<string[]> {
    if (!this.dexContract) throw new Error('Contract not initialized');
    
    return await this.dexContract.getUserPositions(userAddress);
  }

  async getPositionInfo(tokenId: string): Promise<Position> {
    if (!this.dexContract) throw new Error('Contract not initialized');
    
    const info = await this.dexContract.getPositionInfo(tokenId);
    return {
      tokenId,
      token0: info[0],
      token1: info[1],
      fee: info[2],
      tickLower: info[3],
      tickUpper: info[4],
      liquidity: ethers.formatUnits(info[5], 0)
    };
  }

  async getSpotPrice(token0: string, token1: string, fee: number): Promise<string> {
    if (!this.dexContract) throw new Error('Contract not initialized');
    
    const price = await this.dexContract.getSpotPrice(token0, token1, fee);
    return ethers.formatUnits(price, 18);
  }

  private async getTokenDecimals(tokenAddress: string): Promise<number> {
    if (!this.provider) throw new Error('Provider not connected');
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    return await tokenContract.decimals();
  }

  getConnectedAddress(): Promise<string> {
    if (!this.signer) throw new Error('Signer not available');
    return this.signer.getAddress();
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }
}

export const blockchainService = new BlockchainService();
