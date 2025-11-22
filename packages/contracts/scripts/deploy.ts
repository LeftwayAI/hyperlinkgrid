import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.deployContract("HyperlinkgridTile");
  await contract.waitForDeployment();
  console.log(`HyperlinkgridTile deployed to ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

