const puppeteer = require('puppeteer');

// PDF caching system
const pdfCache = new Map();
const PDF_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for PDFs

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

  const { content, clientName, isDraft = true } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }

  try {
    // Check PDF cache first
    const cacheKey = JSON.stringify({ content, clientName, isDraft });
    const cached = pdfCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < PDF_CACHE_DURATION) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="engagement-letter-${clientName || 'client'}.pdf"`);
      return res.send(cached.buffer);
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

    const watermarkStyle = isDraft ? `
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 120px;
        color: rgba(220, 220, 220, 0.3);
        font-weight: bold;
        z-index: 1000;
        pointer-events: none;
        font-family: Arial, sans-serif;
      }
    ` : '';

    const watermarkHTML = isDraft ? '<div class="watermark">DRAFT</div>' : '';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 20mm 15mm 20mm 15mm;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Minion Pro', 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #2c3e50;
          margin: 0;
          padding: 0;
          background: white;
          position: relative;
        }
        
        ${watermarkStyle}
        
        .letterhead {
          border-bottom: 3px solid #1e40af;
          padding-bottom: 15mm;
          margin-bottom: 15mm;
          position: relative;
        }
        
        .firm-logo {
          width: 40mm;
          height: 12mm;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          border-radius: 2mm;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14pt;
          margin-bottom: 8mm;
        }
        
        .firm-details {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .firm-info h1 {
          font-size: 22pt;
          font-weight: bold;
          color: #1e40af;
          margin: 0 0 4mm 0;
          letter-spacing: 0.5pt;
        }
        
        .firm-info .tagline {
          font-size: 9pt;
          color: #64748b;
          font-style: italic;
          margin-bottom: 6mm;
        }
        
        .firm-info .credentials {
          font-size: 8pt;
          color: #475569;
          line-height: 1.3;
        }
        
        .contact-info {
          text-align: right;
          font-size: 9pt;
          color: #475569;
          line-height: 1.4;
        }
        
        .contact-info .partner {
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 2mm;
        }
        
        .document-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          color: #1e40af;
          margin: 15mm 0 10mm 0;
          text-transform: uppercase;
          letter-spacing: 1pt;
        }
        
        .content {
          font-size: 11pt;
          line-height: 1.5;
          text-align: justify;
          hyphens: auto;
        }
        
        .content h2 {
          font-size: 12pt;
          font-weight: bold;
          color: #1e40af;
          margin: 8mm 0 4mm 0;
          text-transform: uppercase;
          letter-spacing: 0.5pt;
        }
        
        .content h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 6mm 0 3mm 0;
          color: #374151;
        }
        
        .content p {
          margin: 3mm 0;
        }
        
        .numbered-clause {
          margin: 4mm 0;
        }
        
        .sub-clause {
          margin-left: 8mm;
          margin: 2mm 0 2mm 8mm;
        }
        
        .signature-block {
          margin-top: 20mm;
          page-break-inside: avoid;
        }
        
        .signature-line {
          border-bottom: 1px solid #374151;
          width: 60mm;
          height: 15mm;
          margin: 8mm 0 3mm 0;
        }
        
        .footer {
          position: fixed;
          bottom: 10mm;
          left: 15mm;
          right: 15mm;
          font-size: 8pt;
          color: #64748b;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 3mm;
        }
        
        .privilege-notice {
          font-size: 8pt;
          color: #dc2626;
          font-weight: bold;
          margin-top: 10mm;
          text-align: center;
          border: 1px solid #dc2626;
          padding: 3mm;
          background-color: #fef2f2;
        }

        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      ${watermarkHTML}
      
      <div class="letterhead">
        <div class="firm-logo">
          LegalFlow
        </div>
        
        <div class="firm-details">
          <div class="firm-info">
            <h1>LEGALFLOW & ASSOCIATES</h1>
            <div class="tagline">Singapore Legal Innovation Partners</div>
            <div class="credentials">
              Advocates & Solicitors | Notaries Public<br>
              Member, Law Society of Singapore<br>
              SIAC Panel Arbitrators | Singapore Mediation Centre
            </div>
          </div>
          
          <div class="contact-info">
            <div class="partner">Sarah Chen, Senior Partner</div>
            One Raffles Place, #40-02<br>
            Singapore 048616<br>
            T: +65 6234 5678<br>
            E: sarah.chen@legalflow.sg<br>
            W: www.legalflow.sg
          </div>
        </div>
      </div>
      
      <div class="document-title">
        ENGAGEMENT LETTER
      </div>
      
      <div class="content">
        ${content.replace(/\n/g, '<br>').replace(/(\d+\.\s)/g, '<div class="numbered-clause">$1').replace(/\([a-z]\)/g, '<div class="sub-clause">($&')}
      </div>
      
      <div class="signature-block">
        <p><strong>Please confirm your acceptance of this engagement by signing and returning the enclosed copy.</strong></p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 15mm;">
          <div>
            <div class="signature-line"></div>
            <strong>Sarah Chen</strong><br>
            Senior Partner<br>
            LegalFlow & Associates
          </div>
          
          <div>
            <div class="signature-line"></div>
            <strong>Client Acceptance</strong><br>
            ${clientName}<br>
            Date: _________________
          </div>
        </div>
      </div>
      
      <div class="privilege-notice">
        PRIVILEGED AND CONFIDENTIAL<br>
        This document contains legally privileged and confidential information intended solely for the named client.
      </div>
      
      <div class="footer">
        LegalFlow & Associates | Advocates & Solicitors | Singapore | Page 1 of 1
      </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm'
      }
    });

    await browser.close();

    // Cache the generated PDF
    pdfCache.set(cacheKey, {
      buffer: pdfBuffer,
      timestamp: Date.now()
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="engagement-letter-${clientName || 'client'}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};