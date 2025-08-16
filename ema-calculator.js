/**
 * Backward compatibility wrapper for ema-calculator.js
 * Redirects to the new EMACalculator service
 */

const EMACalculator = require('./src/services/ema-calculator');

// Export the new service class with the old name for compatibility
module.exports = EMACalculator;
