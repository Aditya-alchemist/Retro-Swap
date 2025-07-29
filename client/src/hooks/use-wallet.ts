import { useState, useEffect } from 'react';
import { blockchainService } from '../services/blockchain';

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already connected
    if (window.ethereum && blockchainService.isConnected()) {
      setIsConnected(true);
      blockchainService.getConnectedAddress().then(setAddress).catch(console.error);
    }

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAddress(null);
      } else {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      await blockchainService.connect();
      const addr = await blockchainService.getConnectedAddress();
      setAddress(addr);
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setError(null);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    isConnected,
    address,
    isConnecting,
    error,
    connect,
    disconnect,
    formatAddress: address ? formatAddress(address) : null
  };
}
