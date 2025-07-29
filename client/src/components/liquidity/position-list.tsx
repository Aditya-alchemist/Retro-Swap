import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RetroWindow } from '../ui/retro-window';
import { RetroButton } from '../ui/retro-button';
import { useUserPositions } from '../../hooks/use-tokens';
import { blockchainService } from '../../services/blockchain';
import { tokenService } from '../../services/token';
import { useToast } from '../../hooks/use-toast';

export function PositionList() {
  const { data: positions = [], isLoading } = useUserPositions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const removeLiquidityMutation = useMutation({
    mutationFn: async ({ tokenId, liquidity }: { tokenId: string; liquidity: string }) => {
      // Remove 100% of liquidity for simplicity
      return await blockchainService.removeLiquidity(
        tokenId,
        liquidity,
        '0', // minimum amount0
        '0'  // minimum amount1
      );
    },
    onSuccess: (txHash) => {
      toast({
        title: "Liquidity Removed Successfully!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/token-balances'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Remove Liquidity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <RetroWindow 
        title="MY POSITIONS"
        icon={<i className="fas fa-wallet"></i>}
        gradient="linear-gradient(135deg, #90EE90 0%, #32CD32 100%)"
      >
        <div className="p-6 text-center">Loading positions...</div>
      </RetroWindow>
    );
  }

  return (
    <RetroWindow 
      title="MY POSITIONS"
      icon={<i className="fas fa-wallet"></i>}
      gradient="linear-gradient(135deg, #90EE90 0%, #32CD32 100%)"
    >
      <div className="p-6">
        {positions.length === 0 ? (
          <div className="text-center text-gray-600 font-retro">
            No liquidity positions found
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((position) => {
              const token0Info = tokenService.getTokenByAddress(position.token0);
              const token1Info = tokenService.getTokenByAddress(position.token1);
              const feeDisplay = (position.fee / 10000).toFixed(2);
              
              return (
                <div key={position.tokenId} className="retro-card rounded p-4" data-testid={`position-${position.tokenId}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-bold">
                      {token0Info?.symbol || 'Unknown'}/{token1Info?.symbol || 'Unknown'}
                    </div>
                    <div className="px-2 py-1 bg-green-200 border border-black rounded text-sm">
                      {feeDisplay}%
                    </div>
                  </div>
                  <div className="text-sm space-y-1 font-retro">
                    <div>Token ID: {position.tokenId}</div>
                    <div>Liquidity: {tokenService.formatTokenAmount(position.liquidity, 0)}</div>
                    <div>Tick Range: {position.tickLower} to {position.tickUpper}</div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <RetroButton 
                      size="sm"
                      className="flex-1"
                      disabled
                      data-testid={`increase-${position.tokenId}`}
                    >
                      Increase
                    </RetroButton>
                    <RetroButton 
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      onClick={() => removeLiquidityMutation.mutate({
                        tokenId: position.tokenId,
                        liquidity: position.liquidity
                      })}
                      disabled={removeLiquidityMutation.isPending}
                      data-testid={`remove-${position.tokenId}`}
                    >
                      {removeLiquidityMutation.isPending ? 'Removing...' : 'Remove'}
                    </RetroButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RetroWindow>
  );
}
