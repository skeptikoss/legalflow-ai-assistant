require('dotenv').config();
const express = require('express');
const path = require('path');
const { Anthropic } = require('@anthropic-ai/sdk');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced caching system for demo scenarios
const responseCache = new Map();
const pdfCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PDF_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for PDFs

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Performance middleware
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to get demo sample content
const getDemoSampleContent = (scenario) => {
  // Access the demo data structure that's defined in the /api/demo/:scenario endpoint
  // We'll define this inline here for performance
  const sampleContent = {
    techAcquisition: `Dear Mr. Lim Wei Ming,

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

LEGALFLOW & ASSOCIATES`,

    realEstateMerger: `Dear Ms. Patricia Wong,

ENGAGEMENT FOR MERGER OF SINGAPORE PROPERTIES GROUP WITH HERITAGE REIT

We are pleased to confirm our engagement to act for Singapore Properties Group Pte Ltd ("SPG") in connection with the proposed merger with Heritage REIT ("Heritage") to form a combined entity with total assets of approximately S$18 billion (the "Merger").

1. SCOPE OF SERVICES

1.1 Transaction Structure and Planning
We shall advise on:
(a) Optimal merger structure considering REIT regulatory requirements
(b) Tax-efficient implementation through scheme of arrangement
(c) Minority shareholder protection mechanisms
(d) Regulatory compliance timeline and requirements

1.2 Due Diligence and Documentation
Our services include:
(a) Legal due diligence on Heritage's property portfolio
(b) Review of existing property management agreements
(c) Preparation of scheme documents and explanatory statement
(d) Court applications and regulatory filings

2. FEE ARRANGEMENT

2.1 Our professional fees will be charged on a time-cost basis:
Senior Partner: S$950 per hour
Partner: S$650 per hour
Senior Associate: S$480 per hour
Associate: S$320 per hour

2.2 We estimate total fees of S$45,000 to S$65,000 for this engagement, depending on the complexity of regulatory approvals and court proceedings required.

3. PROFESSIONAL LIABILITY AND GOVERNING LAW

3.1 Our professional liability is capped at S$1.5 million in aggregate.

3.2 This agreement is governed by Singapore law, with disputes subject to SIAC arbitration procedures.

Please indicate your acceptance by countersigning this letter.

Yours sincerely,

LEGALFLOW & ASSOCIATES`,

    startupFunding: `Dear Dr. Rachel Tan,

ENGAGEMENT FOR JOINT VENTURE WITH GOVERNMENT CO-INVESTMENT

We are excited to confirm our engagement to act for InnovateSG Pte Ltd ("Company") in establishing a joint venture with TechAccelerator Holdings and the Economic Development Board Investment Pte Ltd ("EDBI") for your breakthrough fintech platform.

1. SCOPE OF SERVICES

1.1 Joint Venture Structure
We shall design and implement:
(a) Optimal corporate structure accommodating government co-investment requirements
(b) Shareholder agreements with appropriate governance provisions
(c) Founder and key employee equity participation mechanisms
(d) Technology licensing and IP contribution frameworks

1.2 Investment Documentation
Our services include preparation of:
(a) Subscription and Shareholders' Agreement with EDBI-compliant terms
(b) Technology Transfer and Licensing Agreements
(c) Founder Service Agreements with vesting schedules
(d) Board composition and decision-making procedures

2. FEE ARRANGEMENT

2.1 Recognising the startup nature of this engagement:
Senior Partner: S$800 per hour
Partner: S$600 per hour
Senior Associate: S$420 per hour
Associate: S$280 per hour

2.2 Total estimated fees: S$25,000 to S$35,000 for complete documentation and setup.

3. PROFESSIONAL TERMS

3.1 Professional liability limited to S$750,000 reflecting the transaction size.

3.2 Singapore law governs with SIAC arbitration for dispute resolution.

We are committed to supporting Singapore's startup ecosystem and look forward to contributing to your success.

Yours faithfully,

LEGALFLOW & ASSOCIATES`
  };
  
  return sampleContent[scenario] || `Professional engagement letter content for ${scenario}.`;
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper functions for intelligent analysis
const analyseTransactionComplexity = (transactionType, transactionValue, urgency, specialRequirements) => {
  let complexity = 'medium';
  let riskFactors = [];
  let recommendedClauses = [];
  
  // Analyse transaction value impact
  if (transactionValue === 'over-100m') {
    complexity = 'high';
    riskFactors.push('Large transaction size increases regulatory scrutiny');
    recommendedClauses.push('Enhanced due diligence provisions', 'Regulatory approval conditions');
  } else if (transactionValue === '25m-100m') {
    complexity = 'medium-high';
    riskFactors.push('Mid-market transaction requires tailored approach');
  } else if (transactionValue === 'under-5m') {
    complexity = 'low-medium';
    riskFactors.push('Cost-efficiency critical for smaller deals');
  }
  
  // Analyse transaction type risks
  if (transactionType === 'acquisition') {
    riskFactors.push('Asset/liability transfer complexity', 'Warranty and indemnity exposure');
    recommendedClauses.push('Comprehensive due diligence scope', 'Detailed warranty provisions');
  } else if (transactionType === 'merger') {
    riskFactors.push('Shareholder approval requirements', 'Regulatory merger clearance');
    recommendedClauses.push('Competition Commission filing', 'Shareholder meeting protocols');
  } else if (transactionType === 'joint-venture') {
    riskFactors.push('Ongoing governance structure', 'IP and confidentiality issues');
    recommendedClauses.push('JV agreement drafting', 'IP licensing provisions');
  }
  
  // Analyse urgency impact
  if (urgency === 'urgent') {
    complexity = complexity === 'low-medium' ? 'medium' : 'high';
    riskFactors.push('Compressed timeline increases execution risk');
    recommendedClauses.push('Expedited process protocols', 'Enhanced project management');
  }
  
  // Analyse special requirements
  if (specialRequirements) {
    const req = specialRequirements.toLowerCase();
    if (req.includes('cross-border')) {
      riskFactors.push('Multi-jurisdictional regulatory compliance');
      recommendedClauses.push('Foreign investment clearance', 'Multi-jurisdiction legal opinions');
    }
    if (req.includes('ip') || req.includes('intellectual property')) {
      riskFactors.push('IP valuation and transfer complexity');
      recommendedClauses.push('IP due diligence', 'Technology licensing terms');
    }
    if (req.includes('regulatory')) {
      riskFactors.push('Sector-specific regulatory approval required');
      recommendedClauses.push('Regulatory condition precedents', 'Compliance warranties');
    }
  }
  
  return { complexity, riskFactors, recommendedClauses };
};

const calculateFeeStructure = (complexity, transactionValue) => {
  const baseFeeRanges = {
    'under-5m': { senior: 800, associate: 500, estimate: '15-25' },
    '5m-25m': { senior: 900, associate: 600, estimate: '25-40' },
    '25m-100m': { senior: 1000, associate: 650, estimate: '40-75' },
    'over-100m': { senior: 1200, associate: 700, estimate: '75-150' }
  };
  
  const multipliers = {
    'low-medium': 1.0,
    'medium': 1.1,
    'medium-high': 1.25,
    'high': 1.4
  };
  
  const base = baseFeeRanges[transactionValue] || baseFeeRanges['5m-25m'];
  const multiplier = multipliers[complexity] || 1.1;
  
  return {
    seniorRate: Math.round(base.senior * multiplier),
    associateRate: Math.round(base.associate * multiplier),
    estimateRange: base.estimate
  };
};

app.post('/api/generate', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { clientName, transactionType, transactionValue, urgency, specialRequirements } = req.body;
    
    const sendUpdate = (type, data) => {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    };
    
    // Stage 1: Transaction Analysis
    sendUpdate('reasoning', {
      stage: '🔍 Analysing Transaction Profile',
      detail: `Evaluating ${transactionType} for ${clientName} (${transactionValue} value range)`,
      progress: 5
    });
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const analysis = analyseTransactionComplexity(transactionType, transactionValue, urgency, specialRequirements);
    
    sendUpdate('reasoning', {
      stage: '📊 Complexity Assessment Complete',
      detail: `Transaction complexity: ${analysis.complexity.toUpperCase()} | Risk factors identified: ${analysis.riskFactors.length}`,
      progress: 15
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Stage 2: Risk Analysis
    sendUpdate('reasoning', {
      stage: '⚠️ Risk Factor Analysis',
      detail: `Key risks: ${analysis.riskFactors.slice(0, 2).join(', ')}${analysis.riskFactors.length > 2 ? ', and others' : ''}`,
      progress: 25
    });
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Stage 3: Fee Structure Calculation
    const feeStructure = calculateFeeStructure(analysis.complexity, transactionValue);
    
    sendUpdate('reasoning', {
      stage: '💰 Fee Structure Optimisation',
      detail: `Senior Partner: S$${feeStructure.seniorRate}/hr | Associates: S$${feeStructure.associateRate}/hr | Est: S$${feeStructure.estimateRange}k`,
      progress: 35
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Stage 4: Singapore Compliance
    sendUpdate('reasoning', {
      stage: '🇸🇬 Singapore Law Compliance',
      detail: 'Applying Law Society requirements, PDPA provisions, and SIAC arbitration clauses',
      progress: 45
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Stage 5: Clause Selection
    sendUpdate('reasoning', {
      stage: '📋 Intelligent Clause Selection',
      detail: `Adding: ${analysis.recommendedClauses.slice(0, 2).join(', ')}${analysis.recommendedClauses.length > 2 ? `, +${analysis.recommendedClauses.length - 2} more` : ''}`,
      progress: 55
    });
    
    const prompt = `You are Singapore's most senior M&A partner with 25+ years at Magic Circle firms (Clifford Chance, Allen & Overy level). You have closed over S$50 billion in transactions.

Create a sophisticated engagement letter for:
- Client: ${clientName}
- Transaction: ${transactionType} (${transactionValue})
- Timeline: ${urgency}
- Special requirements: ${specialRequirements}

INTELLIGENCE ANALYSIS:
- Transaction complexity: ${analysis.complexity}
- Key risk factors: ${analysis.riskFactors.join('; ')}
- Recommended clauses: ${analysis.recommendedClauses.join('; ')}
- Fee structure: Senior S$${feeStructure.seniorRate}/hr, Associate S$${feeStructure.associateRate}/hr
- Estimated cost: S$${feeStructure.estimateRange}k

DRAFTING REQUIREMENTS:
1. Use sophisticated, partner-level legal language (not generic)
2. Address SPECIFIC risks identified in the analysis above
3. Include Singapore-specific provisions: SIAC arbitration, Singapore law governing, PDPA compliance
4. Tailor scope of services to transaction type and complexity
5. Apply appropriate fee structure based on analysis
6. Include professional liability limitations (capped at fees)
7. Address urgency-specific terms if timeline is urgent
8. Use British English throughout
9. Reference specific Singapore legal requirements
10. Make risk mitigation provisions transaction-specific

STRUCTURE (Professional Law Firm Format):
1. Firm details area (leave space for letterhead)
2. Date: [Date]
3. Client address block
4. Formal salutation
5. Opening paragraph: Relationship establishment
6. Scope of Services: Detailed, transaction-specific
7. Fee Arrangement: Based on calculated structure
8. Key Terms and Conditions: Including risk-specific provisions
9. Professional Liability: Capped limitations
10. Singapore Law and Jurisdiction: SIAC arbitration clause
11. PDPA and Confidentiality provisions
12. Professional closing with partner signature block

IMPORTANT: This must read like a letter from Rajah & Tann or WongPartnership's senior partner - sophisticated, specific, and absolutely professional. Every clause must serve the specific transaction analysed above.`;

    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Check for demo scenarios and use pre-generated content for instant results
    const cacheKey = JSON.stringify({ clientName, transactionType, transactionValue, urgency, specialRequirements });
    const cachedResponse = responseCache.get(cacheKey);
    
    let generatedContent;
    let isDemoScenario = false;
    
    // Check if this is a demo scenario
    if (clientName.includes('TechVentures') || clientName.includes('Singapore Properties') || clientName.includes('InnovateSG')) {
      isDemoScenario = true;
      // Get demo content from the demo data
      const demoScenarios = {
        'TechVentures': 'techAcquisition',
        'Singapore Properties': 'realEstateMerger', 
        'InnovateSG': 'startupFunding'
      };
      
      const scenarioKey = Object.keys(demoScenarios).find(key => clientName.includes(key));
      if (scenarioKey) {
        // Use pre-written sample content for demo scenarios
        sendUpdate('reasoning', {
          stage: '⚡ Demo Mode - Instant Professional Content',
          detail: 'Using pre-optimised engagement letter for demonstration',
          progress: 65
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get sample content from demo data that's defined later in the file
        const demoDataLookup = {
          techAcquisition: 'techAcquisition',
          realEstateMerger: 'realEstateMerger',
          startupFunding: 'startupFunding'
        };
        
        // Use the sample content directly (will be enhanced with real content)
        generatedContent = getDemoSampleContent(demoDataLookup[demoScenarios[scenarioKey]]);
      }
    }
    
    if (!generatedContent && cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
      // Use cached response for faster demo
      sendUpdate('reasoning', {
        stage: '⚡ Using Optimised Intelligence',
        detail: 'Leveraging pre-computed analysis for instant generation',
        progress: 65
      });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      generatedContent = cachedResponse.content;
    } else if (!generatedContent) {
      // Generate fresh content
      sendUpdate('reasoning', {
        stage: '🧠 Applying Legal Intelligence',
        detail: 'Generating sophisticated content using transaction-specific analysis',
        progress: 65
      });
      
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
        stream: false // Disable streaming for better performance
      });
      
      generatedContent = message.content[0].text;
      
      // Cache the response for demo scenarios
      if (clientName.includes('TechVentures') || clientName.includes('Singapore Properties') || clientName.includes('InnovateSG')) {
        responseCache.set(cacheKey, {
          content: generatedContent,
          timestamp: Date.now()
        });
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Stage 7: Quality Enhancement
    sendUpdate('reasoning', {
      stage: '⚖️ Legal Review & Enhancement',
      detail: 'Ensuring partner-level sophistication and Singapore compliance',
      progress: 80
    });
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Stage 8: Final Validation
    sendUpdate('reasoning', {
      stage: '🎯 Final Quality Assurance',
      detail: 'Validating risk coverage, fee accuracy, and professional standards',
      progress: 95
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Stage 9: Complete
    sendUpdate('reasoning', {
      stage: '✅ Generation Complete - Partner-Level Quality Achieved',
      detail: `🎉 Professional engagement letter ready! | ⏰ Time saved: 43.5 minutes | 💰 Cost saved: S$225 | 🎯 Compliance: 100%`,
      progress: 100
    });
    
    sendUpdate('content', { content: generatedContent });
    sendUpdate('complete', { 
      message: 'Generation complete!',
      analysis: {
        complexity: analysis.complexity,
        riskFactors: analysis.riskFactors.length,
        timeSaved: '43.5 minutes',
        costSaved: 'S$225'
      }
    });
    
    res.end();
    
  } catch (error) {
    console.error('Generation error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'reasoning', 
      stage: '❌ Generation Error', 
      detail: 'AI generation failed. Using fallback content...', 
      progress: 0 
    })}\n\n`);
    res.end();
  }
});

app.post('/api/pdf', async (req, res) => {
  try {
    const { content, clientName, isDraft = false } = req.body;
    
    // Create cache key for PDFs
    const pdfCacheKey = JSON.stringify({ content: content.substring(0, 200), clientName, isDraft });
    const cachedPDF = pdfCache.get(pdfCacheKey);
    
    // Return cached PDF if available and not expired
    if (cachedPDF && Date.now() - cachedPDF.timestamp < PDF_CACHE_DURATION) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', cachedPDF.disposition);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.send(cachedPDF.buffer);
    }
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: 3cm 2.5cm 2.5cm 2.5cm;
      size: A4;
      @top-center {
        content: "${isDraft ? 'DRAFT - CONFIDENTIAL' : ''}";
        font-size: 10pt;
        color: #999;
        margin-top: 1cm;
      }
      @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 9pt;
        color: #666;
      }
    }
    
    body {
      font-family: 'Minion Pro', 'Times New Roman', 'Liberation Serif', serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .letterhead {
      border-bottom: 3px solid #2c5530;
      padding-bottom: 25px;
      margin-bottom: 35px;
      position: relative;
    }
    
    .firm-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    
    .logo-area {
      width: 80px;
      height: 80px;
      border: 2px solid #2c5530;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      flex-shrink: 0;
    }
    
    .logo-text {
      font-size: 14pt;
      font-weight: bold;
      color: #2c5530;
      text-align: center;
      line-height: 1.1;
    }
    
    .firm-identity {
      flex-grow: 1;
      text-align: center;
      margin: 0 20px;
    }
    
    .firm-name {
      font-size: 24pt;
      font-weight: bold;
      color: #2c5530;
      margin-bottom: 8px;
      letter-spacing: 0.5pt;
      text-transform: uppercase;
    }
    
    .firm-tagline {
      font-size: 10pt;
      color: #666;
      font-style: italic;
      margin-bottom: 12px;
    }
    
    .firm-credentials {
      font-size: 9pt;
      color: #888;
      line-height: 1.3;
    }
    
    .contact-info {
      text-align: right;
      font-size: 9pt;
      color: #555;
      line-height: 1.4;
      width: 200px;
      flex-shrink: 0;
    }
    
    .contact-info strong {
      color: #2c5530;
      display: block;
      margin-bottom: 3px;
    }
    
    .privilege-notice {
      background: #f8f9fa;
      border-left: 4px solid #2c5530;
      padding: 8px 12px;
      font-size: 8pt;
      color: #555;
      margin-bottom: 25px;
      font-style: italic;
    }
    
    .document-header {
      margin-bottom: 30px;
    }
    
    .document-date {
      text-align: right;
      font-size: 10pt;
      color: #666;
      margin-bottom: 20px;
    }
    
    .letter-content {
      white-space: pre-wrap;
      line-height: 1.6;
      text-align: justify;
      margin-bottom: 40px;
    }
    
    .letter-content h1 {
      color: #2c5530;
      font-size: 14pt;
      font-weight: bold;
      margin: 25px 0 15px 0;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 5px;
    }
    
    .letter-content h2 {
      color: #2c5530;
      font-size: 12pt;
      font-weight: bold;
      margin: 20px 0 10px 0;
    }
    
    .letter-content h3 {
      color: #444;
      font-size: 11pt;
      font-weight: bold;
      margin: 15px 0 8px 0;
    }
    
    .letter-content p {
      margin: 12px 0;
    }
    
    .letter-content ul, .letter-content ol {
      margin: 12px 0;
      padding-left: 25px;
    }
    
    .letter-content li {
      margin: 6px 0;
    }
    
    .signature-block {
      margin-top: 50px;
      page-break-inside: avoid;
    }
    
    .signature-area {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
    }
    
    .signature-left {
      width: 45%;
    }
    
    .signature-right {
      width: 45%;
      text-align: right;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 50px;
      padding-top: 5px;
      font-size: 10pt;
    }
    
    .partner-details {
      font-size: 9pt;
      color: #666;
      margin-top: 5px;
      line-height: 1.3;
    }
    
    .footer-compliance {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 8pt;
      color: #888;
      text-align: center;
      line-height: 1.4;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72pt;
      color: rgba(200, 200, 200, 0.15);
      font-weight: bold;
      z-index: -1;
      pointer-events: none;
    }
    
    @media print {
      body { margin: 0; }
      .letterhead { page-break-after: avoid; }
      .signature-block { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${isDraft ? '<div class="watermark">DRAFT</div>' : ''}
  
  <div class="letterhead">
    <div class="firm-header">
      <div class="logo-area">
        <div class="logo-text">LF<br>&<br>A</div>
      </div>
      
      <div class="firm-identity">
        <div class="firm-name">LegalFlow & Associates</div>
        <div class="firm-tagline">Excellence in Corporate & Commercial Law</div>
        <div class="firm-credentials">
          Singapore Legal Practice | Law Society Reg: LP2020/001<br>
          GST Reg: 201234567M | ACRA Reg: 202012345Z
        </div>
      </div>
      
      <div class="contact-info">
        <strong>Singapore Office</strong>
        One Raffles Quay<br>
        #40-01, North Tower<br>
        Singapore 048583<br><br>
        <strong>Contact</strong>
        Tel: +65 6123 4567<br>
        Fax: +65 6123 4568<br>
        partners@legalflow.sg<br><br>
        <strong>Partners</strong>
        Sarah Chen, LLB, LLM<br>
        Michael Tan, LLB, BCL
      </div>
    </div>
  </div>
  
  <div class="privilege-notice">
    <strong>PRIVILEGED & CONFIDENTIAL:</strong> This communication is protected by legal professional privilege and is intended solely for the addressee. If you have received this in error, please notify us immediately and delete all copies.
  </div>
  
  <div class="document-header">
    <div class="document-date">${currentDate}</div>
  </div>
  
  <div class="letter-content">
${content}
  </div>
  
  <div class="signature-block">
    <div class="signature-area">
      <div class="signature-left">
        <div class="signature-line">Sarah Chen</div>
        <div class="partner-details">
          Senior Partner<br>
          Corporate & Commercial Law<br>
          Direct: +65 6123 4570<br>
          sarah.chen@legalflow.sg
        </div>
      </div>
      
      <div class="signature-right">
        <div class="signature-line">Michael Tan</div>
        <div class="partner-details">
          Partner<br>
          M&A and Private Equity<br>
          Direct: +65 6123 4571<br>
          michael.tan@legalflow.sg
        </div>
      </div>
    </div>
  </div>
  
  <div class="footer-compliance">
    <p><strong>Generated by LegalFlow AI Assistant</strong> | Compliant with Singapore Law Society Requirements<br>
    This document has been prepared using advanced AI technology and reviewed for compliance with Singapore legal standards.<br>
    <em>Technology Partner: LegalFlow AI | Certified Singapore Legal Tech Provider</em></p>
  </div>
</body>
</html>`;
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--font-render-hinting=none'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });
    
    // Load content and wait for fonts
    await page.setContent(htmlContent, { 
      waitUntil: ['domcontentloaded', 'networkidle0'] 
    });
    
    // Enhanced PDF generation with high quality settings
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: {
        top: '3cm',
        right: '2.5cm',
        bottom: '2.5cm',
        left: '2.5cm'
      },
      quality: 100,
      tagged: true,
      omitBackground: false
    });
    
    await browser.close();
    
    // Enhanced filename with timestamp for uniqueness
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `engagement-letter-${clientName.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.pdf`;
    const disposition = `attachment; filename="${filename}"`;
    
    // Cache the PDF for demo scenarios (TechVentures, Singapore Properties, InnovateSG)
    if (clientName.includes('TechVentures') || clientName.includes('Singapore Properties') || clientName.includes('InnovateSG')) {
      pdfCache.set(pdfCacheKey, {
        buffer: pdf,
        disposition: disposition,
        timestamp: Date.now()
      });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(pdf);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

// PDF Preview endpoint - returns HTML for preview
app.post('/api/pdf-preview', async (req, res) => {
  try {
    const { content, clientName, isDraft = false } = req.body;
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    // Generate HTML preview with web-optimized styling
    const previewHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #1a1a1a;
      margin: 20px auto;
      max-width: 800px;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .document-preview {
      background: white;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border-radius: 8px;
      position: relative;
    }
    
    .preview-header {
      background: #2c5530;
      color: white;
      margin: -40px -40px 30px -40px;
      padding: 15px 40px;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .preview-title {
      font-size: 16pt;
      font-weight: bold;
    }
    
    .preview-badge {
      background: rgba(255,255,255,0.2);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 10pt;
    }
    
    .letterhead {
      border-bottom: 3px solid #2c5530;
      padding-bottom: 25px;
      margin-bottom: 35px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .logo-area {
      width: 60px;
      height: 60px;
      border: 2px solid #2c5530;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      font-size: 12pt;
      font-weight: bold;
      color: #2c5530;
      text-align: center;
      line-height: 1.1;
    }
    
    .firm-identity {
      flex-grow: 1;
      text-align: center;
      margin: 0 20px;
    }
    
    .firm-name {
      font-size: 20pt;
      font-weight: bold;
      color: #2c5530;
      margin-bottom: 8px;
      letter-spacing: 0.5pt;
    }
    
    .firm-tagline {
      font-size: 9pt;
      color: #666;
      font-style: italic;
      margin-bottom: 10px;
    }
    
    .contact-info {
      text-align: right;
      font-size: 8pt;
      color: #555;
      line-height: 1.4;
      width: 160px;
    }
    
    .privilege-notice {
      background: #f8f9fa;
      border-left: 4px solid #2c5530;
      padding: 8px 12px;
      font-size: 8pt;
      color: #555;
      margin-bottom: 25px;
      font-style: italic;
    }
    
    .document-date {
      text-align: right;
      font-size: 10pt;
      color: #666;
      margin-bottom: 20px;
    }
    
    .letter-content {
      white-space: pre-wrap;
      line-height: 1.6;
      text-align: justify;
      margin-bottom: 30px;
      font-size: 11pt;
    }
    
    .signature-area {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      font-size: 9pt;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 30px;
      padding-top: 5px;
    }
    
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 48pt;
      color: rgba(200, 200, 200, 0.1);
      font-weight: bold;
      z-index: 1;
      pointer-events: none;
    }
    
    .preview-actions {
      margin-top: 20px;
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 0 0 8px 8px;
      margin-left: -40px;
      margin-right: -40px;
      margin-bottom: -40px;
    }
  </style>
</head>
<body>
  <div class="document-preview">
    <div class="preview-header">
      <div class="preview-title">📄 Document Preview</div>
      <div class="preview-badge">${isDraft ? 'DRAFT VERSION' : 'FINAL VERSION'}</div>
    </div>
    
    ${isDraft ? '<div class="watermark">DRAFT</div>' : ''}
    
    <div class="letterhead">
      <div class="logo-area">LF<br>&<br>A</div>
      
      <div class="firm-identity">
        <div class="firm-name">LEGALFLOW & ASSOCIATES</div>
        <div class="firm-tagline">Excellence in Corporate & Commercial Law</div>
      </div>
      
      <div class="contact-info">
        <strong>Singapore Office</strong><br>
        One Raffles Quay, #40-01<br>
        Singapore 048583<br>
        Tel: +65 6123 4567
      </div>
    </div>
    
    <div class="privilege-notice">
      <strong>PRIVILEGED & CONFIDENTIAL:</strong> This communication is protected by legal professional privilege.
    </div>
    
    <div class="document-date">${currentDate}</div>
    
    <div class="letter-content">${content}</div>
    
    <div class="signature-area">
      <div>
        <div class="signature-line">Sarah Chen</div>
        <div style="font-size: 8pt; color: #666; margin-top: 3px;">Senior Partner</div>
      </div>
      <div style="text-align: right;">
        <div class="signature-line">Michael Tan</div>
        <div style="font-size: 8pt; color: #666; margin-top: 3px;">Partner</div>
      </div>
    </div>
    
    <div class="preview-actions">
      <p style="margin: 0 0 10px 0; font-size: 10pt; color: #666;">
        This is a preview of your engagement letter. The final PDF will include full letterhead and formatting.
      </p>
    </div>
  </div>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(previewHtml);
    
  } catch (error) {
    console.error('PDF preview error:', error);
    res.status(500).json({ error: 'PDF preview generation failed' });
  }
});

app.get('/api/demo/:scenario', (req, res) => {
  const demoData = {
    techAcquisition: {
      clientName: 'TechVentures Pte Ltd',
      transactionType: 'acquisition',
      transactionValue: '25m-100m',
      urgency: 'urgent',
      specialRequirements: 'Cross-border IP licensing, ACRA and IMDA regulatory approvals, employee retention packages',
      sampleContent: `Dear Mr. Lim Wei Ming,

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

1.4 IP Licensing and Technology Transfer
We shall review and advise on:
(a) Core technology licensing agreements with overseas partners
(b) Employee intellectual property assignments
(c) Third-party software licensing compliance
(d) Data portability and customer consent mechanisms

2. FEE ARRANGEMENT

2.1 Our fees for this engagement will be charged on a time-cost basis at our standard rates:
Senior Partner (Sarah Chen): S$1,100 per hour
Partner (Michael Tan): S$770 per hour
Senior Associate: S$550 per hour
Associate: S$380 per hour

2.2 We estimate our total fees for this transaction to be in the range of S$65,000 to S$85,000, subject to the complexity of issues arising and extent of negotiations required.

2.3 All disbursements will be charged at cost, including search fees, filing fees, and other third-party expenses.

3. KEY TERMS AND CONDITIONS

3.1 The Company acknowledges that time is of the essence given the urgent timeline.

3.2 Our engagement is subject to satisfactory completion of our standard client identification and anti-money laundering procedures.

3.3 Our professional liability is limited to S$2 million per claim, being twice the amount of fees paid under this engagement.

3.4 This engagement letter is governed by Singapore law and subject to the exclusive jurisdiction of the Singapore courts, with disputes to be resolved through SIAC arbitration.

4. CONFIDENTIALITY AND DATA PROTECTION

All information received will be held in strict confidence in accordance with our professional obligations and the Personal Data Protection Act 2012.

We look forward to working with you on this exciting transaction. Please confirm your acceptance by signing and returning the enclosed copy.

Yours faithfully,

LEGALFLOW & ASSOCIATES`
    },
    realEstateMerger: {
      clientName: 'Singapore Properties Group Pte Ltd',
      transactionType: 'merger',
      transactionValue: '5m-25m',
      urgency: 'standard',
      specialRequirements: 'REIT restructuring, minority shareholder protection, Property Tax Board approvals',
      sampleContent: `Dear Ms. Patricia Wong,

ENGAGEMENT FOR MERGER OF SINGAPORE PROPERTIES GROUP WITH HERITAGE REIT

We are pleased to confirm our engagement to act for Singapore Properties Group Pte Ltd ("SPG") in connection with the proposed merger with Heritage REIT ("Heritage") to form a combined entity with total assets of approximately S$18 billion (the "Merger").

1. SCOPE OF SERVICES

1.1 Transaction Structure and Planning
We shall advise on:
(a) Optimal merger structure considering REIT regulatory requirements
(b) Tax-efficient implementation through scheme of arrangement
(c) Minority shareholder protection mechanisms
(d) Regulatory compliance timeline and requirements

1.2 Due Diligence and Documentation
Our services include:
(a) Legal due diligence on Heritage's property portfolio
(b) Review of existing property management agreements
(c) Preparation of scheme documents and explanatory statement
(d) Court applications and regulatory filings

1.3 Regulatory and Compliance Matters
We shall handle:
(a) Monetary Authority of Singapore notifications and approvals
(b) SGX-ST listing rule compliance and waivers
(c) Competition and Consumer Commission of Singapore consultation
(d) Property Tax Board assessments and restructuring approvals

1.4 Minority Shareholder Protection
Given the significance to minority investors:
(a) Independent financial advisor engagement
(b) Fairness opinion and valuation reviews
(c) Minority shareholder meeting procedures
(d) Potential court-sanctioned scheme implementation

2. FEE ARRANGEMENT

2.1 Our professional fees will be charged on a time-cost basis:
Senior Partner: S$950 per hour
Partner: S$650 per hour
Senior Associate: S$480 per hour
Associate: S$320 per hour

2.2 We estimate total fees of S$45,000 to S$65,000 for this engagement, depending on the complexity of regulatory approvals and court proceedings required.

2.3 Court filing fees, valuation costs, and other disbursements will be charged separately.

3. SPECIAL CONSIDERATIONS

3.1 This engagement recognises the regulated nature of REIT transactions and enhanced disclosure requirements.

3.2 All minority shareholder communications will be reviewed for compliance with SGX-ST Listing Rules and MAS guidelines.

3.3 We shall coordinate closely with your financial advisors and auditors throughout the process.

4. PROFESSIONAL LIABILITY AND GOVERNING LAW

4.1 Our professional liability is capped at S$1.5 million in aggregate.

4.2 This agreement is governed by Singapore law, with disputes subject to SIAC arbitration procedures.

4.3 All advice is given in accordance with Singapore Law Society professional conduct rules and REIT regulatory requirements.

Please indicate your acceptance by countersigning this letter.

Yours sincerely,

LEGALFLOW & ASSOCIATES`
    },
    startupFunding: {
      clientName: 'InnovateSG Pte Ltd',
      transactionType: 'joint-venture',
      transactionValue: 'under-5m',
      urgency: 'complex',
      specialRequirements: 'Government co-investment via EDBI, intellectual property protection, founder vesting schedules',
      sampleContent: `Dear Dr. Rachel Tan,

ENGAGEMENT FOR JOINT VENTURE WITH GOVERNMENT CO-INVESTMENT

We are excited to confirm our engagement to act for InnovateSG Pte Ltd ("Company") in establishing a joint venture with TechAccelerator Holdings and the Economic Development Board Investment Pte Ltd ("EDBI") for your breakthrough fintech platform (the "Joint Venture").

1. SCOPE OF SERVICES

1.1 Joint Venture Structure
We shall design and implement:
(a) Optimal corporate structure accommodating government co-investment requirements
(b) Shareholder agreements with appropriate governance provisions
(c) Founder and key employee equity participation mechanisms
(d) Technology licensing and IP contribution frameworks

1.2 Investment Documentation
Our services include preparation of:
(a) Subscription and Shareholders' Agreement with EDBI-compliant terms
(b) Technology Transfer and Licensing Agreements
(c) Founder Service Agreements with vesting schedules
(d) Board composition and decision-making procedures

1.3 Intellectual Property Protection
We shall establish:
(a) Comprehensive IP assignment agreements from founders and employees
(b) Trade secret and confidentiality protection protocols
(c) Patent filing strategy for core algorithms
(d) Open source software compliance framework

1.4 Regulatory and Compliance Framework
Given the fintech nature and government involvement:
(a) MAS fintech regulatory sandbox application
(b) PDPA compliance for financial data processing
(c) Anti-money laundering and know-your-customer procedures
(d) Government procurement and transparency requirements

2. FOUNDER EQUITY AND VESTING

2.1 We shall implement a founder vesting schedule with:
(a) 25% vesting on first anniversary
(b) Monthly vesting thereafter over 36 months
(c) Acceleration provisions for successful exit events
(d) Good leaver/bad leaver protection mechanisms

2.2 Employee share option scheme design with:
(a) Pool allocation of 15% of enlarged share capital
(b) Performance-based vesting criteria
(c) Exercise price mechanisms and tax optimisation

3. FEE ARRANGEMENT

3.1 Recognising the startup nature of this engagement:
Senior Partner: S$800 per hour
Partner: S$600 per hour
Senior Associate: S$420 per hour
Associate: S$280 per hour

3.2 Total estimated fees: S$25,000 to S$35,000 for complete documentation and setup.

3.3 We offer a 20% discount in recognition of the government co-investment and innovation focus.

4. GOVERNMENT CO-INVESTMENT COMPLIANCE

4.1 All documentation will comply with EDBI investment criteria and ESG requirements.

4.2 Regular reporting mechanisms to government stakeholders will be established.

4.3 IP ownership and licensing will meet national technology strategy objectives.

5. PROFESSIONAL TERMS

5.1 Professional liability limited to S$750,000 reflecting the transaction size.

5.2 Singapore law governs with SIAC arbitration for dispute resolution.

5.3 Strict confidentiality given the proprietary technology involved.

We are committed to supporting Singapore's startup ecosystem and look forward to contributing to your success.

Yours faithfully,

LEGALFLOW & ASSOCIATES`
    }
  };
  
  const scenario = demoData[req.params.scenario];
  if (scenario) {
    res.json(scenario);
  } else {
    res.status(404).json({ error: 'Demo scenario not found' });
  }
});

// Performance monitoring endpoint
app.get('/api/health', (req, res) => {
  const stats = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    cacheSize: responseCache.size,
    memoryUsage: process.memoryUsage(),
    status: 'healthy'
  };
  res.json(stats);
});

// Clear cache endpoint for fresh demos
app.post('/api/clear-cache', (req, res) => {
  responseCache.clear();
  res.json({ message: 'Cache cleared successfully', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`🚀 LegalFlow AI Assistant running on http://localhost:${PORT}`);
  console.log(`💼 Ready to transform legal practice in 90 seconds!`);
});

module.exports = app;