import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RetroWindow } from '../ui/retro-window';
import { RetroButton } from '../ui/retro-button';
import { useTokenBalances, useTokenPrices, useSwapRoute } from '../../hooks/use-tokens';
import { useWallet } from '../../hooks/use-wallet';
import { blockchainService, SUPPORTED_TOKENS } from '../../services/blockchain';
import { tokenService } from '../../services/token';
import { useToast } from '../../hooks/use-toast';

export function SwapInterface() {
  const [tokenIn, setTokenIn] = useState('');
  const [tokenOut, setTokenOut] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  
  const { isConnected } = useWallet();
  const { data: balances } = useTokenBalances();
  const { data: prices } = useTokenPrices();
  const { data: swapRoute } = useSwapRoute(tokenIn, tokenOut);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate output amount when input changes
  useEffect(() => {
    if (amountIn && tokenIn && tokenOut && prices) {
      const tokenInSymbol = tokenService.getTokenByAddress(tokenIn)?.symbol;
      const tokenOutSymbol = tokenService.getTokenByAddress(tokenOut)?.symbol;
      
      if (tokenInSymbol && tokenOutSymbol) {
        const priceIn = prices[tokenInSymbol]?.price || 0;
        const priceOut = prices[tokenOutSymbol]?.price || 0;
        
        if (priceIn > 0 && priceOut > 0) {
          const estimatedOut = (parseFloat(amountIn) * priceIn) / priceOut;
          setAmountOut(estimatedOut.toFixed(6));
        }
      }
    }
  }, [amountIn, tokenIn, tokenOut, prices]);

  const swapMutation = useMutation({
    mutationFn: async () => {
      if (!tokenIn || !tokenOut || !amountIn) {
        throw new Error('Please fill in all fields');
      }

      const minAmountOut = (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(6);
      
      if (swapRoute?.isMultiHop && swapRoute.path.length === 3) {
        return await blockchainService.executeSwap({
          tokenIn,
          tokenOut,
          tokenMid: swapRoute.path[1],
          amountIn,
          amountOutMinimum: minAmountOut,
          fee1: swapRoute.fees[0],
          fee2: swapRoute.fees[1]
        });
      } else {
        return await blockchainService.executeSwap({
          tokenIn,
          tokenOut,
          amountIn,
          amountOutMinimum: minAmountOut,
          fee: swapRoute?.fees[0] || 3000
        });
      }
    },
    onSuccess: (txHash) => {
      toast({
        title: "Swap Successful!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/token-balances'] });
      setAmountIn('');
      setAmountOut('');
    },
    onError: (error: any) => {
      toast({
        title: "Swap Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const tokenOptions = Object.values(SUPPORTED_TOKENS);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* Main Swap Interface */}
      <div className="lg:col-span-2">
        <RetroWindow 
          title="HYPER SWAP STATION"
          icon={<i className="fas fa-rocket"></i>}
        >
          <div className="p-6">
            {/* Swap Type Detection */}
            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-400 to-lime-300 rounded border-2 border-black">
              <div className="flex items-center justify-between">
                <span className="font-display text-black font-bold">AUTO-DETECT MODE</span>
                <div 
                  className={`px-3 py-1 border-2 border-black rounded font-bold ${
                    swapRoute?.isMultiHop ? 'bg-pink-400' : 'bg-yellow-400'
                  }`}
                  data-testid="swap-type-indicator"
                >
                  {swapRoute?.isMultiHop ? 'MULTI HOP' : 'SINGLE HOP'}
                </div>
              </div>
            </div>

            {/* Token From */}
            <div className="mb-4">
              <label className="block font-display text-black font-bold mb-2">FROM</label>
              <div className="retro-card rounded p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 flex-1">
                    {tokenIn && (
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-black"
                        style={{ 
                          background: tokenService.getTokenByAddress(tokenIn)?.symbol === 'WETH' ? 
                            'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' :
                            tokenService.getTokenByAddress(tokenIn)?.symbol === 'WBTC' ?
                            'linear-gradient(135deg, #F97316 0%, #EAB308 100%)' :
                            tokenService.getTokenByAddress(tokenIn)?.symbol === 'USDC' ?
                            'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)' :
                            'linear-gradient(135deg, #EAB308 0%, #F97316 100%)'
                        }}
                      ></div>
                    )}
                    <select 
                      className="retro-input flex-1 px-3 py-2 rounded border-2 border-black" 
                      value={tokenIn}
                      onChange={(e) => setTokenIn(e.target.value)}
                      data-testid="token-in-select"
                    >
                      <option value="">Select Token</option>
                      {tokenOptions.map(token => (
                        <option key={token.address} value={token.address}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="retro-input w-32 px-3 py-2 rounded text-right border-2 border-black"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    data-testid="amount-in-input"
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600 font-retro">
                  Balance: {balances && tokenIn ? 
                    tokenService.formatTokenAmount(
                      balances[tokenService.getTokenByAddress(tokenIn)?.symbol || ''] || '0', 
                      18
                    ) : '0.00'
                  }
                </div>
              </div>
            </div>

            {/* Swap Direction */}
            <div className="flex justify-center mb-4">
              <button
                className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setTokenIn(tokenOut);
                  setTokenOut(tokenIn);
                  setAmountIn(amountOut);
                  setAmountOut(amountIn);
                }}
                data-testid="swap-direction"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Token To */}
            <div className="mb-6">
              <label className="block font-display text-black font-bold mb-2">TO</label>
              <div className="retro-card rounded p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 flex-1">
                    {tokenOut && (
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-black"
                        style={{ 
                          background: tokenService.getTokenByAddress(tokenOut)?.symbol === 'WETH' ? 
                            'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' :
                            tokenService.getTokenByAddress(tokenOut)?.symbol === 'WBTC' ?
                            'linear-gradient(135deg, #F97316 0%, #EAB308 100%)' :
                            tokenService.getTokenByAddress(tokenOut)?.symbol === 'USDC' ?
                            'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)' :
                            'linear-gradient(135deg, #EAB308 0%, #F97316 100%)'
                        }}
                      ></div>
                    )}
                    <select 
                      className="retro-input flex-1 px-3 py-2 rounded border-2 border-black"
                      value={tokenOut}
                      onChange={(e) => setTokenOut(e.target.value)}
                      data-testid="token-out-select"
                    >
                      <option value="">Select Token</option>
                      {tokenOptions.map(token => (
                        <option key={token.address} value={token.address}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="retro-input w-32 px-3 py-2 rounded text-right bg-gray-100 border-2 border-black" 
                    value={amountOut}
                    readOnly
                    data-testid="amount-out-input"
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600 font-retro">
                  Balance: {balances && tokenOut ? 
                    tokenService.formatTokenAmount(
                      balances[tokenService.getTokenByAddress(tokenOut)?.symbol || ''] || '0', 
                      18
                    ) : '0.00'
                  }
                </div>
              </div>
            </div>

            {/* Slippage Settings */}
            <div className="mb-6 p-4 border-2 border-dashed border-black rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-black font-bold">SLIPPAGE TOLERANCE</span>
                <div className="flex space-x-2">
                  {[0.5, 1, 3].map(value => (
                    <button
                      key={value}
                      className={`px-3 py-1 border border-black rounded font-bold text-sm ${
                        slippage === value ? 'bg-yellow-400' : 'bg-white'
                      }`}
                      onClick={() => setSlippage(value)}
                      data-testid={`slippage-${value}`}
                    >
                      {value}%
                    </button>
                  ))}
                  <input 
                    type="number" 
                    placeholder="Custom" 
                    className="w-20 px-2 py-1 border border-black rounded text-sm"
                    onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                    data-testid="slippage-custom"
                  />
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <RetroButton 
              className="w-full py-4 font-display text-xl font-bold rounded-lg" 
              onClick={() => swapMutation.mutate()}
              disabled={!isConnected || swapMutation.isPending || !tokenIn || !tokenOut || !amountIn}
              data-testid="execute-swap"
            >
              <i className="fas fa-lightning-bolt mr-2"></i>
              {swapMutation.isPending ? 'EXECUTING...' : 'EXECUTE SWAP'}
            </RetroButton>
          </div>
        </RetroWindow>
      </div>

      {/* Side Panel */}
      <div className="space-y-6">
        {/* Price Info */}
        <RetroWindow 
          title="PRICE INFO"
          icon={<i className="fas fa-chart-bar"></i>}
          gradient="linear-gradient(135deg, #FFD700 0%, #FF69B4 100%)"
          titleGradient="linear-gradient(90deg, #8A2BE2 0%, #FF69B4 100%)"
        >
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-retro">Rate:</span>
                <span className="font-bold" data-testid="exchange-rate">
                  {tokenIn && tokenOut && prices ? (
                    (() => {
                      const tokenInSymbol = tokenService.getTokenByAddress(tokenIn)?.symbol;
                      const tokenOutSymbol = tokenService.getTokenByAddress(tokenOut)?.symbol;
                      if (tokenInSymbol && tokenOutSymbol) {
                        const priceIn = prices[tokenInSymbol]?.price || 0;
                        const priceOut = prices[tokenOutSymbol]?.price || 0;
                        if (priceIn > 0 && priceOut > 0) {
                          const rate = priceIn / priceOut;
                          return `1 ${tokenInSymbol} = ${rate.toFixed(6)} ${tokenOutSymbol}`;
                        }
                      }
                      return 'N/A';
                    })()
                  ) : 'Select tokens'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-retro">Price Impact:</span>
                <span className={`font-bold ${parseFloat(amountIn) > 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {parseFloat(amountIn) > 1000 ? '~0.1%' : '< 0.01%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-retro">Min Received:</span>
                <span className="font-bold" data-testid="min-received">
                  {amountOut ? (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(6) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-retro">Network Fee:</span>
                <span className="font-bold">~$2.50</span>
              </div>
            </div>
          </div>
        </RetroWindow>
      </div>
    </div>
  );
}
