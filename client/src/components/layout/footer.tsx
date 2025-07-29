import { RetroWindow } from '../ui/retro-window';

export function Footer() {
  return (
    <footer className="relative z-30 mt-12 pb-8" data-testid="footer">
      <div className="max-w-6xl mx-auto px-4">
        <RetroWindow 
          title=""
          gradient="linear-gradient(135deg, #8A2BE2 0%, #FF69B4 100%)"
        >
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="font-display text-lg font-bold mb-3">RETROSWAP DEX</div>
                <div className="text-sm font-retro text-gray-600">
                  The most radical DeFi experience with Uniswap V3 type contract. Trade tokens, provide liquidity, and earn fees in the most retro way possible.
                </div>
              </div>
              <div>
                <div className="font-display font-bold mb-3">QUICK LINKS</div>
                <div className="space-y-2 text-sm font-retro">
                  <div><a href="https://github.com/Aditya-alchemist/Retro-Swap" className="hover:text-retro-purple">Docs</a></div>
                  <div><a href="https://github.com/Aditya-alchemist/Retro-Swap" className="hover:text-retro-purple">Support</a></div>
                  <div><a href="https://x.com/Adityaalchemist" className="hover:text-retro-purple">Twitter</a></div>
                </div>
              </div>
              <div>
                <div className="font-display font-bold mb-3">CONTRACT INFO</div>
                <div className="text-xs font-retro text-gray-600 break-all">
                  <div>DEX: 0x04d21AB7ED0B2F3d1f5Db4235Af692AA24185668</div>
                  <div>Network: Sepolia Testnet</div>
                  <div>Status: <span className="text-green-600 font-bold">ACTIVE</span></div>
                </div>
              </div>
            </div>
          </div>
        </RetroWindow>
      </div>
    </footer>
  );
}
