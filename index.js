const core = require('@actions/core');
const csvtomd = require('csvtomd-lib');

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

    // Convert CSV to markdown
    const markdownTable = csvtomd.fromString(csvinput);

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
