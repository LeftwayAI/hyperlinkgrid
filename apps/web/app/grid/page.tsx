'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACTS, HYPERLINKGRID_ABI, MOCK_USDC_ABI } from '../../lib/contracts';
import { parseUnits } from 'viem';

// Helper to throttle/wait
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export default function GridPage() {
  const { login, authenticated, user } = usePrivy();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [inputColor, setInputColor] = useState('#0000FF');
  const [inputUrl, setInputUrl] = useState('');
  const [mintedTiles, setMintedTiles] = useState<{ id: number; url: string; color: number }[]>([]);

  // READ: Get Next ID
  const { data: nextId, refetch: refetchNextId } = useReadContract({
    address: CONTRACTS.baseSepolia.Hyperlinkgrid,
    abi: HYPERLINKGRID_ABI,
    functionName: 'nextId',
  });

  // Fetch occupied tiles logic (simple loop for MVP)
  useEffect(() => {
    if (!publicClient || !nextId) return;
    
    const fetchTiles = async () => {
      const count = Number(nextId) - 1;
      if (count <= 0) return;

      const tiles = [];
      // Limit to first 100 for now to avoid rate limits in simple MVP loop
      const limit = Math.min(count, 100); 
      
      for (let i = 1; i <= limit; i++) {
        try {
          const data = await publicClient.readContract({
            address: CONTRACTS.baseSepolia.Hyperlinkgrid,
            abi: HYPERLINKGRID_ABI,
            functionName: 'getTile',
            args: [BigInt(i)],
          });
          const tile = data as { url: string; color: number };
          tiles.push({ id: i, url: tile.url, color: tile.color });
        } catch (e) {
          console.error(`Failed to fetch tile ${i}`, e);
        }
      }
      setMintedTiles(tiles);
    };

    fetchTiles();
  }, [publicClient, nextId]);

  const handleBuy = async () => {
    if (!authenticated) {
      login();
      return;
    }

    setIsProcessing(true);
    setStatusMsg('Approving USDC...');
    try {
      const price = parseUnits('100', 6); // 100 USDC
      
      // 1. Approve USDC
      const approveHash = await writeContractAsync({
        address: CONTRACTS.baseSepolia.USDC,
        abi: MOCK_USDC_ABI,
        functionName: 'approve',
        args: [CONTRACTS.baseSepolia.Hyperlinkgrid, price],
      });
      
      setStatusMsg('Waiting for Approval...');
      await publicClient?.waitForTransactionReceipt({ hash: approveHash });
      
      // 2. Buy Tile
      setStatusMsg('Minting Tile...');
      // Convert hex color #RRGGBB to decimal
      const colorInt = parseInt(inputColor.replace('#', ''), 16);
      
      const mintHash = await writeContractAsync({
        address: CONTRACTS.baseSepolia.Hyperlinkgrid,
        abi: HYPERLINKGRID_ABI,
        functionName: 'buyNextTile',
        args: [colorInt, inputUrl],
      });

      setStatusMsg('Confirming...');
      await publicClient?.waitForTransactionReceipt({ hash: mintHash });

      setStatusMsg('Success!');
      await delay(1000);
      refetchNextId();
      alert("Tile Purchased Successfully!");
    } catch (e) {
      console.error(e);
      alert("Transaction Failed: " + (e as Error).message);
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  const handleFaucet = async () => {
      if(!address) return;
      try {
          setIsProcessing(true);
          setStatusMsg("Minting Mock USDC...");
          const hash = await writeContractAsync({
              address: CONTRACTS.baseSepolia.USDC,
              abi: MOCK_USDC_ABI,
              functionName: 'mint',
              args: [address, parseUnits('1000', 6)]
          });
          await publicClient?.waitForTransactionReceipt({ hash });
          alert("Minted 1000 MockUSDC!");
      } catch(e) {
          console.error(e);
          alert("Faucet failed");
      } finally {
          setIsProcessing(false);
          setStatusMsg('');
      }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-white text-black font-sans">
      {/* HEADER */}
      <header className="w-full max-w-[1000px] flex justify-between items-end border-b border-black pb-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">HYPERLINKGRID</h1>
          <p className="text-sm text-gray-500 mt-1">BASE SEPOLIA TESTNET</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs">NEXT TILE</p>
          <p className="text-4xl font-bold">#{nextId ? nextId.toString() : "1"}</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: CONTROLS */}
        <div className="border border-black p-6 h-fit space-y-6">
          <div>
            <label className="block text-xs font-bold mb-2 uppercase">1. Status</label>
            {authenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand rounded-full"></div>
                    <p className="text-sm font-mono truncate max-w-[200px]">{user?.email?.address || address}</p>
                </div>
                <button onClick={handleFaucet} className="text-xs underline text-gray-500 hover:text-black">
                    [TESTNET ONLY] Mint 1000 MockUSDC
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Not connected</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 uppercase">2. Customize Tile</label>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="https://..." 
                className="w-full border border-black p-2 text-sm focus:outline-none focus:bg-brand/5"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <input 
                  type="color" 
                  className="h-10 w-10 border border-black p-0 cursor-pointer"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                />
                <div className="flex-1 border border-black flex items-center px-3 font-mono text-sm">
                  {inputColor.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 uppercase">3. Action</label>
            <button 
              onClick={handleBuy}
              disabled={isProcessing}
              className="w-full bg-black text-white border border-black py-3 hover:bg-brand hover:border-brand disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
            >
              {isProcessing ? (statusMsg || "PROCESSING...") : authenticated ? "APPROVE & MINT ($100)" : "LOG IN TO BUY"}
            </button>
            <p className="text-[10px] mt-2 text-gray-500 text-center">
              COST: 100 USDC • GAS: SPONSORED (TESTNET)
            </p>
          </div>
        </div>

        {/* RIGHT: GRID VISUALIZATION */}
        <div className="md:col-span-2 border border-black p-1 aspect-square bg-gray-50 relative overflow-hidden">
          <div className="w-full h-full grid grid-cols-[repeat(100,minmax(0,1fr))] grid-rows-[repeat(100,minmax(0,1fr))]">
             {/* Render minted tiles */}
             {mintedTiles.map((tile: { id: number; url: string; color: number }) => (
                 <a 
                    key={tile.id} 
                    href={tile.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full hover:opacity-80 transition-opacity border-[0.5px] border-black/10"
                    style={{ backgroundColor: `#${tile.color.toString(16).padStart(6, '0')}` }}
                    title={`#${tile.id} - ${tile.url}`}
                 />
             ))}
             
             {/* Render Next Available Tile Placeholder */}
             {nextId && (
                 <div 
                    className="bg-brand/20 animate-pulse border border-brand"
                    style={{ 
                        gridColumnStart: (Number(nextId) - 1) % 100 + 1,
                        gridRowStart: Math.floor((Number(nextId) - 1) / 100) + 1
                    }}
                 />
             )}
          </div>
          
          {/* Overlay if empty */}
          {mintedTiles.length === 0 && !nextId && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <p className="text-brand animate-pulse font-bold bg-white/80 p-2 border border-brand">LOADING GRID...</p>
              </div>
          )}
        </div>

      </div>
    </main>
  );
}

