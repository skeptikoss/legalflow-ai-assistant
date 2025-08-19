const { Anthropic } = require('@anthropic-ai/sdk');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { clientName, transactionType } = req.body;

  if (!clientName || !transactionType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [{ 
        role: 'user', 
        content: `Generate a brief engagement letter for ${clientName} for a ${transactionType} transaction.` 
      }]
    });

    const content = message.content[0].text;
    
    res.json({ 
      success: true, 
      content: content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Generation failed',
      message: error.message,
      details: {
        hasApiKey: !!process.env.ANTHROPIC_API_KEY,
        errorType: error.constructor.name
      }
    });
  }
};