import { RetroWindow } from '../ui/retro-window';
import { useTokenPrices } from '../../hooks/use-tokens';
import { tokenService } from '../../services/token';

export function MarketOverview() {
  const { data: prices } = useTokenPrices();

  // Calculate mock market stats (in real app, this would come from API)
  const totalTVL = '$2.4B';
  const totalVolume = '$850M';
  const totalPools = '1,337';
  const avgAPR = '18.5%';

  return (
    <RetroWindow 
      title="MARKET OVERVIEW"
      icon={<i className="fas fa-globe"></i>}
      gradient="linear-gradient(135deg, #FFD700 0%, #FF69B4 100%)"
    >
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="retro-card p-4 text-center" data-testid="total-tvl">
            <div className="font-display text-lg font-bold">{totalTVL}</div>
            <div className="text-sm font-retro">Total TVL</div>
          </div>
          <div className="retro-card p-4 text-center" data-testid="total-volume">
            <div className="font-display text-lg font-bold">{totalVolume}</div>
            <div className="text-sm font-retro">24h Volume</div>
          </div>
          <div className="retro-card p-4 text-center" data-testid="total-pools">
            <div className="font-display text-lg font-bold">{totalPools}</div>
            <div className="text-sm font-retro">Active Pools</div>
          </div>
          <div className="retro-card p-4 text-center" data-testid="avg-apr">
            <div className="font-display text-lg font-bold">{avgAPR}</div>
            <div className="text-sm font-retro">Avg APR</div>
          </div>
        </div>
      </div>
    </RetroWindow>
  );
}
