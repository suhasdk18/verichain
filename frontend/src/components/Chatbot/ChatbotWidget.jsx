import React, { useState } from 'react';
import { chatbotAPI } from '../../utils/api';
import './Chatbot.css';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('help');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [verificationData, setVerificationData] = useState({
    transactionHash: '',
    ipfsCid: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { type: 'user', text: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      await chatbotAPI.submitFeedback({ message: inputMessage });
      const botMessage = { 
        type: 'bot', 
        text: 'Thank you for your feedback! We have received your message and will get back to you soon.' 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        type: 'bot', 
        text: 'Sorry, there was an error submitting your feedback. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCertificate = async () => {
    if (!verificationData.transactionHash || !verificationData.ipfsCid) {
      const errorMsg = { 
        type: 'bot', 
        text: '⚠️ Please enter both Transaction Hash and IPFS CID to verify the certificate.' 
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔐 Starting certificate verification...');
      
      const response = await chatbotAPI.initiateSecureView(verificationData);
      
      console.log('✅ Verification successful:', response.data);
      
      const botMessage = { 
        type: 'bot', 
        text: `✅ Certificate verified successfully!\n\n🔒 Opening secure viewer...\n⏰ Access expires in 10 minutes\n\n📌 Note: The certificate will open in a new tab. If you copy the IPFS URL directly, you'll only see the encrypted file.` 
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Open the secure view in new tab after a short delay
      setTimeout(() => {
        window.open(response.data.secureViewUrl, '_blank');
      }, 500);
      
      // Clear the form
      setVerificationData({
        transactionHash: '',
        ipfsCid: ''
      });
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      
      let errorMessage = '❌ Certificate verification failed.\n\n';
      
      if (error.response?.status === 401) {
        errorMessage += '🔒 Authentication error. Please login again and try.';
      } else if (error.response?.status === 404) {
        errorMessage += '🔍 Certificate not found with the provided details. Please check:\n• Transaction Hash\n• IPFS CID\n• Certificate status (must be Issued)';
      } else if (error.response?.status === 403) {
        errorMessage += '🚫 Access denied.\n\nOnly the following can view certificates:\n• Certificate owner\n• Admin users\n• Users with .gov or .edu email domains';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += '⚠️ Please check the details and try again.';
      }
      
      const errorMsg = { type: 'bot', text: errorMessage };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        className="chatbot-button"
        onClick={() => setIsOpen(true)}
      >
        💬
      </button>

      {/* Chatbot Modal */}
      {isOpen && (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <h3>VeriChain Assistant</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          {/* Tabs */}
          <div className="chatbot-tabs">
            <button
              className={activeTab === 'help' ? 'active' : ''}
              onClick={() => setActiveTab('help')}
            >
              Help / Complaint
            </button>
            <button
              className={activeTab === 'verify' ? 'active' : ''}
              onClick={() => setActiveTab('verify')}
            >
              Verify Certificate
            </button>
          </div>

          <div className="chatbot-content">
            {activeTab === 'help' ? (
              <>
                <div className="chat-messages">
                  {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
                      {msg.text.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < msg.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                  {loading && <div className="message bot">Processing...</div>}
                </div>
                
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button onClick={handleSendMessage} disabled={loading}>
                    Send
                  </button>
                </div>
                
                <button 
                  className="clear-chat"
                  onClick={clearChat}
                >
                  Clear Chat
                </button>
              </>
            ) : (
              <div className="verification-form">
                {/* Show messages in verify tab too */}
                {messages.length > 0 && (
                  <div className="chat-messages" style={{ marginBottom: '15px', maxHeight: '150px', overflowY: 'auto' }}>
                    {messages.map((msg, index) => (
                      <div key={index} className={`message ${msg.type}`}>
                        {msg.text.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < msg.text.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Transaction Hash</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter transaction hash"
                    value={verificationData.transactionHash}
                    onChange={(e) => setVerificationData({
                      ...verificationData,
                      transactionHash: e.target.value
                    })}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">IPFS CID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter IPFS CID"
                    value={verificationData.ipfsCid}
                    onChange={(e) => setVerificationData({
                      ...verificationData,
                      ipfsCid: e.target.value
                    })}
                    disabled={loading}
                  />
                </div>
                
                <button
                  className="btn btn-primary"
                  onClick={handleVerifyCertificate}
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Verifying...' : 'Verify Certificate'}
                </button>
                
                <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
                  <p><strong>Note:</strong> You need proper permissions to view certificates.</p>
                  <ul style={{ paddingLeft: '15px', marginTop: '5px' }}>
                    <li>Certificate owners can view their own certificates</li>
                    <li>Admins can view all certificates</li>
                    <li>Users with .gov or .edu email domains can view</li>
                  </ul>
                </div>

                {messages.length > 0 && (
                  <button 
                    className="clear-chat"
                    onClick={clearChat}
                    style={{ marginTop: '10px' }}
                  >
                    Clear Messages
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;