module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Test environment variables and dependencies
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    anthropicKey: {
      exists: !!process.env.ANTHROPIC_API_KEY,
      length: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0,
      prefix: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'missing'
    },
    modules: {
      anthropic: false,
      puppeteer: false
    }
  };

  // Test Anthropic module loading
  try {
    const { Anthropic } = require('@anthropic-ai/sdk');
    testResults.modules.anthropic = true;
    
    // Test initialization
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    testResults.anthropicClient = 'initialized';
  } catch (error) {
    testResults.anthropicError = error.message;
  }

  // Test Puppeteer module loading
  try {
    const puppeteer = require('puppeteer');
    testResults.modules.puppeteer = true;
  } catch (error) {
    testResults.puppeteerError = error.message;
  }

  res.json(testResults);
};