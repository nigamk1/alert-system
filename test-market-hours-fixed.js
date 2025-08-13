/**
 * Test Market Hours Functionality
 * Run this script to check if market hours detection is working correctly
 */

const MarketHours = require('./market-hours.js');

console.log('🧪 Testing Market Hours Detection for Indian Market\n');

const marketHours = new MarketHours();

// Test 1: Current time and market status
console.log('='.repeat(60));
console.log('📊 CURRENT MARKET STATUS');
console.log('='.repeat(60));

const currentIST = marketHours.getCurrentISTString();
console.log(`🕐 Current IST Time: ${currentIST}`);

const isTradingDay = marketHours.isTradingDay();
console.log(`📅 Is Trading Day: ${isTradingDay ? '✅ Yes' : '❌ No'}`);

const marketStatus = marketHours.isMarketOpen('EQUITY', true);
console.log(`\n📈 Market Status: ${marketStatus.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}`);
console.log(`📝 Reason: ${marketStatus.reason}`);
console.log(`🎯 Session: ${marketStatus.session || 'None'}`);
if (marketStatus.nextClose) {
    console.log(`⏰ Next Close: ${marketStatus.nextClose} IST`);
}
if (marketStatus.nextOpen) {
    console.log(`⏰ Next Open: ${marketStatus.nextOpen}`);
}

console.log('\n' + '='.repeat(60));
console.log('📊 DETAILED TIME ANALYSIS');
console.log('='.repeat(60));

const currentMinutes = marketHours.getCurrentTimeInMinutes();
const currentTimeStr = marketHours.getTimeString(currentMinutes);

console.log(`⏰ Current time: ${currentTimeStr} (${currentMinutes} minutes since midnight)`);

// Show trading sessions
console.log('\n📊 Trading Sessions (IST):');
console.log('   Pre-market:  09:00 - 09:15 (540 - 555 minutes)');
console.log('   Regular:     09:15 - 15:30 (555 - 930 minutes)');
console.log('   Post-market: 15:40 - 16:00 (940 - 960 minutes)');

// Test specific times
console.log('\n' + '='.repeat(60));
console.log('🧪 TESTING SPECIFIC TIMES');
console.log('='.repeat(60));

const testTimes = [
    { time: '08:00', expected: 'Closed' },
    { time: '09:10', expected: 'Pre-market (if enabled)' },
    { time: '09:20', expected: 'Open (Regular)' },
    { time: '12:00', expected: 'Open (Regular)' },
    { time: '15:25', expected: 'Open (Regular)' },
    { time: '15:35', expected: 'Closed' },
    { time: '15:45', expected: 'Post-market (if enabled)' },
    { time: '16:30', expected: 'Closed' }
];

testTimes.forEach(test => {
    const [hours, minutes] = test.time.split(':').map(Number);
    const testMinutes = hours * 60 + minutes;
    
    // Mock the current time for testing
    const originalMethod = marketHours.getCurrentTimeInMinutes;
    marketHours.getCurrentTimeInMinutes = () => testMinutes;
    
    const status = marketHours.isMarketOpen('EQUITY', true);
    
    console.log(`${test.time}: ${status.isOpen ? '🟢 OPEN' : '🔴 CLOSED'} (${status.reason}) - Expected: ${test.expected}`);
    
    // Restore original method
    marketHours.getCurrentTimeInMinutes = originalMethod;
});

console.log('\n' + '='.repeat(60));
console.log('📱 MARKET STATUS MESSAGE');
console.log('='.repeat(60));

const statusMessage = marketHours.getMarketStatusMessage();
console.log(statusMessage);

console.log('\n✅ Market Hours Test Complete!');
console.log('\nIf market shows as closed during trading hours (9:15 AM - 3:30 PM IST),');
console.log('please check your system timezone and ensure it matches Indian Standard Time.');
