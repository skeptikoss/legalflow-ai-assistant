const { DEMO_SCENARIOS } = require('../../demo.js');

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

  const { scenario } = req.query;

  if (!scenario || !DEMO_SCENARIOS[scenario]) {
    return res.status(404).json({ 
      error: 'Scenario not found',
      available: Object.keys(DEMO_SCENARIOS)
    });
  }

  const scenarioData = DEMO_SCENARIOS[scenario];
  
  // Calculate ROI metrics for this scenario
  const timeSavedMinutes = scenarioData.roiImpact.timeSaved;
  const costSavedPerDocument = scenarioData.roiImpact.costSaved;
  const documentsPerWeek = 15; // Typical senior associate workload
  const weeksPerYear = 50; // Account for holidays
  
  const annualTimeSaved = timeSavedMinutes * documentsPerWeek * weeksPerYear; // minutes
  const annualCostSaved = costSavedPerDocument * documentsPerWeek * weeksPerYear;
  
  const response = {
    ...scenarioData,
    roi: {
      timeSavedPerDocument: `${timeSavedMinutes} minutes`,
      costSavedPerDocument: `S$${costSavedPerDocument}`,
      annualTimeSaved: `${Math.round(annualTimeSaved / 60)} hours`,
      annualCostSaved: `S$${annualCostSaved.toLocaleString()}`,
      documentsPerYear: documentsPerWeek * weeksPerYear,
      lifestyleImpact: {
        dailyTimeSaved: `${Math.round(timeSavedMinutes * 3)} minutes per day`,
        weeklyTimeSaved: `${Math.round(timeSavedMinutes * documentsPerWeek / 60 * 10) / 10} hours per week`,
        workLifeBalance: timeSavedMinutes > 40 ? "Finish by 6pm consistently" : "Reclaim lunch breaks"
      }
    },
    demoTips: {
      highlight: `${scenario === 'techAcquisition' ? 'Cross-border IP complexity' : scenario === 'realEstateMerger' ? 'REIT regulatory requirements' : 'Government co-investment terms'}`,
      wow: `Watch how it handles ${scenarioData.data.specialRequirements.split(',')[0].toLowerCase()}`
    }
  };

  res.json(response);
};