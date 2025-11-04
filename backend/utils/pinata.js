const axios = require('axios');
const FormData = require('form-data');

class PinataService {
    constructor() {
        this.apiKey = process.env.PINATA_API_KEY;
        this.secretKey = process.env.PINATA_SECRET_API_KEY;
        this.baseURL = 'https://api.pinata.cloud';
    }

    async uploadToIPFS(fileBuffer, fileName) {
        try {
            const formData = new FormData();
            
            formData.append('file', fileBuffer, {
                filename: fileName,
                contentType: 'application/octet-stream'
            });

            const pinataMetadata = JSON.stringify({
                name: fileName,
            });
            formData.append('pinataMetadata', pinataMetadata);

            const pinataOptions = JSON.stringify({
                cidVersion: 0,
            });
            formData.append('pinataOptions', pinataOptions);

            const response = await axios.post(
                `${this.baseURL}/pinning/pinFileToIPFS`,
                formData,
                {
                    headers: {
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.secretKey,
                        ...formData.getHeaders(),
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                }
            );

            return {
                IpfsHash: response.data.IpfsHash,
                PinSize: response.data.PinSize,
                Timestamp: response.data.Timestamp
            };
        } catch (error) {
            console.error('Error uploading to IPFS:', error.response?.data || error.message);
            throw error;
        }
    }

    async testAuthentication() {
        try {
            const response = await axios.get(
                `${this.baseURL}/data/testAuthentication`,
                {
                    headers: {
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.secretKey,
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Pinata authentication failed:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new PinataService();