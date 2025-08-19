module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing',
      pdf: 'available'
    },
    demo: {
      scenarios: ['techAcquisition', 'realEstateMerger', 'startupFunding'],
      cacheEnabled: true
    }
  };

  res.json(healthStatus);
};