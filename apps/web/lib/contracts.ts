import { Address } from "viem"

export const CONTRACTS = {
  baseSepolia: {
    Hyperlinkgrid: "0x68417a315aFf80a7f0C8F7230B9B8eb37271e46E" as Address,
    USDC: "0xa731cECEa2CA0BfeB11328A4598202f736168997" as Address,
  },
}

export const HYPERLINKGRID_ABI = [
  {
    inputs: [
      { name: "_color", type: "uint24" },
      { name: "_url", type: "string" }
    ],
    name: "buyNextTile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "nextId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_id", type: "uint256" }],
    name: "getTile",
    outputs: [
      {
        components: [
          { name: "url", type: "string" },
          { name: "color", type: "uint24" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "startId", type: "uint256" },
      { name: "count", type: "uint256" }
    ],
    name: "getTilesBatch",
    outputs: [
      {
        components: [
          { name: "url", type: "string" },
          { name: "color", type: "uint24" }
        ],
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "color", type: "uint24" },
      { indexed: false, name: "url", type: "string" }
    ],
    name: "TilePurchased",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: false, name: "color", type: "uint24" },
      { indexed: false, name: "url", type: "string" }
    ],
    name: "TileUpdated",
    type: "event"
  }
] as const;

export const MOCK_USDC_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;
