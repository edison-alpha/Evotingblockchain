// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Kontrak SoulboundToken adalah implementasi token ERC721 yang tidak dapat dipindahkan setelah dicetak
contract SoulboundToken is ERC721, Ownable {
    using Strings for uint256; // Menggunakan library Strings untuk konversi uint256 ke string

    uint256 private _tokenIdCounter; // Penghitung ID token
    uint256 public constant MAX_SUPPLY = 20; // Jumlah maksimum supply token
    uint256 public totalSupply; // Total supply token yang telah dicetak

    mapping(address => bool) public hasMinted; // Mapping untuk melacak alamat yang sudah mencetak token
    mapping(address => bool) public eligibleVoter; // Mapping untuk melacak alamat yang memenuhi syarat sebagai pemilih

    // Base URI untuk metadata token
    string private baseTokenURI;

    // Konstruktor menginisialisasi token ERC-721 dengan nama "SoulboundToken" dan simbol "SBT"
    constructor() ERC721("SoulboundToken", "SBT") {
        // Set the base URI to your IPFS directory
        baseTokenURI = "https://gateway.pinata.cloud/ipfs/QmdZgtSivPW4c92QALwQd6L8bDjQzNVGsE94T1fThx5HaA/{tokenId}.json";
    }

    // Fungsi untuk mencetak token soulbound untuk pemanggil fungsi
    function mintSoulbound() public {
        require(!hasMinted[msg.sender], "You have already minted your Soulbound token"); // Memeriksa apakah token sudah dicetak
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached"); // Memeriksa apakah jumlah maksimum supply telah tercapai

        uint256 tokenId = _tokenIdCounter; // Mendapatkan ID token baru
        _tokenIdCounter += 1; // Meningkatkan penghitung ID token

        _mint(msg.sender, tokenId); // Mencetak token ke alamat pemanggil
        hasMinted[msg.sender] = true; // Menandai alamat telah mencetak token
        eligibleVoter[msg.sender] = true; // Menandai alamat sebagai pemilih yang memenuhi syarat

        totalSupply = _tokenIdCounter; // Memperbarui total supply setelah mencetak
    }

    // Fungsi untuk memeriksa apakah alamat memenuhi syarat sebagai pemilih
    function isEligibleVoter(address _voter) public view returns (bool) {
        return eligibleVoter[_voter]; // Mengembalikan status kelayakan pemilih
    }

    // Fungsi untuk memeriksa apakah alamat telah mencetak token soulbound
    function hasMintedSoulbound(address _owner) external view returns (bool) {
        return hasMinted[_owner]; // Mengembalikan status pencetakan token
    }

    // Fungsi hook yang dipanggil sebelum setiap transfer token
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721) {
        require(from == address(0), "Token is soulbound and cannot be transferred"); // Memeriksa apakah token sedang dicetak (transfer dari alamat nol)
        super._beforeTokenTransfer(from, to, tokenId); // Memanggil fungsi hook dari ERC721
    }

    // Override fungsi tokenURI untuk mengembalikan URI metadata token
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        return string(abi.encodePacked(baseTokenURI, tokenId.toString(), ".json"));
    }

    // Fungsi untuk mengubah base URI metadata (jika diperlukan)
    function setBaseTokenURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }
}
