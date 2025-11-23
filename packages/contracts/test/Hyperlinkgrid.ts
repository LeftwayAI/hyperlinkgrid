import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Hyperlinkgrid", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    // 1. Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    // 2. Deploy Grid
    const Hyperlinkgrid = await ethers.getContractFactory("Hyperlinkgrid");
    const grid = await Hyperlinkgrid.deploy(await usdc.getAddress(), owner.address);
    await grid.waitForDeployment();

    return { grid, usdc, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should start with nextId = 1", async function () {
      const { grid } = await loadFixture(deployFixture);
      expect(await grid.nextId()).to.equal(1);
    });

    it("Should set the right treasury", async function () {
      const { grid, owner } = await loadFixture(deployFixture);
      expect(await grid.devTreasury()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should fail if user has no USDC", async function () {
      const { grid, otherAccount } = await loadFixture(deployFixture);
      // try buying without any usdc or approval
      // NOTE: OpenZeppelin 5.x might use custom errors, but MockUSDC is standard ERC20.
      // It usually fails with ERC20InsufficientAllowance because transferFrom is called first.
      await expect(
        grid.connect(otherAccount).buyNextTile(0xFFFFFF, "google.com")
      ).to.be.reverted;
    });

    it("Should fail if user has USDC but didn't approve", async function () {
      const { grid, usdc, otherAccount } = await loadFixture(deployFixture);
      
      // Mint 1000 USDC to otherAccount
      await usdc.mint(otherAccount.address, ethers.parseUnits("1000", 6));

      await expect(
        grid.connect(otherAccount).buyNextTile(0xFFFFFF, "google.com")
      ).to.be.revertedWithCustomError(usdc, "ERC20InsufficientAllowance");
    });

    it("Should succeed if user approves and pays", async function () {
      const { grid, usdc, otherAccount, owner } = await loadFixture(deployFixture);
      const PRICE = await grid.TILE_PRICE();

      // 1. Mint USDC
      await usdc.mint(otherAccount.address, PRICE);
      
      // 2. Approve
      await usdc.connect(otherAccount).approve(await grid.getAddress(), PRICE);

      // 3. Buy
      await expect(grid.connect(otherAccount).buyNextTile(0x0000FF, "https://base.org"))
        .to.emit(grid, "TilePurchased")
        .withArgs(1, otherAccount.address, 0x0000FF, "https://base.org");

      // 4. Check State
      expect(await grid.nextId()).to.equal(2);
      const tile = await grid.getTile(1);
      expect(tile.url).to.equal("https://base.org");
      expect(tile.color).to.equal(0x0000FF);

      // 5. Check Treasury Balance
      expect(await usdc.balanceOf(owner.address)).to.equal(PRICE);
    });

    it("Should enforce sequential IDs", async function () {
      const { grid, usdc, otherAccount } = await loadFixture(deployFixture);
      const PRICE = await grid.TILE_PRICE();
      await usdc.mint(otherAccount.address, PRICE * 3n);
      await usdc.connect(otherAccount).approve(await grid.getAddress(), PRICE * 3n);

      // Buy #1
      await grid.connect(otherAccount).buyNextTile(0x111111, "1");
      expect(await grid.ownerOf(1)).to.equal(otherAccount.address);

      // Buy #2
      await grid.connect(otherAccount).buyNextTile(0x222222, "2");
      expect(await grid.ownerOf(2)).to.equal(otherAccount.address);
      
      // Can't skip to #5, contract doesn't allow inputting ID
    });
  });

  describe("Updates", function () {
    it("Should allow owner to update tile", async function () {
      const { grid, usdc, otherAccount } = await loadFixture(deployFixture);
      const PRICE = await grid.TILE_PRICE();
      await usdc.mint(otherAccount.address, PRICE);
      await usdc.connect(otherAccount).approve(await grid.getAddress(), PRICE);
      await grid.connect(otherAccount).buyNextTile(0x000000, "old.com");

      await expect(
        grid.connect(otherAccount).updateTile(1, 0xFFFFFF, "new.com")
      ).to.emit(grid, "TileUpdated").withArgs(1, 0xFFFFFF, "new.com");

      const tile = await grid.getTile(1);
      expect(tile.url).to.equal("new.com");
    });

    it("Should prevent non-owner from updating", async function () {
      const { grid, usdc, otherAccount, owner } = await loadFixture(deployFixture);
      const PRICE = await grid.TILE_PRICE();
      await usdc.mint(otherAccount.address, PRICE);
      await usdc.connect(otherAccount).approve(await grid.getAddress(), PRICE);
      await grid.connect(otherAccount).buyNextTile(0x000000, "old.com");

      await expect(
        grid.connect(owner).updateTile(1, 0xFFFFFF, "hacker.com")
      ).to.be.revertedWith("Not tile owner");
    });
  });
});
