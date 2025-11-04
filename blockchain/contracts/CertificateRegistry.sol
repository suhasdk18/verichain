// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    address public owner;
    
    struct Certificate {
        bool exists;
        string ipfsCid;
        uint256 timestamp;
    }
    
    mapping(bytes32 => Certificate) public certificates;
    
    event CertificateIssued(bytes32 indexed certificateHash, string ipfsCid, uint256 timestamp);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can issue certificates");
        _;
    }
    
    function issueCertificate(bytes32 _certificateHash, string memory _ipfsCid) public onlyOwner {
        require(!certificates[_certificateHash].exists, "Certificate already exists");
        
        certificates[_certificateHash] = Certificate({
            exists: true,
            ipfsCid: _ipfsCid,
            timestamp: block.timestamp
        });
        
        emit CertificateIssued(_certificateHash, _ipfsCid, block.timestamp);
    }
    
    function verifyCertificate(bytes32 _certificateHash) public view returns (bool, string memory, uint256) {
        Certificate memory cert = certificates[_certificateHash];
        return (cert.exists, cert.ipfsCid, cert.timestamp);
    }
}