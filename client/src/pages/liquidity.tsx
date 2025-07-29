import { AddLiquidity } from '../components/liquidity/add-liquidity';
import { PositionList } from '../components/liquidity/position-list';

export default function Liquidity() {
  return (
    <main className="container mx-auto px-4 py-6 relative z-30">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <AddLiquidity />
        <PositionList />
      </div>
    </main>
  );
}
