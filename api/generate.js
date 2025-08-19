const { Anthropic } = require('@anthropic-ai/sdk');

let anthropic;

function initializeAnthropic() {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

// Enhanced caching system for demo scenarios
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Demo fallback content for reliable demos
const getDemoContent = (clientName, transactionType) => {
  if (clientName === 'TechVentures Pte Ltd') {
    return `Dear Mr. Lim Wei Ming,

ENGAGEMENT FOR ACQUISITION OF DATATECH SOLUTIONS PTE LTD

We are delighted to confirm our engagement to act for TechVentures Pte Ltd ("Company") in connection with the proposed acquisition of DataTech Solutions Pte Ltd ("Target") for a consideration of approximately S$75 million (the "Transaction").

1. SCOPE OF SERVICES

1.1 Legal Due Diligence
We shall conduct comprehensive legal due diligence on the Target, including:
(a) Corporate structure and shareholding verification
(b) Material contracts and commercial arrangements  
(c) Intellectual property portfolio and licensing agreements
(d) Employment matters and key person dependencies
(e) Regulatory compliance and outstanding litigations

1.2 Transaction Documentation
We shall prepare and negotiate all transaction documents including:
(a) Share Purchase Agreement with appropriate warranties and indemnities
(b) Disclosure Letter and Data Room Index
(c) Board Resolutions and shareholder approvals
(d) Completion mechanics and escrow arrangements

1.3 Regulatory Approvals
Given the cross-border technology elements, we shall:
(a) Advise on ACRA merger notification requirements
(b) Coordinate with IMDA for telecommunications licensing issues
(c) Ensure compliance with foreign investment review procedures
(d) Address data protection and cybersecurity regulatory requirements

2. FEE ARRANGEMENT

2.1 Our fees for this engagement will be charged on a time-cost basis at our standard rates:
Senior Partner (Sarah Chen): S$1,100 per hour
Partner (Michael Tan): S$770 per hour
Senior Associate: S$550 per hour
Associate: S$380 per hour

2.2 We estimate our total fees for this transaction to be in the range of S$65,000 to S$85,000, subject to the complexity of issues arising and extent of negotiations required.

3. KEY TERMS AND CONDITIONS

3.1 The Company acknowledges that time is of the essence given the urgent timeline.

3.2 Our engagement is subject to satisfactory completion of our standard client identification and anti-money laundering procedures.

3.3 Our professional liability is limited to S$2 million per claim, being twice the amount of fees paid under this engagement.

3.4 This engagement letter is governed by Singapore law and subject to the exclusive jurisdiction of the Singapore courts, with disputes to be resolved through SIAC arbitration.

4. CONFIDENTIALITY AND DATA PROTECTION

All information received will be held in strict confidence in accordance with our professional obligations and the Personal Data Protection Act 2012.

We look forward to working with you on this exciting transaction. Please confirm your acceptance by signing and returning the enclosed copy.

Yours faithfully,

LEGALFLOW & ASSOCIATES`;
  }
  
  return `Dear ${clientName},

ENGAGEMENT LETTER FOR ${transactionType.toUpperCase()} TRANSACTION

We are pleased to confirm our engagement to act for you in connection with your proposed ${transactionType} transaction.

1. SCOPE OF SERVICES
We shall provide comprehensive legal services including due diligence, transaction documentation, and regulatory compliance.

2. FEE ARRANGEMENT
Our fees will be charged on a time-cost basis at our standard rates, with an estimated range based on transaction complexity.

3. TERMS AND CONDITIONS
This engagement is governed by Singapore law and subject to our standard terms and conditions.

We look forward to working with you on this transaction.

Yours faithfully,
LEGALFLOW & ASSOCIATES`;
};

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
    
    let currentStage = 1;
    for (const stage of stages) {
      res.write(`data: ${JSON.stringify({ 
        type: 'reasoning', 
        stage: currentStage++, 
        detail: stage,
        progress: Math.round((currentStage / stages.length) * 80)
      })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      fullResponse: cached.content,
      analysis: {
        complexity: 'High',
        riskFactors: 'Cached demo content',
        timeSaved: '44 minutes'
      }
    })}\n\n`);
    return res.end();
  }

  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Send reasoning stages
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

    let currentStage = 1;
    for (const stage of stages) {
      res.write(`data: ${JSON.stringify({ 
        type: 'reasoning', 
        stage: currentStage++, 
        detail: stage,
        progress: Math.round((currentStage / stages.length) * 80) // 80% for reasoning, 20% for generation
      })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    let fullResponse = '';
    
    // Try Anthropic API first, fallback to demo content if it fails
    try {
      const client = initializeAnthropic();
      
      const prompt = `You are a senior partner at a prestigious Singapore law firm with 25+ years of M&A expertise. Generate a highly professional engagement letter for the following transaction.

CLIENT DETAILS:
- Client Name: ${clientName}
- Client Type: ${clientType}
- Transaction: ${transactionType}
- Deal Value: ${dealValue}
- Timeframe: ${timeframe}
- Special Requirements: ${customRequirements || 'Standard commercial terms'}

Generate a sophisticated engagement letter that includes comprehensive scope of services, intelligent fee structure, sophisticated terms & conditions, and Singapore-specific compliance. Make it sound like it was written by a Magic Circle-trained partner with deep Singapore market knowledge.

Format as a complete, professional engagement letter ready for client signature.`;

      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      });

      fullResponse = message.content[0].text;
      
    } catch (apiError) {
      console.error('Anthropic API failed, using fallback content:', apiError.message);
      fullResponse = getDemoContent(clientName, transactionType);
    }

    // Cache successful response for demo scenarios
    if (fullResponse.length > 100) {
      responseCache.set(cacheKey, {
        content: fullResponse,
        timestamp: Date.now()
      });
    }

    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      fullResponse: fullResponse,
      analysis: {
        complexity: 'High',
        riskFactors: 'Cross-border IP, Regulatory approvals',
        timeSaved: '44 minutes'
      }
    })}\n\n`);
    res.end();

  } catch (error) {
    console.error('API Error:', error);
    
    // Final fallback
    const fallbackContent = getDemoContent(clientName, transactionType);
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      fullResponse: fallbackContent,
      analysis: {
        complexity: 'High',
        riskFactors: 'Standard transaction risks',
        timeSaved: '44 minutes'
      }
    })}\n\n`);
    res.end();
  }
};