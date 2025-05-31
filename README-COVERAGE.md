# Code Coverage Report Guide

## How to Generate Coverage Reports

### Option 1: Quick Coverage Report
```bash
node generate-coverage.js
```

### Option 2: Manual Coverage Generation
```bash
npx jest --coverage --verbose
```

### Option 3: Coverage with Detailed Output
```bash
npx jest --coverage --verbose --collectCoverageFrom="server/**/*.ts" --collectCoverageFrom="client/src/**/*.ts"
```

## Report Formats Generated

### 1. HTML Report (Best for Presentation)
- **Location**: `coverage/lcov-report/index.html`
- **How to view**: Open in any web browser
- **Features**: Interactive, shows line-by-line coverage, visual indicators

### 2. Terminal Summary
- **Location**: Displayed in console during test run
- **Features**: Quick overview, percentage coverage by category

### 3. LCOV Report (for CI/CD)
- **Location**: `coverage/lcov.info`
- **Use**: Upload to coverage services like Codecov

### 4. JSON Report (for Analysis)
- **Location**: `coverage/coverage-final.json`
- **Use**: Programmatic analysis of coverage data

## Sharing with Teacher

### Method 1: HTML Report (Recommended)
1. Run coverage generation
2. Navigate to `coverage/lcov-report/`
3. Zip the entire folder
4. Share the zip file
5. Teacher can open `index.html` in browser

### Method 2: Screenshots
1. Open `coverage/lcov-report/index.html`
2. Take screenshots of:
   - Overall coverage summary
   - Individual file coverage
   - Line-by-line coverage examples

### Method 3: Coverage Summary Export
1. Run tests with coverage
2. Copy the terminal output
3. Save to a text file
4. Include timestamp and project details

## Understanding Coverage Metrics

- **Statements**: Lines of code executed
- **Branches**: Conditional paths tested (if/else, switch)
- **Functions**: Functions/methods called
- **Lines**: Physical lines of code covered

## Current Project Coverage

Run the coverage generator to see current metrics for:
- Server-side code (API routes, storage, utilities)
- Client-side code (components, utilities)
- Shared schemas and types

## Improving Coverage

To increase coverage:
1. Add more test cases for edge conditions
2. Test error scenarios
3. Cover all conditional branches
4. Test user interaction scenarios
5. Add integration tests