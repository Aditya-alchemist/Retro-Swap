import { SUPPORTED_TOKENS, TokenInfo } from './blockchain';

export class TokenService {
  getTokenByAddress(address: string): TokenInfo | undefined {
    return Object.values(SUPPORTED_TOKENS).find(token => 
      token.address.toLowerCase() === address.toLowerCase()
    );
  }

  getTokenBySymbol(symbol: string): TokenInfo | undefined {
    return SUPPORTED_TOKENS[symbol.toUpperCase()];
  }

  getAllTokens(): TokenInfo[] {
    return Object.values(SUPPORTED_TOKENS);
  }

  formatTokenAmount(amount: string, decimals: number): string {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
    return `${(num / 1000000).toFixed(2)}M`;
  }

  formatPrice(price: number): string {
    if (price === 0) return '$0.00';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 1000) return `$${price.toFixed(2)}`;
    if (price < 1000000) return `$${(price / 1000).toFixed(2)}K`;
    return `$${(price / 1000000).toFixed(2)}M`;
  }

  formatPercentage(percentage: number): string {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  }

  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  isValidAmount(amount: string): boolean {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  }
}

export const tokenService = new TokenService();
