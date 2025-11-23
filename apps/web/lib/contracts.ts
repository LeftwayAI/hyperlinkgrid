import { Address } from "viem"

export const CONTRACTS = {
  baseSepolia: {
    Hyperlinkgrid: "0x18D019E8070eD8645CC9083A0c83BeFA064fBEcA" as Address,
    USDC: "0xa731cECEa2CA0BfeB11328A4598202f736168997" as Address,
  },
}

export const HYPERLINKGRID_ABI = [
  {
    inputs: [
      { name: "_usdcAddress", type: "address" },
      { name: "_entropyAddress", type: "address" },
      { name: "_entropyProvider", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "beneficiaryIds", type: "uint256[]" }
    ],
    name: "EndGameCompleted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "sequenceNumber", type: "uint64" }
    ],
    name: "EndGameRequested",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "beneficiary", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "PayoutDistributed",
    type: "event"
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
  },
  {
    inputs: [],
    name: "MAX_SUPPLY",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "beneficiaries",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
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
    name: "endGameCompleted",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "endGameSequenceNumber",
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "endGameTriggered",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getBeneficiaries",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getEntropyFee",
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
    inputs: [],
    name: "nextId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "userRandomNumber", type: "bytes32" }
    ],
    name: "triggerEndGame",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "_id", type: "uint256" },
      { name: "_newColor", type: "uint24" },
      { name: "_newUrl", type: "string" }
    ],
    name: "updateTile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
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
