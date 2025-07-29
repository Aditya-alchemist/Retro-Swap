import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RetroWindow } from '../ui/retro-window';
import { RetroButton } from '../ui/retro-button';
import { useTokenBalances } from '../../hooks/use-tokens';
import { useWallet } from '../../hooks/use-wallet';
import { blockchainService, SUPPORTED_TOKENS } from '../../services/blockchain';
import { tokenService } from '../../services/token';
import { useToast } from '../../hooks/use-toast';

export function AddLiquidity() {
  const [token0, setToken0] = useState('');
  const [token1, setToken1] = useState('');
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [selectedFee, setSelectedFee] = useState(3000);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const { isConnected } = useWallet();
  const { data: balances } = useTokenBalances();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addLiquidityMutation = useMutation({
    mutationFn: async () => {
      if (!token0 || !token1 || !amount0 || !amount1) {
        throw new Error('Please fill in all required fields');
      }

      // Calculate tick values from price range (simplified)
      const tickLower = minPrice ? Math.floor(Math.log(parseFloat(minPrice)) / Math.log(1.0001)) : -887272;
      const tickUpper = maxPrice ? Math.floor(Math.log(parseFloat(maxPrice)) / Math.log(1.0001)) : 887272;

      return await blockchainService.addLiquidity({
        token0,
        token1,
        fee: selectedFee,
        tickLower,
        tickUpper,
        amount0Desired: amount0,
        amount1Desired: amount1,
        amount0Min: (parseFloat(amount0) * 0.95).toString(), // 5% slippage
        amount1Min: (parseFloat(amount1) * 0.95).toString()  // 5% slippage
      });
    },
    onSuccess: (txHash) => {
      toast({
        title: "Liquidity Added Successfully!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/token-balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-positions'] });
      // Reset form
      setAmount0('');
      setAmount1('');
      setMinPrice('');
      setMaxPrice('');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Liquidity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const tokenOptions = Object.values(SUPPORTED_TOKENS);
  const feeOptions = [
    { value: 500, label: '0.05%' },
    { value: 3000, label: '0.30%' },
    { value: 10000, label: '1.00%' }
  ];

  return (
    <RetroWindow 
      title="ADD LIQUIDITY"
      icon={<i className="fas fa-plus-circle"></i>}
    >
      <div className="p-6">
        {/* Token Pair Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-display text-black font-bold mb-2">TOKEN A</label>
            <select 
              className="retro-input w-full px-3 py-2 rounded"
              value={token0}
              onChange={(e) => setToken0(e.target.value)}
              data-testid="token0-select"
            >
              <option value="">Select Token</option>
              {tokenOptions.map(token => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="Amount" 
              className="retro-input w-full px-3 py-2 rounded mt-2"
              value={amount0}
              onChange={(e) => setAmount0(e.target.value)}
              data-testid="amount0-input"
            />
            <div className="mt-1 text-sm text-gray-600 font-retro">
              Balance: {balances && token0 ? 
                tokenService.formatTokenAmount(
                  balances[tokenService.getTokenByAddress(token0)?.symbol || ''] || '0', 
                  18
                ) : '0.00'
              }
            </div>
          </div>
          <div>
            <label className="block font-display text-black font-bold mb-2">TOKEN B</label>
            <select 
              className="retro-input w-full px-3 py-2 rounded"
              value={token1}
              onChange={(e) => setToken1(e.target.value)}
              data-testid="token1-select"
            >
              <option value="">Select Token</option>
              {tokenOptions.map(token => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="Amount" 
              className="retro-input w-full px-3 py-2 rounded mt-2"
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              data-testid="amount1-input"
            />
            <div className="mt-1 text-sm text-gray-600 font-retro">
              Balance: {balances && token1 ? 
                tokenService.formatTokenAmount(
                  balances[tokenService.getTokenByAddress(token1)?.symbol || ''] || '0', 
                  18
                ) : '0.00'
              }
            </div>
          </div>
        </div>

        {/* Fee Tier */}
        <div className="mb-6">
          <label className="block font-display text-black font-bold mb-2">FEE TIER</label>
          <div className="grid grid-cols-3 gap-2">
            {feeOptions.map(option => (
              <RetroButton 
                key={option.value}
                variant={selectedFee === option.value ? 'success' : 'primary'}
                className="py-2 font-bold text-sm rounded"
                onClick={() => setSelectedFee(option.value)}
                data-testid={`fee-${option.value}`}
              >
                {option.label}
              </RetroButton>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6 p-4 border-2 border-dashed border-black rounded">
          <div className="font-display text-black font-bold mb-3">PRICE RANGE</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-retro mb-1">Min Price</label>
              <input 
                type="number" 
                placeholder="0.0" 
                className="retro-input w-full px-3 py-2 rounded"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                data-testid="min-price-input"
              />
            </div>
            <div>
              <label className="block text-sm font-retro mb-1">Max Price</label>
              <input 
                type="number" 
                placeholder="∞" 
                className="retro-input w-full px-3 py-2 rounded"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                data-testid="max-price-input"
              />
            </div>
          </div>
        </div>

        <RetroButton 
          className="w-full py-4 font-display text-xl font-bold rounded-lg"
          onClick={() => addLiquidityMutation.mutate()}
          disabled={!isConnected || addLiquidityMutation.isPending || !token0 || !token1 || !amount0 || !amount1}
          data-testid="add-liquidity-button"
        >
          <i className="fas fa-tint mr-2"></i>
          {addLiquidityMutation.isPending ? 'ADDING...' : 'ADD LIQUIDITY'}
        </RetroButton>
      </div>
    </RetroWindow>
  );
}
