// services/demandCron.js — Hourly demand surge detection
const cron         = require('node-cron');
const Order        = require('../models/Order');
const Crop         = require('../models/Crop');
const User         = require('../models/User');
const Notification = require('../models/Notification');
const { getDemandAnalysis } = require('./gemini');

const THRESHOLD = Number(process.env.DEMAND_SURGE_THRESHOLD) || 5;

/**
 * checkDemandSurge()
 * Runs every hour. For each crop+district combo:
 * - Counts orders placed in last 24h
 * - If count > threshold → get Gemini analysis
 * - Notify all farmers in that district with that crop
 */
async function checkDemandSurge() {
  console.log('🔍 Demand surge check running...');
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Aggregate orders in last 24h by cropName + district
    const surges = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { crop: '$cropName', district: '$district' }, count: { $sum: 1 } } },
      { $match: { count: { $gte: THRESHOLD } } },
    ]);

    for (const surge of surges) {
      const { crop, district } = surge._id;
      const count = surge.count;

      // Get Gemini demand analysis
      const analysis = await getDemandAnalysis(crop, district, count * 3, count);

      if (!analysis.isSurge) continue;

      // Find all farmers in this district with this crop listed
      const activeCrops = await Crop.find({ name: crop, district, status: 'active' });
      const farmerIds   = [...new Set(activeCrops.map(c => c.farmerId.toString()))];
      const farmers     = await User.find({ _id: { $in: farmerIds } });

      for (const farmer of farmers) {
        // Avoid duplicate notifications — check if we sent one in last 6h
        const recentNotif = await Notification.findOne({
          userId: farmer._id,
          type: 'demand_surge',
          'meta.crop': crop,
          createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
        });
        if (recentNotif) continue;

        await Notification.create({
          userId:  farmer._id,
          userUid: farmer.uid,
          type:    'demand_surge',
          title:   `🔥 ${analysis.title}`,
          message: analysis.message,
          meta:    { crop, district, orderCount: count, priceImpact: analysis.priceImpact },
        });
      }

      console.log(`✅ Surge detected: ${crop} in ${district} (${count} orders) → notified ${farmers.length} farmers`);
    }
  } catch (err) {
    console.error('Demand surge cron error:', err.message);
  }
}

/**
 * Start the cron job — runs every hour at :00
 */
function startDemandCron() {
  // Run immediately on startup
  checkDemandSurge();

  // Then every hour
  cron.schedule('0 * * * *', checkDemandSurge);
  console.log('⏰ Demand surge cron started (runs every hour)');
}

module.exports = { startDemandCron, checkDemandSurge };
