// Data Manager - Handles data processing, grouping, and filtering
class DataManager {
	constructor() {
		this.parsedData = [];
		this.groupedData = [];
		this.filteredData = [];
		this.rawLogText = '';
	}

	// Set the parsed data and process it
	setParsedData(data, rawText = '') {
		this.parsedData = data;
		this.rawLogText = rawText;
		this.groupedData = this.groupLogsByContext(data);
		this.filteredData = [...this.groupedData];

		console.log('📊 DataManager: setParsedData called', {
			parsedDataCount: data.length,
			groupedDataCount: this.groupedData.length,
			groupedDataDetails: this.groupedData.map(g => ({ name: g.name, variableCount: g.variables.length })),
			filteredDataCount: this.filteredData.length,
			filteredDataDetails: this.filteredData.map(g => ({ name: g.name, variableCount: g.variables.length }))
		});
	}

	// Get current data
	getParsedData() {
		return this.parsedData;
	}

	getGroupedData() {
		return this.groupedData;
	}

	getFilteredData() {
		return this.filteredData;
	}

	getRawLogText() {
		return this.rawLogText;
	}

	// Apply search and other filters
	applyFilters(searchTerm = '', typeFilters = []) {
		const normalizedSearch = searchTerm.toLowerCase().trim();

		this.filteredData = this.groupedData.map(group => ({
			...group,
			variables: group.variables.filter(variable => {
				// Search filter
				if (normalizedSearch && !this.matchesSearch(variable, group, normalizedSearch)) {
					return false;
				}

				// Type filter
				if (typeFilters.length > 0 && !typeFilters.includes(variable.type)) {
					return false;
				}

				return true;
			})
		})).filter(group => group.variables.length > 0);

		return this.filteredData;
	}

	// Check if variable matches search term
	matchesSearch(variable, group, searchTerm) {
		const searchableFields = [
			variable.name,
			variable.value,
			variable.type,
			group.name
		];

		return searchableFields.some(field =>
			field && field.toLowerCase().includes(searchTerm)
		);
	}

	// Group variables by context (test case, operation, etc.)
	groupLogsByContext(variables) {
		console.log('📊 DataManager: groupLogsByContext called with', variables.length, 'variables');
		const groups = {};

		variables.forEach((variable, index) => {
			// Extract context from the variable
			const context = this.extractContext(variable);
			const contextKey = context.key;

			if (!groups[contextKey]) {
				groups[contextKey] = {
					name: context.name,
					variables: [],
					expanded: true,
					timestamp: variable.timestamp,
					context: context
				};
				console.log(`📊 DataManager: Created new group "${context.name}" for variable ${index}:`, variable.name);
			}

			groups[contextKey].variables.push(variable);

			// Use earliest timestamp for group
			if (!groups[contextKey].timestamp ||
				(variable.timestamp && variable.timestamp < groups[contextKey].timestamp)) {
				groups[contextKey].timestamp = variable.timestamp;
			}
		});

		const result = Object.values(groups);
		console.log('📊 DataManager: groupLogsByContext result:', {
			groupCount: result.length,
			groups: result.map(g => ({ name: g.name, variableCount: g.variables.length }))
		});

		// Handle the case where we only have a root group
		if (result.length === 1 && result[0].name === 'Root' && result[0].variables.length > 0) {
			result[0].name = 'Extracted Variables';
		} else if (result.length > 1) {
			// Filter out empty root groups if we have other contexts
			return result.filter(group => group.name !== 'Root' || group.variables.length > 0);
		}

		return result;
	}

	// Extract context information from variable
	extractContext(variable) {
		// Try to extract context from the original line or surrounding context
		const line = variable.originalLine || '';

		// For now, use a simple approach - group by variable type
		// since context extraction from individual lines is complex
		return {
			key: `extracted_variables`,
			name: 'Extracted Variables',
			type: 'Variables'
		};
	}

	// Get statistics for the current data
	getStatistics() {
		const stats = {
			total: this.parsedData.length,
			filtered: this.filteredData.reduce((sum, group) => sum + group.variables.length, 0),
			types: {},
			groups: this.filteredData.length
		};

		// Count by type
		this.parsedData.forEach(variable => {
			stats.types[variable.type] = (stats.types[variable.type] || 0) + 1;
		});

		// Line range
		if (this.parsedData.length > 0) {
			const lines = this.parsedData.map(v => v.line);
			stats.minLine = Math.min(...lines);
			stats.maxLine = Math.max(...lines);
		}

		return stats;
	}

