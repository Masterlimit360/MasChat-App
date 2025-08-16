const fetch = require('node-fetch');

async function testCloudinaryUrl() {
  const url = 'https://res.cloudinary.com/dqaocubzz/video/upload/v1753845539/maschat/reels/cuc3gzvn4fmi2tl4v7qb.mov';
  
  console.log('Testing Cloudinary URL:', url);
  
  try {
    // Test with HEAD request first
    console.log('Testing with HEAD request...');
    const headResponse = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'MasChat/1.0',
      }
    });
    
    console.log('HEAD Response status:', headResponse.status);
    console.log('HEAD Response headers:', Object.fromEntries(headResponse.headers.entries()));
    
    if (headResponse.ok) {
      console.log('✅ URL is accessible via HEAD request');
      
      // Test with GET request to check actual content
      console.log('\nTesting with GET request...');
      const getResponse = await fetch(url, {
        headers: {
          'User-Agent': 'MasChat/1.0',
        }
      });
      
      console.log('GET Response status:', getResponse.status);
      console.log('GET Response headers:', Object.fromEntries(getResponse.headers.entries()));
      
      if (getResponse.ok) {
        console.log('✅ URL is accessible via GET request');
        console.log('Content-Type:', getResponse.headers.get('content-type'));
        console.log('Content-Length:', getResponse.headers.get('content-length'));
      } else {
        console.log('❌ GET request failed');
      }
    } else {
      console.log('❌ HEAD request failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing URL:', error.message);
    console.error('Error details:', error);
  }
}

// Test with optimized URL
async function testOptimizedUrl() {
  const originalUrl = 'https://res.cloudinary.com/dqaocubzz/video/upload/v1753845539/maschat/reels/cuc3gzvn4fmi2tl4v7qb.mov';
  const optimizedUrl = originalUrl.replace('/upload/', '/upload/f_auto,q_auto,fl_timeout,30/');
  
  console.log('\n\nTesting optimized URL:', optimizedUrl);
  
  try {
    const response = await fetch(optimizedUrl, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'MasChat/1.0',
      }
    });
    
    console.log('Optimized URL Response status:', response.status);
    console.log('Optimized URL Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ Optimized URL is accessible');
    } else {
      console.log('❌ Optimized URL failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing optimized URL:', error.message);
  }
}

// Run tests
testCloudinaryUrl().then(() => {
  return testOptimizedUrl();
}).catch(console.error); 