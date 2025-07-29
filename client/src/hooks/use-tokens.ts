import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blockchainService } from '../services/blockchain';
import { coinGeckoService } from '../services/coingecko';
import { tokenService } from '../services/token';
import { useWallet } from './use-wallet';

export function useTokenBalances() {
  const { address, isConnected } = useWallet();
  
  return useQuery({
    queryKey: ['/api/token-balances', address],
    queryFn: async () => {
      if (!address || !isConnected) return {};
      
      const tokens = tokenService.getAllTokens();
      const balances: Record<string, string> = {};
      
      for (const token of tokens) {
        try {
          const balance = await blockchainService.getTokenBalance(token.address, address);
          balances[token.symbol] = balance;
        } catch (error) {
          console.error(`Error fetching balance for ${token.symbol}:`, error);
          balances[token.symbol] = '0';
        }
      }
      
      return balances;
    },
    enabled: isConnected && !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useTokenPrices() {
  return useQuery({
    queryKey: ['/api/token-prices'],
    queryFn: async () => {
      return await coinGeckoService.getSupportedTokenPrices();
    },
    refetchInterval: 120000, // Refetch every 2 minutes to avoid rate limiting
    retry: 2,
    retryDelay: 5000, // Wait 5 seconds between retries
    staleTime: 60000, // Consider data fresh for 1 minute
  });
}

export function useTokenAllowance(tokenAddress: string, spenderAddress: string) {
  const { address, isConnected } = useWallet();
  
  return useQuery({
    queryKey: ['/api/token-allowance', tokenAddress, spenderAddress, address],
    queryFn: async () => {
      if (!address || !isConnected) return '0';
      
      try {
        return await blockchainService.getTokenAllowance(tokenAddress, address, spenderAddress);
      } catch (error) {
        console.error('Error fetching allowance:', error);
        return '0';
      }
    },
    enabled: isConnected && !!address && !!tokenAddress && !!spenderAddress,
  });
}

export function useSwapRoute(tokenIn: string, tokenOut: string) {
  return useQuery({
    queryKey: ['/api/swap-route', tokenIn, tokenOut],
    queryFn: async () => {
      if (!tokenIn || !tokenOut || tokenIn === tokenOut) return null;
      
      try {
        return await blockchainService.detectSwapRoute(tokenIn, tokenOut);
      } catch (error) {
        console.error('Error detecting swap route:', error);
        return null;
      }
    },
    enabled: !!tokenIn && !!tokenOut && tokenIn !== tokenOut,
  });
}

export function useUserPositions() {
  const { address, isConnected } = useWallet();
  
  return useQuery({
    queryKey: ['/api/user-positions', address],
    queryFn: async () => {
      if (!address || !isConnected) return [];
      
      try {
        const positionIds = await blockchainService.getUserPositions(address);
        const positions = [];
        
        for (const tokenId of positionIds) {
          try {
            const positionInfo = await blockchainService.getPositionInfo(tokenId);
            positions.push(positionInfo);
          } catch (error) {
            console.error(`Error fetching position info for token ${tokenId}:`, error);
          }
        }
        
        return positions;
      } catch (error) {
        console.error('Error fetching user positions:', error);
        return [];
      }
    },
    enabled: isConnected && !!address,
    refetchInterval: 30000,
  });
}