	// Get variables of a specific type
	getVariablesByType(type) {
		return this.parsedData.filter(variable => variable.type === type);
	}

	// Get variables from a specific group
	getVariablesFromGroup(groupIndex) {
		if (groupIndex >= 0 && groupIndex < this.filteredData.length) {
			return this.filteredData[groupIndex].variables;
		}
		return [];
	}

	// Find variable by name
	findVariableByName(name) {
		return this.parsedData.find(variable => variable.name === name);
	}

	// Export data in various formats
	exportToJSON() {
		return {
			metadata: {
				exportDate: new Date().toISOString(),
				totalVariables: this.parsedData.length,
				groups: this.groupedData.length
			},
			statistics: this.getStatistics(),
			groups: this.filteredData
		};
	}

	exportToCSV() {
		const headers = ['Group', 'Name', 'Value', 'Type', 'Line', 'Timestamp'];
		const rows = [headers];

		this.filteredData.forEach(group => {
			group.variables.forEach(variable => {
				rows.push([
					group.name,
					variable.name,
					variable.value.replace(/"/g, '""'), // Escape quotes
					variable.type,
					variable.line,
					variable.timestamp || ''
				]);
			});
		});

		return rows.map(row =>
			row.map(cell => `"${cell}"`).join(',')
		).join('\n');
	}

	// Clear all data
	clear() {
		this.parsedData = [];
		this.groupedData = [];
		this.filteredData = [];
		this.rawLogText = '';
	}

	// Advanced filtering options
	getUniqueTypes() {
		const types = new Set();
		this.parsedData.forEach(variable => types.add(variable.type));
		return Array.from(types).sort();
	}

	getUniqueGroups() {
		return this.groupedData.map(group => ({
			name: group.name,
			count: group.variables.length
		}));
	}

	// Performance optimization: batch processing for large datasets
	async processLargeDataset(data, progressCallback) {
		const BATCH_SIZE = 100;
		const batches = [];

		for (let i = 0; i < data.length; i += BATCH_SIZE) {
			batches.push(data.slice(i, i + BATCH_SIZE));
		}

		let processedData = [];

		for (let i = 0; i < batches.length; i++) {
			const batch = batches[i];

			// Process batch
			const processedBatch = batch.map(variable => {
				// Add any additional processing here
				return {
					...variable,
					processed: true
				};
			});

			processedData = processedData.concat(processedBatch);

			// Report progress
			if (progressCallback) {
				progressCallback(i + 1, batches.length);
			}

			// Yield control back to the event loop
			await new Promise(resolve => setTimeout(resolve, 0));
		}

		return processedData;
	}

	// Memory management for large datasets
	getMemoryUsage() {
		if (performance.memory) {
			return {
				usedJSHeapSize: performance.memory.usedJSHeapSize,
				totalJSHeapSize: performance.memory.totalJSHeapSize,
				jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
			};
		}
		return null;
	}

	// Create hierarchical grouping for logs and table views
	groupLogsByHierarchy(rawLogText) {
		const lines = rawLogText.split('\n');
		const groups = [];
		let currentGroup = null;
		let contextStack = [];
		let lineNumber = 0;

		lines.forEach(line => {
			lineNumber++;
			if (!line.trim()) return;

			const logInfo = this.parseLogLine(line, lineNumber);
			if (!logInfo) return;

			// Handle test case start
			if (logInfo.isTestCaseStart) {
				// Create new test case group
				currentGroup = {
					id: `testcase_${lineNumber}`,
					type: 'testcase',
					name: logInfo.testCaseName,
					timestamp: logInfo.timestamp,
					lines: [logInfo],
					subGroups: [],
					expanded: false,
					level: 0
				};
				groups.push(currentGroup);
				contextStack = [currentGroup];
			}
			// Handle operations and sub-operations
			else if (logInfo.isOperation) {
				const level = logInfo.indentLevel;
				
				// Find appropriate parent group
				while (contextStack.length > level + 1) {
					contextStack.pop();
				}

				const operationGroup = {
					id: `operation_${lineNumber}`,
					type: 'operation',
					name: logInfo.operationName,
					timestamp: logInfo.timestamp,
					lines: [logInfo],
					subGroups: [],
					expanded: false,
					level: level
				};

				if (contextStack.length > 0) {
					contextStack[contextStack.length - 1].subGroups.push(operationGroup);
				} else if (currentGroup) {
					currentGroup.subGroups.push(operationGroup);
				}
				
				contextStack.push(operationGroup);
			}
			// Handle regular log lines
			else {
				if (contextStack.length > 0) {
					contextStack[contextStack.length - 1].lines.push(logInfo);
				} else if (currentGroup) {
					currentGroup.lines.push(logInfo);
				}
			}
		});

		return groups;
	}

	// Parse individual log line to extract structure information
	parseLogLine(line, lineNumber) {
		// Extract timestamp
		const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/);
		const timestamp = timestampMatch ? timestampMatch[1] : '';

		// Extract log level
		const levelMatch = line.match(/\[(INF|ERR|WAR|DEB)\]/);
		const level = levelMatch ? levelMatch[1] : '';

		// Check for test case start
		const testCaseMatch = line.match(/Starting TestCase\s*['"]([^'"]+)['"]/);
		if (testCaseMatch) {
			return {
				lineNumber,
				timestamp,
				level,
				originalLine: line,
				isTestCaseStart: true,
				testCaseName: testCaseMatch[1],
				indentLevel: 0
			};
		}

		// Check for operations (detect by indentation and patterns)
		const indentMatch = line.match(/^[^[]*\[INF\]\[TBox\](\s+)/);
		let indentLevel = 0;
		if (indentMatch) {
			indentLevel = Math.floor((indentMatch[1].length - 1) / 4); // Approximate indent level
		}

		// Check for operation patterns
		const operationMatch = line.match(/\[([^\]]+)\]\s*"([^"]+)"/);
		if (operationMatch && indentLevel > 0) {
			return {
				lineNumber,
				timestamp,
				level,
				originalLine: line,
				isOperation: true,
				operationName: operationMatch[2],
				operationStatus: operationMatch[1],
				indentLevel
			};
		}

