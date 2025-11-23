import { ethers } from "hardhat";

async function main() {
  console.log("Starting V2 deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Configuration for Base Sepolia
  const USDC_ADDRESS = "0xa731cECEa2CA0BfeB11328A4598202f736168997"; // Use existing mock if possible or deploy new
  const ENTROPY_ADDRESS = "0x41c9e39574f40ad34c79f1c99b66a45efb830d4c"; // Base Sepolia Entropy
  const ENTROPY_PROVIDER = "0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344"; // Base Sepolia Provider

  // 1. Deploy HyperlinkgridV2
  console.log("Deploying HyperlinkgridV2...");
  const HyperlinkgridV2 = await ethers.getContractFactory("HyperlinkgridV2");
  const grid = await HyperlinkgridV2.deploy(USDC_ADDRESS, ENTROPY_ADDRESS, ENTROPY_PROVIDER);
  await grid.waitForDeployment();
  const gridAddress = await grid.getAddress();

  console.log(`HyperlinkgridV2 deployed to: ${gridAddress}`);
  
  console.log("\nVerification Command:");
  console.log(`npx hardhat verify --network base-sepolia ${gridAddress} "${USDC_ADDRESS}" "${ENTROPY_ADDRESS}" "${ENTROPY_PROVIDER}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
