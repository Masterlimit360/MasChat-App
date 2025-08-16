const axios = require('axios');
const { BASE_URL } = require('./app/api/client.ts');

// Use the centralized BASE_URL
const API_URL = BASE_URL;

async function testTokenValidation() {
  try {
    console.log('Testing backend connection...');
    
    // Test basic connection
    const testResponse = await axios.get(`${API_URL}/auth/test`);
    console.log('Backend test response:', testResponse.data);
    
    // Test token validation with a dummy token
    console.log('\nTesting token validation...');
    const tokenResponse = await axios.get(`${API_URL}/auth/validate-token`, {
      headers: { 
        'Authorization': 'Bearer dummy-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('Token validation response:', tokenResponse.data);
    
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testTokenValidation(); 