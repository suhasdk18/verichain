# 🔐 VeriChain - Blockchain-Based Certificate Verification System

VeriChain is a decentralized certificate management system built on blockchain technology, ensuring tamper-proof, verifiable, and transparent certificate issuance for government and educational institutions.

![VeriChain Banner](https://img.shields.io/badge/VeriChain-Blockchain-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Smart Contract](#smart-contract)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- 🔒 **Blockchain-Secured**: All certificates are stored on Ethereum blockchain with IPFS integration
- 🔐 **End-to-End Encryption**: Certificates are encrypted before being uploaded to IPFS
- 📱 **Two-Factor Authentication**: Email OTP verification for secure login
- 👥 **Role-Based Access Control**: Admin, User, and Authority roles with specific permissions
- 📄 **Multiple Certificate Types**: Birth, Death, Marriage, Income, Caste, Domicile, and Character certificates
- ✅ **QR Code Verification**: Instant certificate verification via QR codes
- 🔍 **Chatbot Assistant**: AI-powered help and certificate verification
- 📊 **Analytics Dashboard**: Real-time statistics for users and admins
- 🌐 **Domain-Based Authorization**: Special access for .gov and .edu domains
- 🔄 **Immutable Records**: Blockchain ensures no certificate can be altered or forged

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Bcrypt** - Password hashing

### Blockchain
- **Ethereum** - Blockchain network
- **Hardhat** - Development environment
- **Ethers.js** - Ethereum library
- **Solidity** - Smart contract language

### Storage
- **IPFS (Pinata)** - Decentralized storage
- **Cloudinary** - Document uploads

### Additional Tools
- **pdf-lib** - PDF generation
- **qrcode** - QR code generation
- **crypto** - Encryption/Decryption

## 🏗️ Architecture
```
VeriChain/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── public/
├── backend/           # Express server
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   └── assets/
└── blockchain/        # Smart contracts
    ├── contracts/
    ├── scripts/
    └── test/
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- PostgreSQL (via Supabase)
- MetaMask wallet
- Ethereum test network (Sepolia/Goerli)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/suhasdk18/verichain.git
cd verichain
```

**2. Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install blockchain dependencies
cd ../blockchain
npm install
```

**3. Set up environment variables**

Create `.env` files in `backend` and `blockchain` directories:

**Backend `.env`:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_API_KEY=your_pinata_secret
PRIVATE_KEY=your_ethereum_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
RPC_URL=your_rpc_url
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

**Blockchain `.env`:**
```env
PRIVATE_KEY=your_ethereum_private_key
RPC_URL=your_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**4. Set up Supabase database**

Run the SQL scripts in `backend/database/schema.sql` in your Supabase SQL editor.

**5. Deploy smart contract**
```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract address to your backend `.env` file.

**6. Start the application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔑 Environment Variables

### Required Backend Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `JWT_SECRET` | Secret for JWT token generation |
| `EMAIL_USER` | Email for OTP service |
| `EMAIL_PASS` | Email password or app password |
| `CLOUDINARY_*` | Cloudinary configuration |
| `PINATA_*` | Pinata IPFS configuration |
| `PRIVATE_KEY` | Ethereum wallet private key |
| `CONTRACT_ADDRESS` | Deployed smart contract address |

## 📖 Usage

### For Users

1. **Register**: Create an account with email and Aadhaar verification
2. **Login**: Two-factor authentication with OTP
3. **Apply**: Submit certificate applications with required documents
4. **Track**: Monitor application status in dashboard
5. **Download**: Get encrypted certificates after approval
6. **Verify**: Use QR code or chatbot to verify certificates

### For Admins

1. **Review**: View pending applications
2. **Approve/Reject**: Process applications
3. **Issue**: Generate blockchain-verified certificates
4. **Monitor**: Access analytics dashboard

### For Authorized Personnel (.gov/.edu)

1. **Verify**: Access certificate verification through chatbot
2. **View**: Securely view decrypted certificates

## 📡 API Documentation

### Authentication Endpoints
```
POST /api/auth/register/initiate - Start registration
POST /api/auth/register/finalize - Complete registration
POST /api/auth/login/initiate - Start login
POST /api/auth/login/finalize - Complete login
```

### Application Endpoints
```
POST /api/applications/apply - Submit new application
GET /api/applications/my-list - Get user's applications
```

### Admin Endpoints
```
GET /api/admin/pending - Get pending applications
POST /api/admin/approve/:id - Approve application
POST /api/admin/reject/:id - Reject application
```

### Certificate Endpoints
```
GET /api/certificates/view-secure/:token - View decrypted certificate
```

### Chatbot Endpoints
```
POST /api/chatbot/submit-feedback - Submit feedback
POST /api/chatbot/initiate-secure-view - Verify and view certificate
```

## 📜 Smart Contract

The VeriChain smart contract is deployed on Ethereum network:

**Contract Features:**
- Certificate issuance tracking
- IPFS hash storage
- Data hash verification
- Ownership tracking
- Event emission for transparency

**Main Functions:**
```solidity
function issueCertificate(bytes32 dataHash, string memory ipfsCID)
function verifyCertificate(uint256 certificateId)
function getCertificate(uint256 certificateId)
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer** - [Suhas DK](https://github.com/suhasdk18)

## 📞 Support

For support, email suhasdk18@gmail.com or open an issue in the repository.

## 🙏 Acknowledgments

- Government of Karnataka for certificate format reference
- Ethereum Foundation for blockchain technology
- IPFS for decentralized storage
- All open-source contributors

---

**⭐ If you find this project useful, please consider giving it a star!**

Built with ❤️ for secure and transparent certificate management
