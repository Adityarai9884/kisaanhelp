// services/gemini.js — Google Gemini AI Integration
// Phase 4: Real price predictions using 30-day Mandi data
const axios = require('axios');

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Call Gemini API with a prompt
 */
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const res = await axios.post(
    `${GEMINI_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512,
      },
    },
    { timeout: 15000 }
  );

  const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim();
}

/**
 * Parse JSON safely from Gemini's text response
 */
function parseJSON(text) {
  try {
    // Strip markdown code blocks if present
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (_) {
    return null;
  }
}

/**
 * getPricePrediction(crop, district, rates30d)
 * rates30d = array of { date, price } objects
 * Returns { predictedPrice, minPrice, maxPrice, trend, recommendation, reasoning, confidence }
 */
async function getPricePrediction(crop, district, rates30d) {
  const ratesSummary = rates30d.length > 0
    ? rates30d.map(r => `${r.date}: ₹${r.price}/qtl`).join(', ')
    : 'No historical data available — use market averages';

  const prompt = `
You are an agricultural market analyst for Indian mandis. Analyze the following 30-day price data for ${crop} in ${district} district, Uttar Pradesh, India.

Historical prices (last 30 days):
${ratesSummary}

Based on this data, provide a price prediction for the next 7 days. Consider seasonal patterns, supply-demand dynamics, and typical Indian agricultural market behavior.

Respond ONLY with valid JSON in this exact format (no extra text):
{
  "predictedPrice": <number in ₹ per quintal>,
  "minPrice": <lower bound estimate>,
  "maxPrice": <upper bound estimate>,
  "trend": "<rising|falling|stable>",
  "recommendation": "<SELL NOW|HOLD 3-5 DAYS|HOLD 7+ DAYS>",
  "reasoning": "<2 sentences explaining why>",
  "confidence": "<high|medium|low>"
}
`;

  try {
    const text = await callGemini(prompt);
    const parsed = parseJSON(text);
    if (parsed && parsed.predictedPrice) return parsed;

    // Fallback if parsing fails
    return getFallbackPrediction(crop);
  } catch (err) {
    console.error('Gemini price prediction error:', err.message);
    return getFallbackPrediction(crop);
  }
}

/**
 * getDemandAnalysis(crop, district, recentSearches, recentOrders)
 * Returns demand surge analysis
 */
async function getDemandAnalysis(crop, district, recentSearches, recentOrders) {
  const prompt = `
You are an agricultural demand analyst. Analyze the market demand for ${crop} in ${district}, Uttar Pradesh.

Recent activity (last 24 hours):
- Buyer searches: ${recentSearches}
- Orders placed: ${recentOrders}

Is this a demand surge? Provide a brief market alert for farmers.

Respond ONLY with valid JSON:
{
  "isSurge": <true|false>,
  "severity": "<high|medium|low>",
  "title": "<short alert title>",
  "message": "<2 sentence alert for farmers>",
  "priceImpact": "<expected price impact percentage, e.g. +5% to +10%>"
}
`;

  try {
    const text = await callGemini(prompt);
    const parsed = parseJSON(text);
    if (parsed) return parsed;
    return { isSurge: recentSearches > 5, severity: 'medium', title: 'Market Activity Detected', message: `${crop} demand is active in ${district}.`, priceImpact: '+3% to +7%' };
  } catch (err) {
    console.error('Gemini demand analysis error:', err.message);
    return { isSurge: false, severity: 'low', title: 'Market Update', message: `${crop} market conditions are normal in ${district}.`, priceImpact: '0%' };
  }
}

/**
 * getWeatherAdvice(crop, district, weatherData)
 * Returns harvest/transport advice based on weather
 */
async function getWeatherAdvice(crop, district, weatherData) {
  const prompt = `
You are an agricultural advisor for farmers in ${district}, Uttar Pradesh, India.

Current weather conditions:
${JSON.stringify(weatherData, null, 2)}

The farmer has ${crop} that needs to be harvested/transported.

Give a specific, actionable recommendation.

Respond ONLY with valid JSON:
{
  "urgency": "<immediate|soon|normal>",
  "action": "<HARVEST NOW|TRANSPORT TODAY|WAIT|SAFE TO PROCEED>",
  "title": "<short alert title>",
  "advice": "<2-3 sentence specific advice for the farmer>",
  "riskLevel": "<high|medium|low>"
}
`;

  try {
    const text = await callGemini(prompt);
    const parsed = parseJSON(text);
    if (parsed) return parsed;
    return { urgency: 'normal', action: 'SAFE TO PROCEED', title: 'Weather Normal', advice: 'Current weather conditions are suitable for harvesting and transport.', riskLevel: 'low' };
  } catch (err) {
    console.error('Gemini weather advice error:', err.message);
    return { urgency: 'normal', action: 'SAFE TO PROCEED', title: 'Weather Advisory', advice: 'Check local weather before proceeding.', riskLevel: 'low' };
  }
}

/**
 * Fallback predictions when Gemini API is unavailable
 */
function getFallbackPrediction(crop) {
  const fallbacks = {
    Wheat:     { predictedPrice: 2950, minPrice: 2800, maxPrice: 3100, trend: 'rising',  recommendation: 'HOLD 3-5 DAYS', reasoning: 'Wheat prices historically rise after rabi harvest due to export demand. Holding for 3-5 days likely to yield better returns.', confidence: 'medium' },
    Rice:      { predictedPrice: 3200, minPrice: 3000, maxPrice: 3400, trend: 'stable',  recommendation: 'SELL NOW',      reasoning: 'Rice prices are stable. Current market conditions are favorable for immediate sale.', confidence: 'medium' },
    Mustard:   { predictedPrice: 5400, minPrice: 5100, maxPrice: 5700, trend: 'rising',  recommendation: 'HOLD 7+ DAYS',  reasoning: 'Mustard demand is high due to edible oil requirements. Prices expected to rise further.', confidence: 'high' },
    Sugarcane: { predictedPrice: 390,  minPrice: 360,  maxPrice: 420,  trend: 'stable',  recommendation: 'SELL NOW',      reasoning: 'Sugarcane prices are government-regulated. Current rates are good.', confidence: 'high' },
    Cotton:    { predictedPrice: 7400, minPrice: 7000, maxPrice: 7800, trend: 'rising',  recommendation: 'HOLD 3-5 DAYS', reasoning: 'Cotton export demand from textile mills is strong. Short-term hold recommended.', confidence: 'medium' },
    Soybean:   { predictedPrice: 4300, minPrice: 4100, maxPrice: 4600, trend: 'falling', recommendation: 'SELL NOW',      reasoning: 'Soybean prices facing downward pressure from imports. Immediate sale recommended.', confidence: 'medium' },
  };
  return fallbacks[crop] || { predictedPrice: 3000, minPrice: 2700, maxPrice: 3300, trend: 'stable', recommendation: 'SELL NOW', reasoning: 'Market conditions are moderate. Current prices are reasonable.', confidence: 'low' };
}

module.exports = { getPricePrediction, getDemandAnalysis, getWeatherAdvice };
