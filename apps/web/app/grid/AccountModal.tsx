'use client';

import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACTS, MOCK_USDC_ABI } from '../../lib/contracts';
import { parseUnits } from 'viem';

export default function AccountModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  
  const [isMinting, setIsMinting] = useState(false);

  // Ensure the active wallet is set for Wagmi
  React.useEffect(() => {
    if (wallets.length > 0 && !isConnected) {
        // If we have wallets but Wagmi isn't connected, set the first one as active
        const wallet = wallets[0];
        setActiveWallet(wallet);
    }
  }, [wallets, isConnected, setActiveWallet]);

  const handleFaucet = async () => {
    if (!address) return;
    try {
      setIsMinting(true);
      const hash = await writeContractAsync({
        address: CONTRACTS.baseSepolia.USDC,
        abi: MOCK_USDC_ABI,
        functionName: 'mint',
        args: [address, parseUnits('1000', 6)]
      });
      await publicClient?.waitForTransactionReceipt({ hash });
      alert("Minted 1000 MockUSDC!");
    } catch (e) {
      console.error(e);
      alert("Faucet failed: " + (e as Error).message);
    } finally {
      setIsMinting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-end p-4 sm:p-8">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white border border-black p-6 w-full sm:w-80 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10 mt-16 sm:mt-0">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border border-transparent hover:border-black hover:bg-gray-100"
        >
          ✕
        </button>
        
        <h2 className="font-bold text-lg mb-6 uppercase tracking-wider border-b border-black pb-2">Account</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-mono uppercase block mb-1">Connected As</label>
            <p className="font-mono text-sm break-all bg-gray-50 p-2 border border-gray-200">
              {user?.email?.address || 'Wallet User'}
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-mono uppercase block mb-1">Wallet Address</label>
            <p className="font-mono text-xs break-all text-gray-600">
              {user?.wallet?.address || address || 'No Wallet Connected'}
            </p>
          </div>

           {/* Testnet Faucet */}
           <div className="pt-4 border-t border-black/10">
            <button
                onClick={handleFaucet}
                disabled={isMinting}
                className="w-full bg-brand/10 text-brand border border-brand py-2 text-xs font-mono hover:bg-brand hover:text-white transition-colors"
            >
                {isMinting ? "MINTING..." : "[TESTNET] MINT 1000 USDC"}
            </button>
          </div>

          <button 
            onClick={() => { logout(); onClose(); }}
            className="w-full border border-black py-2 text-sm font-bold hover:bg-black hover:text-white transition-colors"
          >
            DISCONNECT
          </button>
        </div>
      </div>
    </div>
  );
}
