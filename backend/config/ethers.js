const { ethers } = require('ethers');

const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Check if all required environment variables are present
if (!ALCHEMY_RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    throw new Error('Missing required blockchain environment variables');
}

const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract ABI - this should match your deployed contract
const contractABI = [
    "function issueCertificate(bytes32 dataHash, string memory ipfsCid) public returns (bytes32)",
    "function verifyCertificate(bytes32 dataHash) public view returns (bool)",
    "function getCertificate(bytes32 dataHash) public view returns (string memory, address, uint256)",
    "event CertificateIssued(bytes32 indexed dataHash, string ipfsCid, address indexed issuedBy, uint256 timestamp)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// Test connection
async function testConnection() {
    try {
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(wallet.address);
        console.log('Connected to network:', network.name);
        console.log('Wallet balance:', ethers.formatEther(balance), 'MATIC');
        console.log('Contract address:', CONTRACT_ADDRESS);
        return true;
    } catch (error) {
        console.error('Blockchain connection test failed:', error);
        return false;
    }
}

// Test connection on startup
testConnection().then(success => {
    if (success) {
        console.log('✅ Blockchain connection established successfully');
    } else {
        console.log('❌ Blockchain connection failed');
    }
});

module.exports = { provider, wallet, contract, testConnection };