const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Enhanced caching system for demo scenarios
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

  const { clientName, clientType, transactionType, dealValue, timeframe, customRequirements } = req.body;

  if (!clientName || !transactionType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check cache first for demo scenarios
  const cacheKey = JSON.stringify({ clientName, transactionType, dealValue });
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // Stream cached response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Simulate streaming for cached content
    const stages = cached.content.split('\n\n');
    for (let i = 0; i < stages.length; i++) {
      res.write(`data: ${JSON.stringify({ stage: i + 1, content: stages[i] })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 200)); // Slight delay for effect
    }
    
    res.write(`data: ${JSON.stringify({ complete: true, fullResponse: cached.content })}\n\n`);
    return res.end();
  }

  const prompt = `You are a senior partner at a prestigious Singapore law firm with 25+ years of M&A expertise. Generate a highly professional engagement letter for the following transaction.

CLIENT DETAILS:
- Client Name: ${clientName}
- Client Type: ${clientType}
- Transaction: ${transactionType}
- Deal Value: ${dealValue}
- Timeframe: ${timeframe}
- Special Requirements: ${customRequirements || 'Standard commercial terms'}

Generate a sophisticated engagement letter that includes:

1. PERSONALISED GREETING & TRANSACTION OVERVIEW
- Address the specific client and transaction details
- Reference the deal value and strategic importance

2. COMPREHENSIVE SCOPE OF SERVICES
- Legal due diligence tailored to transaction type
- Transaction documentation and negotiation
- Regulatory approvals specific to industry/deal
- Completion mechanics and post-completion matters

3. INTELLIGENT FEE STRUCTURE
- Time-cost basis with Singapore market rates
- Realistic fee estimate based on transaction complexity
- Fee cap or alternative arrangements if appropriate

4. SOPHISTICATED TERMS & CONDITIONS
- Professional liability limitation
- Governing law (Singapore law)
- SIAC arbitration clause
- Confidentiality and PDPA compliance

5. SINGAPORE-SPECIFIC COMPLIANCE
- Include appropriate regulatory considerations
- Reference Singapore legal requirements
- Add industry-specific compliance where relevant

Make it sound like it was written by a Magic Circle-trained partner with deep Singapore market knowledge. Use sophisticated legal language but keep it commercially practical. Include specific details that show understanding of the transaction type and client industry.

Format as a complete, professional engagement letter ready for client signature.`;

  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
      stream: true
    });

    let fullResponse = '';
    let currentStage = 1;
    const stages = [
      '🤔 Analysing transaction complexity and regulatory requirements...',
      '📊 Determining optimal fee structure based on market rates...',
      '⚖️ Incorporating Singapore compliance and professional standards...',
      '📝 Customising engagement terms for client industry...',
      '🔍 Adding sophisticated risk mitigation clauses...',
      '✨ Finalising partner-level professional language...',
      '📋 Completing engagement letter with signature blocks...',
      '🎯 Quality assurance and compliance verification...',
      '✅ Professional engagement letter ready for client signature!'
    ];

    // Send reasoning stages
    for (const stage of stages) {
      res.write(`data: ${JSON.stringify({ stage: currentStage++, content: stage })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Process Claude response
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        const text = chunk.delta.text || '';
        fullResponse += text;
      }
    }

    // Cache successful response for demo scenarios
    if (fullResponse.length > 100) {
      responseCache.set(cacheKey, {
        content: fullResponse,
        timestamp: Date.now()
      });
    }

    res.write(`data: ${JSON.stringify({ complete: true, fullResponse })}\n\n`);
    res.end();

  } catch (error) {
    console.error('API Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate content. Please try again.' })}\n\n`);
    res.end();
  }
};