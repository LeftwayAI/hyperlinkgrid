// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Hyperlinkgrid is ERC721, Ownable {
    // =============================================================
    //                           CONSTANTS
    // =============================================================

    // Grid Size: 100x100 = 10,000 Tiles
    uint256 public constant MAX_SUPPLY = 10000;

    // Price: 100 USDC (6 decimals) = 100 * 10^6
    uint256 public constant TILE_PRICE = 100 * 10**6;

    // =============================================================
    //                            STATE
    // =============================================================

    // Current sequential ID (starts at 1)
    uint256 public nextId = 1;

    // Dev Treasury Address
    address public devTreasury;

    // USDC Contract Address
    IERC20 public usdc;

    struct Tile {
        string url;
        uint24 color; // Hex color 0xRRGGBB
    }

    // Mapping from ID => Tile Data
    mapping(uint256 => Tile) public tiles;

    // =============================================================
    //                           EVENTS
    // =============================================================

    event TilePurchased(
        uint256 indexed id,
        address indexed owner,
        uint24 color,
        string url
    );

    event TileUpdated(
        uint256 indexed id,
        uint24 color,
        string url
    );

    event DevTreasuryUpdated(address newTreasury);

    // =============================================================
    //                        CONSTRUCTOR
    // =============================================================

    constructor(address _usdcAddress, address _devTreasury) 
        ERC721("Hyperlinkgrid", "GRID") 
        Ownable(msg.sender)
    {
        require(_usdcAddress != address(0), "Invalid USDC address");
        require(_devTreasury != address(0), "Invalid treasury address");
        
        usdc = IERC20(_usdcAddress);
        devTreasury = _devTreasury;
    }

    // =============================================================
    //                      CORE FUNCTIONS
    // =============================================================

    /**
     * @notice Buys the next available tile in the sequence.
     * @param _color The 24-bit hex color (0xRRGGBB) for the tile.
     * @param _url The URL the tile links to.
     * @dev User must approve USDC transfer before calling.
     */
    function buyNextTile(uint24 _color, string calldata _url) external {
        uint256 tileId = nextId;
        require(tileId <= MAX_SUPPLY, "Grid is full");

        // Transfer USDC from user to treasury
        bool success = usdc.transferFrom(msg.sender, devTreasury, TILE_PRICE);
        require(success, "USDC transfer failed");

        // Mint NFT
        _mint(msg.sender, tileId);

        // Store Tile Data
        tiles[tileId] = Tile({
            url: _url,
            color: _color
        });

        // Emit Event
        emit TilePurchased(tileId, msg.sender, _color, _url);

        // Increment ID for next buyer
        nextId++;
    }

    /**
     * @notice Updates the color and URL of a tile.
     * @param _id The ID of the tile to update.
     * @param _newColor The new color.
     * @param _newUrl The new URL.
     * @dev Only the owner of the tile can update it.
     */
    function updateTile(uint256 _id, uint24 _newColor, string calldata _newUrl) external {
        require(ownerOf(_id) == msg.sender, "Not tile owner");
        
        tiles[_id].color = _newColor;
        tiles[_id].url = _newUrl;

        emit TileUpdated(_id, _newColor, _newUrl);
    }

    // =============================================================
    //                         VIEW
    // =============================================================

    function getTile(uint256 _id) external view returns (Tile memory) {
        return tiles[_id];
    }

    // =============================================================
    //                         ADMIN
    // =============================================================

    function setDevTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        devTreasury = _newTreasury;
        emit DevTreasuryUpdated(_newTreasury);
    }
}
