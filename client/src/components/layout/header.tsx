import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { RetroWindow } from '../ui/retro-window';
import { RetroButton } from '../ui/retro-button';
import { useWallet } from '../../hooks/use-wallet';

export function Header() {
  const [location] = useLocation();
  const { isConnected, address, isConnecting, connect, formatAddress, error } = useWallet();

  const isActive = (path: string) => location === path;

  return (
    <header className="relative z-40 p-4" data-testid="header">
      <div className="max-w-6xl mx-auto">
        <RetroWindow 
          title="RetroSwap DEX "
          titleGradient="linear-gradient(90deg, #00FFFF 0%, #8A2BE2 100%)"
        >
          <div className="p-4">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              {/* Navigation */}
              <nav className="flex space-x-2" data-testid="navigation">
                <Link href="/">
                  <RetroButton 
                    variant={isActive('/') ? 'success' : 'primary'}
                    className={isActive('/') ? 'bg-retro-yellow' : ''}
                    data-testid="nav-swap"
                  >
                    <i className="fas fa-exchange-alt mr-2"></i>SWAP
                  </RetroButton>
                </Link>
                <Link href="/liquidity">
                  <RetroButton 
                    variant={isActive('/liquidity') ? 'success' : 'primary'}
                    className={isActive('/liquidity') ? 'bg-retro-yellow' : ''}
                    data-testid="nav-liquidity"
                  >
                    <i className="fas fa-tint mr-2"></i>LIQUIDITY
                  </RetroButton>
                </Link>
                <Link href="/pools">
                  <RetroButton 
                    variant={isActive('/pools') ? 'success' : 'primary'}
                    className={isActive('/pools') ? 'bg-retro-yellow' : ''}
                    data-testid="nav-pools"
                  >
                    <i className="fas fa-chart-line mr-2"></i>POOLS
                  </RetroButton>
                </Link>
              </nav>
              
              {/* Wallet Connection */}
              <div className="flex items-center space-x-4">
                <div className="bg-green-200 border-2 border-black px-3 py-1 rounded" data-testid="network-indicator">
                  <span className="font-retro text-sm">Sepolia Testnet</span>
                </div>
                <RetroButton
                  onClick={connect}
                  disabled={isConnecting}
                  variant={isConnected ? 'success' : 'primary'}
                  data-testid="connect-wallet"
                >
                  <i className="fas fa-wallet mr-2"></i>
                  {isConnecting ? 'CONNECTING...' : 
                   isConnected ? formatAddress || 'CONNECTED' : 'CONNECT WALLET'}
                </RetroButton>
                {error && (
                  <div className="text-red-600 text-sm font-retro" data-testid="wallet-error">
                    {error}
                  </div>
                )}
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center justify-center mt-4 space-x-2">
              <span className="text-green-600 font-retro text-sm animate-blink">●</span>
              <span className="text-black font-bold">ONLINE</span>
            </div>
          </div>
        </RetroWindow>
      </div>
    </header>
  );
}
