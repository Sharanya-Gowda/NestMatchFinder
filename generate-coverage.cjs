// Script to generate coverage reports
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 Generating test coverage reports...\n');

try {
  // Run Jest with coverage
  execSync('npx jest --coverage --verbose', { stdio: 'inherit' });
  
  console.log('\n✅ Coverage reports generated successfully!');
  console.log('\n📁 Report locations:');
  console.log('   • HTML Report: coverage/lcov-report/index.html');
  console.log('   • Text Report: coverage/coverage.txt');
  console.log('   • JSON Report: coverage/coverage-final.json');
  
  // Check if HTML report exists
  const htmlReportPath = path.join(process.cwd(), 'coverage', 'lcov-report', 'index.html');
  if (fs.existsSync(htmlReportPath)) {
    console.log('\n🌐 Open the HTML report in your browser to view detailed coverage:');
    console.log(`   file://${htmlReportPath}`);
  }
  
  
  
} catch (error) {
  console.error('❌ Error generating coverage:', error.message);
  process.exit(1);
}