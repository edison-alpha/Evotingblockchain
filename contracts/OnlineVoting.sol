// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface untuk memverifikasi kelayakan pemilih
interface ISoulboundToken {
    function isEligibleVoter(address _voter) external view returns (bool);
}

contract OnlineVoting {
    address private owner; // Alamat pemilik kontrak
    ISoulboundToken private soulboundToken; // Instance dari interface ISoulboundToken

    constructor(address _soulboundTokenAddress) {
        owner = msg.sender; // Menetapkan pemilik kontrak
        soulboundToken = ISoulboundToken(_soulboundTokenAddress); // Inisialisasi soulboundToken dengan alamat yang diberikan
    }

    // Struktur untuk kandidat
    struct Candidate {
        uint256 candidate_id; // ID kandidat
        string candidate_name; // Nama kandidat
        uint256 candidate_voteCount; // Jumlah suara kandidat
        string candidate_img; // Gambar kandidat
        uint256 candidate_age; // Usia kandidat
        string candidate_partyName; // Nama partai kandidat
        string candidate_partyLogo; // Logo partai kandidat
    }

    address[] private votersArr; // Array untuk menyimpan alamat pemilih
    mapping(address => bool) private voters; // Mapping untuk melacak apakah alamat sudah memberikan suara
    mapping(uint256 => Candidate) private candidate; // Mapping untuk menyimpan kandidat berdasarkan ID
    uint256 private candidateCount = 0; // Penghitung jumlah kandidat

    event votedEvent(uint256 indexed _candidateId); // Event untuk mencatat ketika suara diberikan
    event candidateEvent(string _message); // Event untuk mencatat ketika kandidat ditambahkan

    uint256 private winnerId; // ID dari kandidat pemenang
    bool private isResultDeclared; // Boolean untuk memeriksa apakah hasil telah diumumkan

    // Modifier untuk membatasi fungsi tertentu hanya untuk pemilik kontrak
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    // Fungsi untuk menambahkan kandidat baru ke dalam pemilihan
    function addCandidate(
        string memory _name,
        uint256 _age,
        string memory _partyName,
        string memory _partyLogo,
        string memory _candidate_pic
    ) public onlyOwner {
        Candidate storage c = candidate[candidateCount];
        c.candidate_id = candidateCount; // Menetapkan ID kandidat
        c.candidate_name = _name; // Menetapkan nama kandidat
        c.candidate_voteCount = 0; // Inisialisasi jumlah suara kandidat
        c.candidate_age = _age; // Menetapkan usia kandidat
        c.candidate_partyName = _partyName; // Menetapkan nama partai kandidat
        c.candidate_partyLogo = _partyLogo; // Menetapkan logo partai kandidat
        c.candidate_img = _candidate_pic; // Menetapkan gambar kandidat
        candidateCount++; // Menambah jumlah kandidat
        emit candidateEvent("Candidate added to smart contract!"); // Emit event kandidat ditambahkan
    }

    // Fungsi untuk memberikan suara
    function addVote(uint256 _candidateId) public {
        require(!voters[msg.sender], "You have already cast your vote"); // Memeriksa apakah pemilih sudah memberikan suara
        require(soulboundToken.isEligibleVoter(msg.sender), "You are not eligible to vote"); // Memeriksa kelayakan pemilih
        require(_candidateId >= 0 && _candidateId < candidateCount, "Invalid candidate"); // Memeriksa validitas ID kandidat

        voters[msg.sender] = true; // Menandai pemilih telah memberikan suara
        candidate[_candidateId].candidate_voteCount++; // Menambah jumlah suara kandidat
        votersArr.push(msg.sender); // Menambahkan alamat pemilih ke array
        emit votedEvent(_candidateId); // Emit event suara diberikan
    }

    // Fungsi untuk menemukan kandidat dengan suara terbanyak
    function findMaxVoteCandidate() public onlyOwner {
        uint256 max = 0;
        for (uint256 i = 0; i < candidateCount; i++) {
            if (candidate[i].candidate_voteCount > max) {
                max = candidate[i].candidate_voteCount; // Menentukan suara maksimum
                winnerId = i; // Menetapkan ID pemenang
                isResultDeclared = true; // Menandai hasil telah diumumkan
            }
        }
    }

    // Fungsi untuk mengembalikan kandidat pemenang
    function getWinner() public view returns (Candidate memory) {
        require(isResultDeclared, "Result has not been declared yet"); // Memeriksa apakah hasil telah diumumkan
        return candidate[winnerId]; // Mengembalikan kandidat pemenang
    }

    // Fungsi untuk mengembalikan semua kandidat
    function getCandidate() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateCount); // Membuat array untuk semua kandidat
        for (uint256 i = 0; i < candidateCount; i++) {
            allCandidates[i] = candidate[i]; // Mengisi array dengan kandidat
        }
        return allCandidates; // Mengembalikan semua kandidat
    }

    // Fungsi untuk mengembalikan pemilik kontrak
    function getOwner() public view returns (address) {
        return owner; // Mengembalikan alamat pemilik kontrak
    }

    // Fungsi untuk mengembalikan daftar pemilih
    function getVoters() public view returns (address[] memory) {
        return votersArr; // Mengembalikan array alamat pemilih
    }

    // Fungsi untuk memeriksa apakah hasil telah diumumkan
    function resultStatus() public view returns (bool) {
        return isResultDeclared; // Mengembalikan status hasil
    }
}
