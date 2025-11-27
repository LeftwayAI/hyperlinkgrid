'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACTS, HYPERLINKGRID_ABI, MOCK_USDC_ABI } from '../../lib/contracts';
import { parseUnits } from 'viem';
import Image from 'next/image';
import AccountModal from './AccountModal';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Helper to throttle/wait
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to validate hex
const isValidHex = (hex: string) => /^#[0-9A-F]{6}$/i.test(hex);

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
  const [hoveredTile, setHoveredTile] = useState<{ id: number; url: string; color: number } | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // READ: Get Next ID
  const { data: nextId, error: nextIdError, refetch: refetchNextId } = useReadContract({
    address: CONTRACTS.baseSepolia.Hyperlinkgrid,
    abi: HYPERLINKGRID_ABI,
    functionName: 'nextId',
  });

  // Progress Calculation (NextID * $100)
  const currentRevenue = nextId ? (Number(nextId) - 1) * 100 : 0;
  const goalRevenue = 1000000; // $1M
  const progressPercentage = Math.min((currentRevenue / goalRevenue) * 100, 100);

  // Batch Fetch Tiles (Efficient)
  useEffect(() => {
    if (!publicClient || !nextId) return;

    const fetchTiles = async () => {
      const count = Number(nextId) - 1;
      if (count <= 0) return;

      try {
        // Fetch all existing tiles in one batch call
        // Note: On a real mainnet with 10k tiles, we'd pagination (e.g. chunks of 1000)
        // For MVP testnet, fetching ~50-100 at once is fine.
        const data = await publicClient.readContract({
          address: CONTRACTS.baseSepolia.Hyperlinkgrid,
          abi: HYPERLINKGRID_ABI,
          functionName: 'getTilesBatch',
          args: [BigInt(1), BigInt(count)],
        });

        // Map tuple array to object array
        const tiles = (data as any[]).map((t, idx) => ({
          id: idx + 1,
          url: t.url,
          color: t.color
        }));

        setMintedTiles(tiles);
      } catch (e) {
        console.error("Batch fetch failed", e);
      }
    };

    fetchTiles();
  }, [publicClient, nextId]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    // Allow typing # and hex chars, max 7 chars total
    if (/^#[0-9A-F]*$/.test(val) && val.length <= 7) {
      setInputColor(val);
    } else if (/^[0-9A-F]*$/.test(val) && val.length <= 6) {
      setInputColor('#' + val);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Strip https:// if pasted
    val = val.replace(/^https?:\/\//, '');
    setInputUrl(val);
  };

  const handleBuy = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!isValidHex(inputColor)) {
      console.error("Invalid Hex Color");
      return;
    }
    if (!inputUrl) {
      console.error("Please enter a URL");
      return;
    }

    setIsProcessing(true);
    setStatusMsg('Approving USDC...');
    try {
      const price = parseUnits('100', 6); // 100 USDC
      const fullUrl = `https://${inputUrl}`;

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
        args: [colorInt, fullUrl],
      });

      setStatusMsg('Confirming...');
      await publicClient?.waitForTransactionReceipt({ hash: mintHash });

      setStatusMsg('Success!');
      await delay(1000);
      refetchNextId();
      // alert("Tile Purchased Successfully!");
      setInputUrl(''); // Reset URL
    } catch (e) {
      console.error(e);
      setStatusMsg("Transaction Failed");
      // alert("Transaction Failed: " + (e as Error).message);
    } finally {
      setIsProcessing(false);
      // setStatusMsg(''); // Keep success message visible for a bit? 
      // Actually the original code cleared it. Let's clear it after a delay if it was success, or keep it if it failed?
      // Original code: finally { setIsProcessing(false); setStatusMsg(''); }
      // I'll just reset it after a short delay if I want to show success.
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-brand text-black font-sans selection:bg-black selection:text-white pt-[56px] md:pt-[72px]">
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />

      {/* HEADER - Centered and Constrained */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-center bg-brand border-b border-white/20 h-[56px] md:h-[72px]">
        <div className="w-full max-w-[1000px] px-4 md:px-8 flex justify-between items-center text-white h-full">
          <div className="relative h-8 w-48">
            <Link href="/">
              <Image src="/assets/wordmark-white.svg" fill alt="Hyperlinkgrid logo" className="drop-shadow-[0_0_16px_rgba(255,255,255,0.35)] object-contain object-left cursor-pointer" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {mounted ? (
              <button
                onClick={() => authenticated ? setIsAccountModalOpen(true) : login()}
                className="h-10 border border-white flex items-center justify-center hover:bg-white hover:text-brand transition-colors px-4"
              >
                {authenticated ? (
                  <div className="w-4 h-4 bg-current rounded-full" />
                ) : (
                  <span className="text-xs font-bold">LOG IN</span>
                )}
              </button>
            ) : (
              <button className="h-10 border border-white flex items-center justify-center px-4 opacity-50">
                <span className="text-xs font-bold">LOADING</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* PROGRESS BAR CONTAINER */}
      <div className="w-full max-w-[1000px] px-2 md:px-8 mt-3 md:mt-8">
        <div className="bg-white border border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {mounted ? (
            <div className="flex flex-col gap-2 px-1 pt-1 font-mono text-sm text-black">
              <div className="flex justify-between">
                <span><span className="font-bold">{Number(nextId) ? Number(nextId) - 1 : 0} hyperlinks</span> ongrid</span>
                <span className="text-gray-400">/ 10,000</span>
              </div>
              <div className="w-full h-4 bg-gray-100 border border-black/10 relative">
                <div className="absolute top-0 left-0 h-full bg-brand transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
              </div>
              <div className="flex justify-between">
                <span><span className="font-bold">${currentRevenue.toLocaleString()}</span> locked</span>
                <span className="text-gray-400">/ $1,000,000</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-1 pt-1 font-mono text-sm text-black opacity-50">
              <div className="flex justify-between">
                <span><span className="font-bold">0 hyperlinks</span> ongrid</span>
                <span className="text-gray-400">/ 10,000</span>
              </div>
              <div className="w-full h-4 bg-gray-100 border border-black/10 relative">
                <div className="absolute top-0 left-0 h-full bg-brand transition-all duration-1000" style={{ width: '0%' }} />
              </div>
              <div className="flex justify-between">
                <span><span className="font-bold">$0</span> locked</span>
                <span className="text-gray-400">/ $1,000,000</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full max-w-[1000px] px-2 md:px-8 py-3 md:py-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8">

        {/* GRID VISUALIZATION - First on mobile */}
        <div className="md:col-span-2 md:order-2 bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] aspect-square relative overflow-hidden">
          {/* 
            TODO: Future Mobile Navigation Improvements
            - Implement zoom in/out functionality (pinch-to-zoom)
            - Pan support for better mobile navigation
          */}
          {/* SVG Grid Renderer for perfect pixel alignment */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            preserveAspectRatio="xMinYMin meet"
          >
            {/* Background */}
            <rect x="0" y="0" width="100" height="100" fill="white" />

            {/* Minted Tiles */}
            {mintedTiles.map((tile) => (
              <a
                key={tile.id}
                href={tile.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredTile(tile)}
                onMouseLeave={() => setHoveredTile(null)}
              >
                <rect
                  x={(tile.id - 1) % 100}
                  y={Math.floor((tile.id - 1) / 100)}
                  width="1"
                  height="1"
                  fill={`#${tile.color.toString(16).padStart(6, '0')}`}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              </a>
            ))}

            {/* Next Tile Placeholder (Flashing) */}
            {nextId && (
              <rect
                x={(Number(nextId) - 1) % 100}
                y={Math.floor((Number(nextId) - 1) / 100)}
                width="1"
                height="1"
                fill={isValidHex(inputColor) ? inputColor : '#000000'}
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Hover Tooltip */}
          {hoveredTile && (
            <div
              className="absolute z-20 pointer-events-none"
              style={{
                left: `${((hoveredTile.id - 1) % 100) + 0.5}%`,
                top: `${Math.floor((hoveredTile.id - 1) / 100)}%`,
                transform: 'translate(-50%, -100%)',
                marginTop: '-8px'
              }}
            >
              <div className="bg-black text-white text-[10px] font-mono py-1 px-2 whitespace-nowrap shadow-lg relative">
                {hoveredTile.url}
                {/* Arrow */}
                <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-black transform -translate-x-1/2 rotate-45" />
              </div>
            </div>
          )}

          {/* Overlay if empty */}
          {mintedTiles.length === 0 && !nextId && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {nextIdError ? (
                <div className="bg-white p-4 border border-red-500 text-red-500 font-mono text-xs max-w-md pointer-events-auto">
                  <p className="font-bold mb-2">ERROR CONNECTING TO GRID</p>
                  <p>{nextIdError.message}</p>
                </div>
              ) : (
                <p className="text-brand animate-pulse font-bold bg-white p-4 border border-brand shadow-lg">CONNECTING TO GRID...</p>
              )}
            </div>
          )}
        </div>

        {/* CONTROLS - Second on mobile, first in DOM for desktop order */}
        <div className="md:order-1 bg-white border border-black p-4 md:p-6 h-full flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">

          <div>
            <h2 className="font-bold text-sm font-mono">Add the next hyperlink</h2>

            {/* CUSTOMIZE */}
            <div className="pt-4 space-y-4 mb-4 md:mb-6">
              {/* URL Input */}
              <div className="relative flex items-center border border-black focus-within:ring-1 focus-within:ring-brand">
                <span className="pl-3 pr-1 text-gray-400 text-base select-none font-mono tracking-tighter">https://</span>
                <input
                  type="text"
                  placeholder="hyperlinkgrid.xyz"
                  className="w-full p-2 pl-0 text-base focus:outline-none font-mono bg-transparent tracking-tighter"
                  value={inputUrl}
                  onChange={handleUrlChange}
                />
              </div>

              {/* Color Input */}
              <div className="flex gap-2 w-full min-w-0">
                <div className="relative w-10 h-10 shrink-0 border border-black cursor-pointer overflow-hidden group">
                  <input
                    type="color"
                    className="absolute -top-2 -left-2 w-16 h-16 p-0 cursor-pointer opacity-0"
                    value={inputColor}
                    onChange={(e) => setInputColor(e.target.value)}
                  />
                  <div className="w-full h-full" style={{ backgroundColor: inputColor }} />
                </div>
                <input
                  type="text"
                  value={inputColor}
                  onChange={handleColorChange}
                  className={`flex-1 min-w-0 border border-black px-3 font-mono text-base focus:outline-none focus:ring-1 ${isValidHex(inputColor) ? 'focus:ring-brand' : 'focus:ring-red-500 text-red-500'}`}
                  maxLength={7}
                />
              </div>
            </div>

            {/* PREVIEW */}
            <div className="mb-4 md:mb-6">
              <label className="block text-xs font-bold mb-2 uppercase tracking-wider text-gray-400">Preview</label>
              <div
                className="w-full aspect-square border border-black relative overflow-hidden transition-colors duration-300 group flex items-center justify-center"
                style={{ backgroundColor: isValidHex(inputColor) ? inputColor : '#FFFFFF' }}
              >
                {inputUrl && (
                  <a
                    href={`https://${inputUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white mix-blend-difference pointer-events-auto hover:underline decoration-white"
                  >
                    <span className="text-xs font-bold uppercase tracking-wide">Preview link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ACTION */}
          <div>
            <button
              onClick={handleBuy}
              disabled={isProcessing}
              className="w-full bg-brand text-white border border-black py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
            >
              {isProcessing ? (statusMsg || "Processing...") : authenticated ? "Buy for $100" : "Log in to buy · $100"}
            </button>
          </div>
        </div>
      </div>

    </main>
  );
}
