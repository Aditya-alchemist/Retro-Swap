import { RetroWindow } from '../ui/retro-window';

interface Pool {
  pair: string;
  fee: string;
  tvl: string;
  volume24h: string;
  fees24h: string;
  apr: string;
  gradient: string;
}

const mockPools: Pool[] = [
  {
    pair: 'BTC/USDC',
    fee: '0.30%',
    tvl: '$245.7M',
    volume24h: '$85.2M',
    fees24h: '$255.6K',
    apr: '35.8%',
    gradient: 'linear-gradient(135deg, #F97316 0%, #EAB308 100%)'
  },
  {
    pair: 'ETH/USDC',
    fee: '0.30%',
    tvl: '$198.3M',
    volume24h: '$67.4M',
    fees24h: '$202.2K',
    apr: '29.7%',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
  },
  {
    pair: 'WETH/USDC',
    fee: '0.30%',
    tvl: '$156.7M',
    volume24h: '$45.2M',
    fees24h: '$135.6K',
    apr: '28.5%',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
  },
  {
    pair: 'WBTC/USDC',
    fee: '0.30%',
    tvl: '$89.3M',
    volume24h: '$23.1M',
    fees24h: '$69.3K',
    apr: '22.1%',
    gradient: 'linear-gradient(135deg, #F97316 0%, #EAB308 100%)'
  },
  {
    pair: 'DAI/USDC',
    fee: '0.05%',
    tvl: '$67.8M',
    volume24h: '$12.4M',
    fees24h: '$6.2K',
    apr: '5.8%',
    gradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)'
  },
  {
    pair: 'USDT/USDC',
    fee: '0.05%',
    tvl: '$112.5M',
    volume24h: '$34.8M',
    fees24h: '$17.4K',
    apr: '7.2%',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)'
  }
];

export function TopPools() {
  return (
    <RetroWindow 
      title="TOP POOLS"
      icon={<i className="fas fa-trophy"></i>}
      gradient="linear-gradient(135deg, #00FFFF 0%, #8A2BE2 100%)"
    >
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="pools-table">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left font-display font-bold p-2">POOL</th>
                <th className="text-left font-display font-bold p-2">TVL</th>
                <th className="text-left font-display font-bold p-2">24H VOLUME</th>
                <th className="text-left font-display font-bold p-2">24H FEES</th>
                <th className="text-left font-display font-bold p-2">APR</th>
              </tr>
            </thead>
            <tbody className="font-retro">
              {mockPools.map((pool, index) => (
                <tr key={index} className="border-b border-gray-200" data-testid={`pool-row-${index}`}>
                  <td className="p-2">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full border-2 border-black"
                        style={{ background: pool.gradient }}
                      ></div>
                      <div>
                        <div className="font-bold text-lg">{pool.pair}</div>
                        <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">
                          {pool.fee}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 font-bold" data-testid={`pool-tvl-${index}`}>{pool.tvl}</td>
                  <td className="p-2" data-testid={`pool-volume-${index}`}>{pool.volume24h}</td>
                  <td className="p-2 text-green-600" data-testid={`pool-fees-${index}`}>{pool.fees24h}</td>
                  <td className="p-2 font-bold text-purple-600" data-testid={`pool-apr-${index}`}>{pool.apr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RetroWindow>
  );
}
