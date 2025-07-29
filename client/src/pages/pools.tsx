import { MarketOverview } from '../components/pools/market-overview';
import { TopPools } from '../components/pools/top-pools';
import { TokenPrices } from '../components/pools/token-prices';
import { RetroWindow } from '../components/ui/retro-window';

export default function Pools() {
  return (
    <main className="container mx-auto px-4 py-6 relative z-30">
      <div className="max-w-7xl mx-auto space-y-6">
        <MarketOverview />
        <TopPools />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TokenPrices />
          
          {/* Pool Analytics */}
          <RetroWindow 
            title="POOL ANALYTICS"
            icon={<i className="fas fa-chart-area"></i>}
            gradient="linear-gradient(135deg, #90EE90 0%, #00FFFF 100%)"
          >
            <div className="p-6">
              <div className="space-y-4">
                <div className="retro-card p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">Total Value Locked</span>
                    <span className="text-2xl font-display font-bold">$2.4B</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 border border-black">
                    <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-full rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                
                <div className="retro-card p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">24h Volume</span>
                    <span className="text-2xl font-display font-bold">$850M</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 border border-black">
                    <div className="bg-gradient-to-r from-pink-400 to-purple-400 h-full rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
                
                <div className="retro-card p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">Fees Generated</span>
                    <span className="text-2xl font-display font-bold">$2.55M</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 border border-black">
                    <div className="bg-gradient-to-r from-yellow-400 to-pink-400 h-full rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </RetroWindow>
        </div>
      </div>
    </main>
  );
}
