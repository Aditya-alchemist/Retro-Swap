import { RetroWindow } from '../ui/retro-window';
import { useTokenPrices } from '../../hooks/use-tokens';
import { tokenService } from '../../services/token';

const tokenDisplayInfo = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    gradient: 'linear-gradient(135deg, #F97316 0%, #EAB308 100%)'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    gradient: 'linear-gradient(135deg, #F97316 0%, #EAB308 100%)'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    gradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)'
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    gradient: 'linear-gradient(135deg, #EAB308 0%, #F97316 100%)'
  }
];

export function TokenPrices() {
  const { data: prices, isLoading } = useTokenPrices();

  if (isLoading) {
    return (
      <RetroWindow 
        title="TOKEN PRICES"
        icon={<i className="fas fa-coins"></i>}
        gradient="linear-gradient(135deg, #FF69B4 0%, #FFD700 100%)"
      >
        <div className="p-6 text-center">Loading prices...</div>
      </RetroWindow>
    );
  }

  return (
    <RetroWindow 
      title="TOKEN PRICES"
      icon={<i className="fas fa-coins"></i>}
      gradient="linear-gradient(135deg, #FF69B4 0%, #FFD700 100%)"
    >
      <div className="p-6">
        <div className="space-y-4">
          {tokenDisplayInfo.map((token) => {
            const priceData = prices?.[token.symbol];
            const price = priceData?.price || 0;
            const change24h = priceData?.change24h || 0;
            const isPositive = change24h >= 0;
            const isLoading = !prices;
            
            return (
              <div key={token.symbol} className="flex justify-between items-center p-3 retro-card rounded" data-testid={`token-price-${token.symbol.toLowerCase()}`}>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full"
                    style={{ background: token.gradient }}
                  ></div>
                  <div>
                    <div className="font-bold">{token.symbol}</div>
                    <div className="text-sm text-gray-600">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" data-testid={`price-${token.symbol.toLowerCase()}`}>
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                    ) : (
                      tokenService.formatPrice(price)
                    )}
                  </div>
                  <div 
                    className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                    data-testid={`change-${token.symbol.toLowerCase()}`}
                  >
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-3 w-12 rounded"></div>
                    ) : (
                      tokenService.formatPercentage(change24h)
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </RetroWindow>
  );
}
