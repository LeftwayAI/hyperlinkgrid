import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MockUSDC
  console.log("Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log(`MockUSDC deployed to: ${usdcAddress}`);

  // 2. Deploy Hyperlinkgrid
  const devTreasury = deployer.address; // Use deployer as treasury for now
  console.log(`Deploying Hyperlinkgrid with Treasury: ${devTreasury}`);
  
  const Hyperlinkgrid = await ethers.getContractFactory("Hyperlinkgrid");
  const grid = await Hyperlinkgrid.deploy(usdcAddress, devTreasury);
  await grid.waitForDeployment();
  const gridAddress = await grid.getAddress();

  console.log(`Hyperlinkgrid deployed to: ${gridAddress}`);
  
  // 3. Verify Instructions
  console.log("\nVerification Commands:");
  console.log(`npx hardhat verify --network base-sepolia ${usdcAddress}`);
  console.log(`npx hardhat verify --network base-sepolia ${gridAddress} "${usdcAddress}" "${devTreasury}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
