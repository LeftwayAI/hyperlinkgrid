import { expect } from "chai";
import { ethers } from "hardhat";

describe("HyperlinkgridTile", function () {
  it("exposes the placeholder metadata", async function () {
    const factory = await ethers.deployContract("HyperlinkgridTile");
    await factory.waitForDeployment();

    expect(await factory.NAME()).to.equal("Hyperlinkgrid Tile");
    expect(await factory.version()).to.equal("0.1.0");
  });
});

