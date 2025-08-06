// Core Log Parser - Handles log parsing logic only
class LogParser {
	constructor() {
		this.debugMode = false;
		this.debugLogs = [];
	}

	log(message, data = null) {
		const timestamp = new Date().toISOString();
		const logEntry = `[${timestamp}] ${message}`;
		this.debugLogs.push(logEntry);
		if (data) {
			this.debugLogs.push(JSON.stringify(data, null, 2));
		}
		// Only log to console when debug mode is enabled
		if (this.debugMode) {
			console.log(logEntry, data);
		}
	}

	// Simplified JSON detection
	isValidJSON(str) {
		if (!str || typeof str !== 'string') return false;
		str = str.trim();
		if (!str.startsWith('{') && !str.startsWith('[')) return false;

		try {
			JSON.parse(str);
			return true;
		} catch (e) {
			return false;
		}
	}

	// Enhanced variable type detection
	detectVariableType(name, value) {
		// JSON detection first - most important
		if (this.isValidJSON(value)) {
			try {
				const parsed = JSON.parse(value);
				if (typeof parsed === 'object' && parsed !== null &&
					(Array.isArray(parsed) || Object.keys(parsed).length > 0)) {
					return 'JSON';
				}
			} catch (e) {
				// Not valid JSON
			}
		}

		// Token detection
		if (name.toLowerCase().includes('token') || name.toLowerCase().includes('access')) {
			return 'Token';
		}

		// URL detection (but not if it's part of JSON)
		if ((value.includes('http://') || value.includes('https://')) &&
			!value.includes('{') && !value.includes('"')) {
			return 'URL';
		}

		// ID patterns
		if (name.toLowerCase().includes('id') && (
			value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ||
			value.match(/^[A-Za-z0-9_-]{20,}$/)
		)) {
			return 'ID';
		}

		// Timestamps
		if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
			return 'Timestamp';
		}

