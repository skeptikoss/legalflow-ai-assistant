const DEMO_SCENARIOS = {
  techAcquisition: {
    title: "💻 Tech Acquisition - High Complexity",
    description: "S$50M acquisition with IP licensing and regulatory approvals",
    data: {
      clientName: 'TechVentures Pte Ltd',
      transactionType: 'acquisition',
      transactionValue: '25m-100m',
      urgency: 'urgent',
      specialRequirements: 'Cross-border IP licensing, ACRA and IMDA regulatory approvals, employee retention packages'
    },
    expectedDuration: 85,
    roiImpact: {
      timeSaved: 44,
      costSaved: 330,
      complexityScore: 9
    }
  },

  realEstateMerger: {
    title: "🏢 Real Estate Merger - Medium Complexity",
    description: "S$25M REIT merger with minority shareholder considerations",
    data: {
      clientName: 'Singapore Properties Group Pte Ltd',
      transactionType: 'merger',
      transactionValue: '5m-25m',
      urgency: 'standard',
      specialRequirements: 'REIT restructuring, minority shareholder protection, Property Tax Board approvals'
    },
    expectedDuration: 75,
    roiImpact: {
      timeSaved: 40,
      costSaved: 280,
      complexityScore: 7
    }
  },

  startupFunding: {
    title: "🚀 Startup Joint Venture - Emerging Complexity",
    description: "S$8M government co-investment with IP protection",
    data: {
      clientName: 'InnovateSG Pte Ltd',
      transactionType: 'joint-venture',
      transactionValue: 'under-5m',
      urgency: 'complex',
      specialRequirements: 'Government co-investment via EDBI, intellectual property protection, founder vesting schedules'
    },
    expectedDuration: 90,
    roiImpact: {
      timeSaved: 35,
      costSaved: 175,
      complexityScore: 6
    }
  }
};

const DEMO_TALKING_POINTS = {
  opening: [
    "How long did your last engagement letter take?",
    "Let me show you 90 seconds that will change your practice",
    "This is what legal work looks like in 2025"
  ],
  
  during: [
    "Notice how it's actually thinking about your specific transaction",
    "See how it identifies risks automatically",
    "Watch it apply Singapore-specific requirements",
    "The AI is considering compliance while generating"
  ],
  
  impact: [
    "That's 43.5 minutes back in your day",
    "Multiply this by 15 letters per week",
    "That's S$219,000 in annual savings for your practice",
    "Plus perfect consistency and zero compliance errors"
  ],
  
  close: [
    "This is with 50% government PSG funding available",
    "Imagine this for every document type",
    "Your competitors are evaluating similar solutions",
    "Let's discuss a 2-week pilot for your practice"
  ]
};

const DEMO_TIMINGS = {
  formFill: 30,      // 30 seconds to fill form
  generation: 60,     // 60 seconds for AI generation
  review: 30,         // 30 seconds to review output
  total: 120,         // 2 minutes total (under promise)
  traditional: 2700   // 45 minutes traditional process
};

const SINGAPORE_CONTEXT = {
  firms: [
    "Allen & Gledhill",
    "WongPartnership", 
    "Rajah & Tann",
    "Drew & Napier",
    "Shook Lin & Bok"
  ],
  
  recentDeals: [
    "Grab-Uber Southeast Asia merger",
    "CapitaLand-CapitaMalls merger", 
    "DBS-ANZ wealth management acquisition",
    "Keppel-Sembcorp offshore & marine consolidation"
  ],
  
  regulations: [
    "Companies Act amendments 2023",
    "PDPA updates for cross-border data",
    "MAS guidelines on fintech M&A",
    "ACRA simplified merger procedures"
  ]
};

module.exports = {
  DEMO_SCENARIOS,
  DEMO_TALKING_POINTS,
  DEMO_TIMINGS,
  SINGAPORE_CONTEXT
};