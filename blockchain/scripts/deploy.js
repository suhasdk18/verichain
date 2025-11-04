import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("Deploying CertificateRegistry to Amoy testnet...");

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  const certificate = await CertificateRegistry.deploy();

  await certificate.waitForDeployment();

  const address = await certificate.getAddress();
  console.log("\n✅ CertificateRegistry deployed to:", address);
  console.log("\nAdd this to your backend/.env file:");
  console.log("CONTRACT_ADDRESS=" + address);
  console.log("\nVerify on PolygonScan:");
  console.log("https://amoy.polygonscan.com/address/" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });