const core = require('@actions/core');

/**
 * Parse CSV string and return array of rows, each row being an array of cells
 * Handles quoted fields that may contain commas and newlines
 */
function parseCSV(csvString) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let insideQuotes = false;
  let i = 0;

  while (i < csvString.length) {
    const char = csvString[i];
    const nextChar = csvString[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote inside quoted field
        currentCell += '"';
        i += 2;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
        i += 1;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of cell
      currentRow.push(currentCell.trim());
      currentCell = '';
      i += 1;
    } else if (char === '\n' && !insideQuotes) {
      // End of row
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
      i += 1;
    } else if (char === '\r' && nextChar === '\n' && !insideQuotes) {
      // Handle CRLF line endings
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
      i += 2; // Skip the \n after \r
    } else if (char === '\r' && !insideQuotes) {
      // Handle CR line endings
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
      i += 1;
    } else {
      currentCell += char;
      i += 1;
    }
  }

  // Handle last cell and row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Convert parsed CSV rows to markdown table format
 */
function convertToMarkdownTable(rows) {
  if (rows.length === 0) {
    return '';
  }

  // Calculate maximum width for each column for proper alignment
  const columnCount = Math.max(...rows.map((row) => row.length));
  const columnWidths = new Array(columnCount).fill(0);

  // Ensure all rows have the same number of columns
  const normalizedRows = rows.map((row) => {
    const normalizedRow = [...row];
    while (normalizedRow.length < columnCount) {
      normalizedRow.push('');
    }
    return normalizedRow;
  });

  // Calculate column widths
  normalizedRows.forEach((row) => {
    row.forEach((cell, index) => {
      columnWidths[index] = Math.max(columnWidths[index], cell.length);
    });
  });

  // Ensure minimum width for separator row
  columnWidths.forEach((width, index) => {
    columnWidths[index] = Math.max(width, 3); // Minimum width for "---"
  });

  // Create markdown table
  const markdownRows = [];

  // Add header row
  const headerRow = `| ${normalizedRows[0].map((cell, index) => cell.padEnd(columnWidths[index])).join(' | ')} |`;
  markdownRows.push(headerRow);

  // Add separator row
  const separatorRow = `| ${columnWidths.map((width) => '-'.repeat(width)).join(' | ')} |`;
  markdownRows.push(separatorRow);

  // Add data rows
  for (let i = 1; i < normalizedRows.length; i += 1) {
    const dataRow = `| ${normalizedRows[i].map((cell, index) => cell.padEnd(columnWidths[index])).join(' | ')} |`;
    markdownRows.push(dataRow);
  }

  return markdownRows.join('\n');
}

/**
 * Convert CSV string to markdown table
 */
function csvToMarkdown(csvString) {
  const rows = parseCSV(csvString);
  return convertToMarkdownTable(rows);
}

/**
 * Optimized CSV to Markdown converter with performance enhancements
 * and better error handling
 */
async function convertCSVToMarkdown() {
  try {
    // Get input with validation
    const csvinput = core.getInput('csvinput');

    // Early validation - check if input is empty or whitespace only
    if (!csvinput || !csvinput.trim()) {
      throw new Error('CSV input is empty or contains only whitespace');
    }

    // Log input size for monitoring
    const inputSize = csvinput.length;
    const lineCount = csvinput.split('\n').length;
    core.info(`Processing CSV: ${inputSize} characters, ${lineCount} lines`);

    // Performance monitoring
    const startTime = process.hrtime.bigint();

    // Convert CSV to markdown using our custom implementation
    const markdownTable = csvToMarkdown(csvinput);

    // Calculate processing time
    const endTime = process.hrtime.bigint();
    const processingTimeMs = Number(endTime - startTime) / 1000000;

    // Validate output
    if (!markdownTable || markdownTable.trim().length === 0) {
      throw new Error('Failed to generate markdown table - output is empty');
    }

    // Log performance metrics
    core.info(`Conversion completed in ${processingTimeMs.toFixed(2)}ms`);
    core.info(`Output size: ${markdownTable.length} characters`);

    // Output the markdown table to stdout (for backward compatibility with tests)
    console.log(`Markdown table Created:\n${markdownTable}`);

    // Set output
    core.setOutput('markdown-table', markdownTable);

    // Optional: Log first few lines for debugging (truncated for large outputs)
    const previewLines = markdownTable.split('\n').slice(0, 5);
    if (markdownTable.split('\n').length > 5) {
      previewLines.push('...');
    }
    core.debug(`Markdown preview:\n${previewLines.join('\n')}`);
  } catch (error) {
    // Enhanced error reporting
    core.error(`CSV to Markdown conversion failed: ${error.message}`);

    // Log additional context for debugging
    if (error.stack) {
      core.debug(`Error stack: ${error.stack}`);
    }

    core.setFailed(error.message);
  }
}

// Run the conversion
convertCSVToMarkdown();