		// Extract the main content after log prefixes
		let content = line.replace(/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[^[]*(?:\[[^\]]*\])*\s*/, '').trim();
		
		// Check for buffer variables
		let variable = '';
		let value = '';
		let jsonBody = '';
		let type = 'message';
		
		const bufferMatch = content.match(/(?:Message:\s*)?Buffer with name[:\s]*['"]([^'"]*)['"]\s*has been set to value[:\s]*['"]([^'"]*)['"]?/i);
		if (bufferMatch) {
			type = 'variable';
			variable = bufferMatch[1];
			value = bufferMatch[2];
			content = `Set Buffer: ${variable}`;
			
			// Check if value is JSON
			if (this.isValidJSON(value)) {
				jsonBody = value;
			}
		}
		// Check for operation with status
		else if (content.match(/^\[(Succeeded|Failed)\]/)) {
			const operationMatch = content.match(/^\[(Succeeded|Failed)\]\s*['"]([^'"]+)['"]/);
			if (operationMatch) {
				type = 'operation';
				content = operationMatch[2];
			}
		}
		// Message content
		else if (content.includes('Message:')) {
			const messageContent = content.replace(/.*Message:\s*/, '');
			content = messageContent;
		}

		// Regular log line
		return {
			lineNumber,
			timestamp,
			level,
			originalLine: line,
			content,
			operation: content,
			variable,
			value,
			jsonBody,
			type,
			indentLevel,
			isTestCaseStart: false,
			isOperation: false
		};
	}

	// Check if string is valid JSON
	isValidJSON(str) {
		if (!str || typeof str !== 'string') return false;
		if (!str.trim().startsWith('{') && !str.trim().startsWith('[')) return false;
		try {
			JSON.parse(str);
			return true;
		} catch (e) {
			return false;
		}
	}

	// Estimate data size
	estimateDataSize() {
		const jsonString = JSON.stringify(this.parsedData);
		return {
			variables: this.parsedData.length,
			estimatedSizeBytes: jsonString.length,
			estimatedSizeKB: Math.round(jsonString.length / 1024),
			estimatedSizeMB: Math.round(jsonString.length / (1024 * 1024))
		};
	}
}

export default DataManager;