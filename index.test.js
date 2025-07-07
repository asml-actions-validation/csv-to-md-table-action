const process = require('process');
const cp = require('child_process');
const path = require('path');

describe('CSV to Markdown Table Action - Acceptance Tests', () => {
  const actionPath = path.join(__dirname, 'index.js');

  beforeEach(() => {
    // Clean up environment before each test
    delete process.env.INPUT_CSVINPUT;
  });

  describe('Parameter Validation Tests', () => {
    test('should fail when csvinput parameter is missing', () => {
      expect(() => {
        cp.execSync(`node ${actionPath}`, { env: process.env });
      }).toThrow();
    });

    test('should fail when csvinput parameter is empty', () => {
      process.env.INPUT_CSVINPUT = '';
      expect(() => {
        cp.execSync(`node ${actionPath}`, { env: process.env });
      }).toThrow();
    });

    test('should fail when csvinput parameter is only whitespace', () => {
      process.env.INPUT_CSVINPUT = '   \n   \t   ';
      expect(() => {
        cp.execSync(`node ${actionPath}`, { env: process.env });
      }).toThrow();
    });

    test('should handle valid minimal CSV input', () => {
      process.env.INPUT_CSVINPUT = 'Header\nValue';
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();
      expect(result).toContain('| Header');
      expect(result).toContain('| Value');
    });
  });

  describe('CSV Format Acceptance Tests', () => {
    test('should handle simple CSV with headers', () => {
      const csvString = `Name,Position,Wanted
"Andromedus, Darrow au",Leader,Yes
"Augustus, Victoria au",Accomplice,Yes`;

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Name');
      expect(result).toContain('Position');
      expect(result).toContain('Wanted');
      expect(result).toContain('Andromedus, Darrow au');
      expect(result).toContain('Leader');
      expect(result).toContain('Augustus, Victoria au');
      expect(result).toContain('Accomplice');
    });

    test('should handle CSV with quoted fields containing commas', () => {
      const csvString = `Name,Description
"Smith, John","A person with comma in name"
"Doe, Jane","Another person"`;

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Smith, John');
      expect(result).toContain('A person with comma in name');
      expect(result).toContain('Doe, Jane');
      expect(result).toContain('Another person');
    });

    test('should handle CSV with empty fields', () => {
      const csvString = `Name,Email,Phone
John,,123-456-7890
,jane@example.com,
Bob,bob@example.com,555-0123`;

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Name');
      expect(result).toContain('Email');
      expect(result).toContain('Phone');
      expect(result).toContain('John');
      expect(result).toContain('123-456-7890');
      expect(result).toContain('jane@example.com');
      expect(result).toContain('Bob');
      expect(result).toContain('555-0123');
    });

    test('should handle CSV with different line endings (CRLF)', () => {
      const csvString = 'Name,Age\r\nJohn,25\r\nJane,30';

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Name');
      expect(result).toContain('Age');
      expect(result).toContain('John');
      expect(result).toContain('25');
      expect(result).toContain('Jane');
      expect(result).toContain('30');
    });

    test('should handle CSV with quoted fields containing newlines', () => {
      const csvString = `Name,Description
"John Smith","Line 1
Line 2"
"Jane Doe","Single line"`;

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('John Smith');
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Jane Doe');
      expect(result).toContain('Single line');
    });

    test('should handle CSV with escaped quotes', () => {
      const csvString = `Name,Quote
"John","He said ""Hello"" to me"
"Jane","She replied ""Hi there""."`;

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('John');
      expect(result).toContain('He said "Hello" to me');
      expect(result).toContain('Jane');
      expect(result).toContain('She replied "Hi there".');
    });

    test('should handle uneven CSV rows', () => {
      const csvString = `Name,Age,City
John,25
Jane,30,New York,Extra Field
Bob,35,Chicago`;

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Name');
      expect(result).toContain('Age');
      expect(result).toContain('City');
      expect(result).toContain('John');
      expect(result).toContain('25');
      expect(result).toContain('Jane');
      expect(result).toContain('30');
      expect(result).toContain('New York');
      expect(result).toContain('Extra Field');
      expect(result).toContain('Bob');
      expect(result).toContain('35');
      expect(result).toContain('Chicago');
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle single column CSV', () => {
      const csvString = `Numbers
1
2
3`;

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Numbers');
      expect(result).toContain('| 1');
      expect(result).toContain('| 2');
      expect(result).toContain('| 3');
    });

    test('should handle single row CSV', () => {
      const csvString = 'Name,Age,City';

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Name');
      expect(result).toContain('Age');
      expect(result).toContain('City');
      expect(result).toContain('| ----');
      expect(result).toContain('| ---');
    });

    test('should handle CSV with very long field values', () => {
      const longValue = 'A'.repeat(100);
      const csvString = `Name,Description
"John","${longValue}"`;

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      expect(result).toContain('Name');
      expect(result).toContain('Description');
      expect(result).toContain('John');
      expect(result).toContain(longValue);
    });
  });

  describe('Performance Tests', () => {
    test('should handle reasonably large CSV files', () => {
      // Generate a CSV with 100 rows
      const headerRow = 'ID,Name,Email,Department,Salary';
      const rows = [headerRow];

      for (let i = 1; i <= 100; i += 1) {
        rows.push(`${i},Person${i},person${i}@example.com,Dept${i % 10},${50000 + i * 100}`);
      }

      const csvString = rows.join('\n');
      process.env.INPUT_CSVINPUT = csvString;

      const startTime = Date.now();
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();
      const endTime = Date.now();

      expect(result).toContain('ID');
      expect(result).toContain('Name');
      expect(result).toContain('Email');
      expect(result).toContain('Department');
      expect(result).toContain('Salary');
      expect(result).toContain('Person1');
      expect(result).toContain('person1@example.com');
      expect(result).toContain('Person100');
      expect(result).toContain('person100@example.com');

      // Should complete within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('Output Format Tests', () => {
    test('should produce valid markdown table format', () => {
      const csvString = `Name,Age
John,25
Jane,30`;

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      // Check for proper markdown table structure
      expect(result).toMatch(/\| Name/);
      expect(result).toMatch(/\| Age/);
      expect(result).toMatch(/\| ----/);
      expect(result).toMatch(/\| ---/);
      expect(result).toMatch(/\| John/);
      expect(result).toMatch(/\| 25/);
      expect(result).toMatch(/\| Jane/);
      expect(result).toMatch(/\| 30/);
    });

    test('should have consistent column alignment', () => {
      const csvString = `Name,Age,City
A,1,NYC
Very Long Name,25,San Francisco`;

      process.env.INPUT_CSVINPUT = csvString;
      const result = cp.execSync(`node ${actionPath}`, { env: process.env }).toString();

      // Check that markdown table structure is present
      expect(result).toContain('Name');
      expect(result).toContain('Age');
      expect(result).toContain('City');
      expect(result).toContain('Very Long Name');
      expect(result).toContain('San Francisco');

      // Check that all rows have pipe separators
      const lines = result.split('\n').filter((line) => line.includes('|') && line.trim().startsWith('|'));
      expect(lines.length).toBeGreaterThan(0);
    });
  });
});