		return 'Buffer Variable';
	}

	// Simplified multi-line JSON extraction using state machine
	extractMultilineJSON(lines, startIndex, variableName) {
		this.log(`Starting multi-line JSON extraction for ${variableName} at line ${startIndex}`);

		let jsonContent = '';
		let braceCount = 0;
		let insideQuotes = false;
		let escapeNext = false;
		let currentIndex = startIndex;

		// Find the start of JSON content
		let startLine = lines[startIndex];
		let jsonStartPos = startLine.indexOf('{');
		if (jsonStartPos === -1) {
			jsonStartPos = startLine.indexOf('[');
		}

		if (jsonStartPos === -1) {
			this.log(`No JSON start found for ${variableName}`);
			return null;
		}

		// Extract JSON starting from the opening brace/bracket
		let jsonStart = startLine.substring(jsonStartPos);

		// Clean log prefixes from the start
		jsonStart = this.cleanLogPrefix(jsonStart);

		for (let char of jsonStart) {
			if (escapeNext) {
				jsonContent += char;
				escapeNext = false;
				continue;
			}

			if (char === '\\' && insideQuotes) {
				escapeNext = true;
				jsonContent += char;
				continue;
			}

			if (char === '"') {
				insideQuotes = !insideQuotes;
			}

			if (!insideQuotes) {
				if (char === '{' || char === '[') {
					braceCount++;
				} else if (char === '}' || char === ']') {
					braceCount--;
				}
			}

			jsonContent += char;

			if (braceCount === 0 && jsonContent.length > 0) {
				// JSON is complete
				this.log(`Completed single-line JSON for ${variableName}`);
				return jsonContent;
			}
		}

		// Multi-line JSON - continue to next lines
		currentIndex++;
		while (currentIndex < lines.length && braceCount > 0) {
			let nextLine = lines[currentIndex];
			let cleanedLine = this.cleanLogPrefix(nextLine.trim());

			this.log(`Processing continuation line ${currentIndex}: "${cleanedLine}"`);

			for (let char of cleanedLine) {
				if (escapeNext) {
					jsonContent += char;
					escapeNext = false;
					continue;
				}

				if (char === '\\' && insideQuotes) {
					escapeNext = true;
					jsonContent += char;
					continue;
				}

				if (char === '"') {
					insideQuotes = !insideQuotes;
				}

				if (!insideQuotes) {
					if (char === '{' || char === '[') {
						braceCount++;
					} else if (char === '}' || char === ']') {
						braceCount--;
					}
				}

				jsonContent += char;

				if (braceCount === 0) {
					this.log(`Completed multi-line JSON for ${variableName}`);
					return jsonContent;
				}
			}

			if (braceCount > 0) {
				jsonContent += '\n';
			}
			currentIndex++;
		}

		this.log(`JSON parsing incomplete for ${variableName}, braceCount: ${braceCount}`);
		return jsonContent; // Return what we have, even if incomplete
	}

	// Clean log prefixes from lines
	cleanLogPrefix(line) {
		// Remove timestamp, log level, and optionally "Message: " prefix
		let cleaned = line.replace(/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[^[]*\[TBox\]\s*/, '');
		// Also remove "Message: " prefix if present
		cleaned = cleaned.replace(/^Message:\s*/, '');
		return cleaned;
	}

	// Main parsing method with improved error handling
	parseLogContent(logText) {
		try {
			const lines = logText.split('\n');
			const variables = [];
			let lineNumber = 0;

			lines.forEach((line, index) => {
				lineNumber = index + 1;
				if (!line.trim()) return;

				const trimmedLine = line.trim();

				// Extract buffer variables with improved multi-line handling
				// Account for "Message: " prefix and different quote/colon patterns
				const bufferMatch = trimmedLine.match(/(?:Message:\s*)?Buffer with name[:\s]*['"]([^'"]*)['"]\s*has been set to value[:\s]*['"]?/i);
				if (bufferMatch) {
					const variableName = bufferMatch[1];
					let variableValue = '';

					// Check if value is on same line
					const sameLineMatch = trimmedLine.match(/(?:Message:\s*)?Buffer with name[:\s]*['"]([^'"]*)['"]\s*has been set to value[:\s]*['"]([^'"]*)['"]/i);
					if (sameLineMatch) {
						variableValue = sameLineMatch[2];
					} else {
						// Multi-line value - use simplified extraction
						const extractedJSON = this.extractMultilineJSON(lines, index, variableName);
						// Debug: Log JSON_Body extraction
						if (variableName === 'JSON_Body') {
							console.log('🔍 JSON_Body extraction:', {
								variableName,
								extractedJSON: extractedJSON?.substring(0, 100) + '...',
								extracted: !!extractedJSON
							});
						}
						if (extractedJSON) {
							variableValue = extractedJSON;
						} else {
							// Fallback to simple extraction
							let workingLine = trimmedLine;
							// Remove "Message: " prefix if present for processing
							workingLine = workingLine.replace(/^Message:\s*/, '');
							const afterValue = workingLine.substring(workingLine.indexOf('has been set to value') + 'has been set to value'.length);
							const match = afterValue.match(/['"]([^'"]*)/);
							variableValue = match ? match[1] : '';
						}
					}

					if (variableValue) {
						const variable = {
							name: variableName,
							value: variableValue,
							type: this.detectVariableType(variableName, variableValue),
							line: lineNumber,
							timestamp: this.extractTimestamp(line),
							originalLine: trimmedLine
						};

						// Debug: Log JSON_Body variable creation
						if (variableName === 'JSON_Body') {
							console.log('🔍 JSON_Body variable created:', {
								name: variableName,
								value: variableValue?.substring(0, 100) + '...',
								type: variable.type,
								line: lineNumber,
								valueLength: variableValue?.length
							});
						}

						variables.push(variable);
						this.log(`Parsed ${variable.type}: ${variable.name}`);
					}
				}
			});

			this.log(`Parsing completed. Found ${variables.length} variables`);
			return variables;

		} catch (error) {
			this.log('Parsing error', error);
			throw new Error(`Log parsing failed: ${error.message}`);
		}
	}

	// Extract timestamp from log line
	extractTimestamp(line) {
		const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/);
		return timestampMatch ? timestampMatch[1] : null;
	}

	// Filter logs to relevant sections
	filterRelevantLogs(logText) {
		const lines = logText.split('\n');
		let startIndex = -1;

		for (let i = 0; i < lines.length; i++) {
			if (lines[i].includes('Starting TestCase')) {
				startIndex = i;
				break;
			}
		}

		return startIndex !== -1 ? lines.slice(startIndex).join('\n') : logText;
	}
}

export default LogParser;