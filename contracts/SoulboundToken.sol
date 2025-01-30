// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SoulboundToken is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 public constant MAX_SUPPLY = 50;
    uint256 public totalSupply;

    mapping(address => bool) public hasMinted;
    mapping(address => bool) public eligibleVoter;

    string private constant METADATA_URI = "https://gateway.pinata.cloud/ipfs/QmZ7PYp5QGiwXFJsYfaSDv3zKY543qTvdP8F9siVXi3rzx";

    constructor() ERC721("Vote ID", "SBT") {}

    function mintSoulbound() public {
        require(!hasMinted[msg.sender], "You have already minted your Soulbound token");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, METADATA_URI);

        hasMinted[msg.sender] = true;
        eligibleVoter[msg.sender] = true;

        totalSupply = _tokenIdCounter.current();
    }

    function isEligibleVoter(address _voter) public view returns (bool) {
        return eligibleVoter[_voter];
    }

    function hasMintedSoulbound(address _owner) external view returns (bool) {
        return hasMinted[_owner];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721) {
        require(from == address(0), "Token is soulbound and cannot be transferred");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
