const process = require('process');
const cp = require('child_process');
const path = require('path');

describe('GitHub Action Integration Tests', () => {
  const actionPath = path.join(__dirname, 'index.js');
  let originalEnv;

  beforeAll(() => {
    // Store original environment
    originalEnv = { ...process.env };
  });

  beforeEach(() => {
    // Clean up environment before each test
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('INPUT_')) {
        delete process.env[key];
      }
    });
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Action Parameter Tests', () => {
    test('should read csvinput parameter from environment', () => {
      process.env.INPUT_CSVINPUT = 'Name,Age\nJohn,25';
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Name');
      expect(result).toContain('Age');
      expect(result).toContain('John');
      expect(result).toContain('25');
    });

    test('should handle case-insensitive parameter names', () => {
      // GitHub Actions converts parameter names to uppercase with INPUT_ prefix
      process.env.INPUT_CSVINPUT = 'Product,Price\nLaptop,999';
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Product');
      expect(result).toContain('Price');
      expect(result).toContain('Laptop');
      expect(result).toContain('999');
    });

    test('should fail gracefully when required parameter is missing', () => {
      // No INPUT_CSVINPUT set
      expect(() => {
        cp.execSync(`node ${actionPath}`, { env: process.env, stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle multiline CSV input from environment', () => {
      const multilineCSV = `Name,Department,Role
John Smith,Engineering,Developer
Jane Doe,Marketing,Manager
Bob Johnson,Sales,Representative`;

      process.env.INPUT_CSVINPUT = multilineCSV;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Name');
      expect(result).toContain('Department');
      expect(result).toContain('Role');
      expect(result).toContain('John Smith');
      expect(result).toContain('Engineering');
      expect(result).toContain('Developer');
      expect(result).toContain('Jane Doe');
      expect(result).toContain('Marketing');
      expect(result).toContain('Manager');
      expect(result).toContain('Bob Johnson');
      expect(result).toContain('Sales');
      expect(result).toContain('Representative');
    });
  });

  describe('Action Output Tests', () => {
    test('should set markdown-table output', () => {
      process.env.INPUT_CSVINPUT = 'Item,Quantity\nApples,5\nBananas,3';

      // Capture both stdout and any output-related information
      const result = cp.execSync(`node ${actionPath}`, {
        env: process.env,
        encoding: 'utf8',
      });

      // Check that the action produces the expected output format
      expect(result).toContain('Markdown table Created:');
      expect(result).toContain('Item');
      expect(result).toContain('Quantity');
      expect(result).toContain('Apples');
      expect(result).toContain('5');
      expect(result).toContain('Bananas');
      expect(result).toContain('3');
    });

    test('should handle output with special characters', () => {
      process.env.INPUT_CSVINPUT = 'Symbol,Description\n&,Ampersand\n<,Less than\n>,Greater than';

      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Symbol');
      expect(result).toContain('Description');
      expect(result).toContain('&');
      expect(result).toContain('Ampersand');
      expect(result).toContain('<');
      expect(result).toContain('Less than');
      expect(result).toContain('>');
      expect(result).toContain('Greater than');
    });
  });

  describe('Real-world CSV Scenarios', () => {
    test('should handle e-commerce product catalog', () => {
      const ecommerceCSV = `Product ID,Name,Category,Price,In Stock,Description
SKU001,"Wireless Headphones, Bluetooth",Electronics,89.99,true,"Premium wireless headphones with noise cancellation"
SKU002,"Coffee Maker, ""Deluxe""",Kitchen,149.99,false,"Programmable coffee maker with timer"
SKU003,"Desk Chair, Ergonomic",Furniture,299.99,true,"Ergonomic office chair with lumbar support"`;

      process.env.INPUT_CSVINPUT = ecommerceCSV;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Product ID');
      expect(result).toContain('Name');
      expect(result).toContain('Category');
      expect(result).toContain('Price');
      expect(result).toContain('In Stock');
      expect(result).toContain('Description');
      expect(result).toContain('SKU001');
      expect(result).toContain('Wireless Headphones, Bluetooth');
      expect(result).toContain('Electronics');
      expect(result).toContain('89.99');
      expect(result).toContain('true');
      expect(result).toContain('SKU002');
      expect(result).toContain('Coffee Maker, "Deluxe"');
      expect(result).toContain('Kitchen');
      expect(result).toContain('149.99');
      expect(result).toContain('false');
      expect(result).toContain('SKU003');
      expect(result).toContain('Desk Chair, Ergonomic');
      expect(result).toContain('Furniture');
      expect(result).toContain('299.99');
    });

    test('should handle employee roster with various data types', () => {
      const employeeCSV = `ID,Name,Email,Department,Salary,Start Date,Active
1001,John Doe,john.doe@company.com,Engineering,75000,2023-01-15,true
1002,"Smith, Jane",jane.smith@company.com,Marketing,65000,2023-02-01,true
1003,Bob Johnson,bob.johnson@company.com,Sales,,2023-03-01,false`;

      process.env.INPUT_CSVINPUT = employeeCSV;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('ID');
      expect(result).toContain('Name');
      expect(result).toContain('Email');
      expect(result).toContain('Department');
      expect(result).toContain('Salary');
      expect(result).toContain('Start Date');
      expect(result).toContain('Active');
      expect(result).toContain('1001');
      expect(result).toContain('John Doe');
      expect(result).toContain('john.doe@company.com');
      expect(result).toContain('Engineering');
      expect(result).toContain('75000');
      expect(result).toContain('2023-01-15');
      expect(result).toContain('1002');
      expect(result).toContain('Smith, Jane');
      expect(result).toContain('jane.smith@company.com');
      expect(result).toContain('Marketing');
      expect(result).toContain('65000');
      expect(result).toContain('2023-02-01');
      expect(result).toContain('1003');
      expect(result).toContain('Bob Johnson');
      expect(result).toContain('bob.johnson@company.com');
      expect(result).toContain('Sales');
      expect(result).toContain('2023-03-01');
      expect(result).toContain('false');
    });

    test('should handle survey results with text responses', () => {
      const surveyCSV = `Response ID,Question 1,Question 2,Comments
R001,Very Satisfied,5,"Great service, will recommend!"
R002,Satisfied,4,"Good overall experience"
R003,Neutral,3,"Could be better, but not bad"
R004,Dissatisfied,2,"Had some issues with the product"`;

      process.env.INPUT_CSVINPUT = surveyCSV;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Response ID');
      expect(result).toContain('Question 1');
      expect(result).toContain('Question 2');
      expect(result).toContain('Comments');
      expect(result).toContain('R001');
      expect(result).toContain('Very Satisfied');
      expect(result).toContain('5');
      expect(result).toContain('Great service, will recommend!');
      expect(result).toContain('R002');
      expect(result).toContain('Satisfied');
      expect(result).toContain('4');
      expect(result).toContain('Good overall experience');
      expect(result).toContain('R003');
      expect(result).toContain('Neutral');
      expect(result).toContain('3');
      expect(result).toContain('Could be better, but not bad');
      expect(result).toContain('R004');
      expect(result).toContain('Dissatisfied');
      expect(result).toContain('2');
      expect(result).toContain('Had some issues with the product');
    });
  });

  describe('GitHub Actions Environment Tests', () => {
    test('should work in GitHub Actions environment simulation', () => {
      // Simulate GitHub Actions environment variables
      const githubEnv = {
        ...process.env,
        GITHUB_ACTIONS: 'true',
        GITHUB_WORKFLOW: 'Test',
        GITHUB_REPOSITORY: 'test/repo',
        GITHUB_SHA: 'abc123',
        INPUT_CSVINPUT: 'Test,Result\nGitHub Actions,Working',
      };

      const result = cp.execSync(`node ${actionPath}`, { env: githubEnv }).toString();

      expect(result).toContain('Test');
      expect(result).toContain('Result');
      expect(result).toContain('GitHub Actions');
      expect(result).toContain('Working');
    });

    test('should handle workflow dispatch input', () => {
      // Simulate workflow_dispatch input
      const workflowDispatchCSV = `Branch,Status,Last Commit
main,✅ Passing,feat: add new feature
develop,⚠️ Warning,fix: minor bug fix
feature/new-ui,🔄 In Progress,wip: updating styles`;

      process.env.INPUT_CSVINPUT = workflowDispatchCSV;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Branch');
      expect(result).toContain('Status');
      expect(result).toContain('Last Commit');
      expect(result).toContain('main');
      expect(result).toContain('✅ Passing');
      expect(result).toContain('feat: add new feature');
      expect(result).toContain('develop');
      expect(result).toContain('⚠️ Warning');
      expect(result).toContain('fix: minor bug fix');
      expect(result).toContain('feature/new-ui');
      expect(result).toContain('🔄 In Progress');
      expect(result).toContain('wip: updating styles');
    });
  });

  describe('Error Handling Integration Tests', () => {
    test('should provide meaningful error for malformed CSV', () => {
      process.env.INPUT_CSVINPUT = 'Name,Age\nJohn,25,Extra'; // Inconsistent columns

      // Should still work but handle gracefully
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      // Should create a table with empty cells for missing data
      expect(result).toContain('Name');
      expect(result).toContain('Age');
      expect(result).toContain('John');
      expect(result).toContain('25');
      expect(result).toContain('Extra');
    });

    test('should handle very large field values', () => {
      const largeValue = 'A'.repeat(1000); // 1000 character string
      process.env.INPUT_CSVINPUT = `Name,Description\nTest,"${largeValue}"`;

      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Name');
      expect(result).toContain('Description');
      expect(result).toContain('Test');
      expect(result).toContain(largeValue);
    });

    test('should handle CSV with only header row', () => {
      process.env.INPUT_CSVINPUT = 'Name,Age,City';

      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Name');
      expect(result).toContain('Age');
      expect(result).toContain('City');
      expect(result).toContain('| ----');
      expect(result).toContain('| ---');
    });
  });

  describe('Performance Integration Tests', () => {
    test('should handle moderately large CSV files efficiently', () => {
      // Generate a 500-row CSV
      const rows = ['ID,Name,Email,Department,Salary'];
      for (let i = 1; i <= 500; i += 1) {
        rows.push(`${i},Person${i},person${i}@company.com,Dept${i % 10},${50000 + i * 50}`);
      }

      process.env.INPUT_CSVINPUT = rows.join('\n');

      const startTime = Date.now();
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();
      const endTime = Date.now();

      expect(result).toContain('ID');
      expect(result).toContain('Name');
      expect(result).toContain('Email');
      expect(result).toContain('Department');
      expect(result).toContain('Salary');
      expect(result).toContain('Person1');
      expect(result).toContain('person1@company.com');
      expect(result).toContain('Person500');
      expect(result).toContain('person500@company.com');

      // Should complete within 3 seconds
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });
});
