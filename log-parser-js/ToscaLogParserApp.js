// Main Tosca Log Parser Application
import LogParser from './core/LogParser.js';
import UIManager from './ui/UIManager.js';
import DataManager from './data/DataManager.js';

class ToscaLogParserApp {
	constructor() {
		this.logParser = new LogParser();
		this.dataManager = new DataManager();
		this.uiManager = new UIManager(this.dataManager);
		this.debugMode = false;

		this.setupEventHandlers();
		this.setupMessageListener();
		this.log('Application initialized');
	}

	setupEventHandlers() {
		// Connect UI callbacks to app methods
		this.uiManager.onCopyAll = () => this.copyAllResults();
		this.uiManager.onExport = () => this.exportResults();
		this.uiManager.onClear = () => this.clearResults();
		this.uiManager.onSearchChange = () => this.handleSearchChange();

		// Parse button
		document.getElementById('parseBtn')?.addEventListener('click', () => this.parseContent());

		// File input
		document.getElementById('fileInput')?.addEventListener('change', (e) => this.handleFileInput(e));

		// Debug toggle
		document.getElementById('debugBtn')?.addEventListener('click', () => this.toggleDebug());
		
		// Debug examples dropdown
		document.getElementById('debugExamplesSelect')?.addEventListener('change', (e) => this.loadDebugExample(e.target.value));

		// View switching buttons
		document.getElementById('variablesViewBtn')?.addEventListener('click', () => {
			this.uiManager.showVariablesView();
			this.refreshCurrentView();
		});
		
		// Variables view toggle buttons
		document.getElementById('organizedViewBtn')?.addEventListener('click', () => {
			this.uiManager.switchVariablesViewMode('organized');
		});
		document.getElementById('originalViewBtn')?.addEventListener('click', () => {
			this.uiManager.switchVariablesViewMode('original');
		});
		document.getElementById('logsViewBtn')?.addEventListener('click', () => {
			this.uiManager.showLogsView(this.dataManager.getRawLogText());
		});
		document.getElementById('tableViewBtn')?.addEventListener('click', () => {
			const rawLogText = this.dataManager.getRawLogText();
			const hierarchicalGroups = this.dataManager.groupLogsByHierarchy(rawLogText);
			this.uiManager.showTableView(rawLogText, hierarchicalGroups);
		});
		document.getElementById('wordWrapBtn')?.addEventListener('click', () => {
			this.uiManager.toggleWordWrap();
		});

		// Search filter
		document.getElementById('searchFilter')?.addEventListener('input', () => this.handleSearchChange());
	}

	setupMessageListener() {
		// Listen for messages from bookmarklet
		window.addEventListener('message', (event) => {
			if (event.data && event.data.type === 'PASTE_LOGS') {
				this.handleBookmarkletLogs(event.data.logs);
			}
		});
	}

	handleBookmarkletLogs(logs) {
		this.log('Received logs from bookmarklet', { length: logs.length });

		// Paste logs into textarea
		const logInput = document.getElementById('logInput');
		if (logInput) {
			logInput.value = logs;

			// Show toast notification
			this.uiManager.showToast('Logs pasted automatically from bookmarklet!');

			// Auto-parse after a short delay
			setTimeout(() => {
				this.parseContent();
			}, 500);
		}
	}

	log(message, data = null) {
		this.logParser.log(message, data);
	}

	// Main parsing method with improved error handling and performance
	async parseContent() {
		try {
			const logText = document.getElementById('logInput')?.value.trim();
			if (!logText) {
				this.uiManager.showError('Please provide some log content to parse.');
				return;
			}

			// Show loading state
			this.uiManager.showLoading('Parsing logs...');

			// Estimate data size for performance optimization
			const estimatedSize = logText.length;
			const isLargeDataset = estimatedSize > 1024 * 1024; // 1MB threshold

			this.log('Starting parse', {
				textLength: estimatedSize,
				isLargeDataset
			});

			// For very large datasets, show progress and use async processing
			if (isLargeDataset) {
				await this.parseLargeDataset(logText);
			} else {
				await this.parseRegularDataset(logText);
			}

		} catch (error) {
			this.log('Parse error', error);
			this.uiManager.showError(`Parsing failed: ${error.message}`, error);
		} finally {
			this.uiManager.hideLoading();
		}
	}

	async parseRegularDataset(logText) {
		// Filter relevant logs first
		const filteredLogText = this.logParser.filterRelevantLogs(logText);
		this.log('Filtered logs', {
			originalLines: logText.split('\n').length,
			filteredLines: filteredLogText.split('\n').length
		});

		// Parse the content
		const parsedData = this.logParser.parseLogContent(filteredLogText);
		this.log('Parsed variables', { count: parsedData.length });

		// Store data and update UI
		this.dataManager.setParsedData(parsedData, logText);

		// Debug: Log what we found (only when debug mode is enabled)
		if (this.debugMode) {
			console.log('🔍 Parse Results:', {
				totalVariables: parsedData.length,
				variables: parsedData.map(v => ({ name: v.name, type: v.type, value: v.value.substring(0, 50) + '...' })),
				groupedData: this.dataManager.getGroupedData().length,
				filteredData: this.dataManager.getFilteredData().length
			});
		}

		this.updateUI();
	}

	async parseLargeDataset(logText) {
		this.uiManager.showProgress(0, 100, 'Processing large dataset');

		// Split into chunks for processing
		const lines = logText.split('\n');
		const CHUNK_SIZE = 1000;
		const chunks = [];

		for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
			chunks.push(lines.slice(i, i + CHUNK_SIZE).join('\n'));
		}

		let allParsedData = [];

		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			const filteredChunk = this.logParser.filterRelevantLogs(chunk);

			if (filteredChunk.trim()) {
				const chunkData = this.logParser.parseLogContent(filteredChunk);
				allParsedData = allParsedData.concat(chunkData);
			}

			// Update progress
			const progress = Math.round(((i + 1) / chunks.length) * 100);
			this.uiManager.showProgress(progress, 100, `Processing chunk ${i + 1}/${chunks.length}`);

			// Yield control back to UI thread
			await new Promise(resolve => setTimeout(resolve, 0));
		}

		this.log('Large dataset parsed', {
			chunks: chunks.length,
			totalVariables: allParsedData.length
		});

		// Store data and update UI
		this.dataManager.setParsedData(allParsedData, logText);
		this.updateUI();
	}

	updateUI() {
		const stats = this.dataManager.getStatistics();
		this.log('Updating UI', stats);

		// Update header with statistics
		this.uiManager.updateHeader(this.dataManager.getParsedData());

		// Display results based on current view
		this.refreshCurrentView();

		// Show memory usage for large datasets
		if (stats.total > 1000) {
			const memoryInfo = this.dataManager.getMemoryUsage();
			if (memoryInfo) {
				this.log('Memory usage', memoryInfo);
			}
		}
	}

	refreshCurrentView() {
		const currentView = this.uiManager.currentView;
		if (this.debugMode) {
			console.log('🔄 App: Refreshing current view:', currentView);
		}

		try {
			switch (currentView) {
				case 'variables':
					if (this.debugMode) {
						console.log('🔄 App: Displaying variables view');
					}
					this.uiManager.displayResults(this.dataManager.getFilteredData());
					break;
				case 'logs':
					if (this.debugMode) {
						console.log('🔄 App: Displaying logs view');
					}
					this.displayLogsView();
					break;
				case 'table':
					if (this.debugMode) {
						console.log('🔄 App: Displaying table view');
					}
					this.displayTableView();
					break;
			}
		} catch (error) {
			this.log('View refresh error', error);
			this.uiManager.showError('Failed to refresh view', error);
		}
	}

	displayLogsView() {
		// Get the raw log text from the data manager
		const rawLogText = this.dataManager.getRawLogText();

		// Use the UI manager to display the logs with syntax highlighting
		this.uiManager.showLogsView(rawLogText);
	}

	displayTableView() {
		// Get the raw log text from the data manager
		const rawLogText = this.dataManager.getRawLogText();

		// Use the UI manager to display the simple table
		this.uiManager.showTableView(rawLogText);
	}

	handleSearchChange() {
		try {
			const searchTerm = document.getElementById('searchFilter')?.value || '';
			this.dataManager.applyFilters(searchTerm);

			// For logs and table views, refresh with search term
			if (this.uiManager.currentView === 'logs') {
				this.uiManager.showLogsView(this.dataManager.getRawLogText());
			} else if (this.uiManager.currentView === 'table') {
				const rawLogText = this.dataManager.getRawLogText();
				this.uiManager.showTableView(rawLogText);
			} else {
				this.refreshCurrentView();
			}
		} catch (error) {
			this.log('Search error', error);
			this.uiManager.showError('Search failed', error);
		}
	}

	handleFileInput(event) {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target.result;
				let logContent = content;

				// Try to parse as JSON first
				try {
					const jsonData = JSON.parse(content);
					if (jsonData.logs) {
						logContent = jsonData.logs;
					} else if (typeof jsonData === 'string') {
						logContent = jsonData;
					}
				} catch {
					// Not JSON, use as plain text
				}

				document.getElementById('logInput').value = logContent;
				this.uiManager.switchInputMode('paste');
				this.log('File loaded successfully', {
					filename: file.name,
					size: content.length
				});

				this.uiManager.showToast(`File "${file.name}" loaded successfully!`, 'success');
			} catch (error) {
				this.log('File load error', error);
				this.uiManager.showError(`Error reading file: ${error.message}`, error);
			}
		};

		reader.onerror = () => {
			this.uiManager.showError('Failed to read file');
		};

		reader.readAsText(file);
	}

	toggleDebug() {
		this.debugMode = !this.debugMode;

		// Synchronize debug mode across all components
		this.logParser.debugMode = this.debugMode;
		this.uiManager.debugMode = this.debugMode;
		this.dataManager.debugMode = this.debugMode;

		const debugSection = document.getElementById('debugSection');
		const debugBtn = document.getElementById('debugBtn');

		if (this.debugMode) {
			debugSection.style.display = 'block';
			debugBtn.style.background = '#dc3545';
			debugBtn.textContent = '🐛 Hide Debug';
			this.updateDebugDisplay();
		} else {
			debugSection.style.display = 'none';
			debugBtn.style.background = '#ffc107';
			debugBtn.textContent = '🐛 Debug';
		}
	}

	updateDebugDisplay() {
		if (this.debugMode) {
			const debugContent = document.getElementById('debugContent');
			if (debugContent) {
				debugContent.textContent = this.logParser.debugLogs.slice(-50).join('\n');
			}
		}
	}

	// Load debug example files
	async loadDebugExample(filename) {
		if (!filename) return;
		
		try {
			const response = await fetch(`debug/${filename}`);
			if (!response.ok) {
				throw new Error(`Failed to load ${filename}: ${response.statusText}`);
			}
			
			const logContent = await response.text();
			
			// Clear any existing content and set the new log content
			const logInput = document.getElementById('logInput');
			if (logInput) {
				logInput.value = logContent;
				
				// Switch to paste mode if not already active
				const pasteBtn = document.getElementById('pasteBtn');
				const fileBtn = document.getElementById('fileBtn');
				const pasteMode = document.getElementById('pasteMode');
				const fileMode = document.getElementById('fileMode');
				
				if (pasteBtn && fileBtn && pasteMode && fileMode) {
					pasteBtn.classList.add('active');
					fileBtn.classList.remove('active');
					pasteMode.classList.add('active');
					fileMode.classList.remove('active');
				}
				
				// Auto-parse the loaded content
				this.parseContent();
			}
			
			// Reset the dropdown
			const select = document.getElementById('debugExamplesSelect');
			if (select) {
				select.value = '';
			}
			
		} catch (error) {
			console.error('Failed to load debug example:', error);
			alert(`Failed to load debug example: ${error.message}`);
		}
	}

	// Export functionality
	exportResults() {
		try {
			const data = this.dataManager.exportToJSON();
			const dataStr = JSON.stringify(data, null, 2);
			const dataBlob = new Blob([dataStr], { type: 'application/json' });
			const url = URL.createObjectURL(dataBlob);

			const link = document.createElement('a');
			link.href = url;
			link.download = `tosca-log-variables-${new Date().toISOString().split('T')[0]}.json`;
			link.click();

			URL.revokeObjectURL(url);
			this.uiManager.showToast('Results exported as JSON!', 'success');
			this.log('Export completed');
		} catch (error) {
			this.log('Export error', error);
			this.uiManager.showError('Export failed', error);
		}
	}

	copyAllResults() {
		try {
			const filteredData = this.dataManager.getFilteredData();
			const allData = filteredData.map(group => {
				const groupData = [`=== ${group.name} ===`];
				group.variables.forEach(item => {
					groupData.push(`${item.name}: ${item.value}`);
				});
				return groupData.join('\n');
			}).join('\n\n');

			this.copyToClipboard(allData);
			this.uiManager.showToast('All results copied to clipboard!', 'success');
		} catch (error) {
			this.log('Copy error', error);
			this.uiManager.showError('Copy failed', error);
		}
	}

	copyGroupVariables(groupIndex) {
		try {
			const variables = this.dataManager.getVariablesFromGroup(groupIndex);
			const group = this.dataManager.getFilteredData()[groupIndex];

			if (variables && group) {
				const data = variables.map(item => `${item.name}: ${item.value}`).join('\n');
				this.copyToClipboard(data);
				this.uiManager.showToast(`Copied ${variables.length} variables from "${group.name}"`, 'success');
			}
		} catch (error) {
			this.log('Group copy error', error);
			this.uiManager.showError('Failed to copy group', error);
		}
	}

	copyForPostman(jsonValue) {
		try {
			const parsed = JSON.parse(jsonValue);
			const formatted = JSON.stringify(parsed, null, 2);
			this.copyToClipboard(formatted);
			this.uiManager.showToast('JSON copied for Postman! 🚀', 'success');
		} catch (error) {
			this.copyToClipboard(jsonValue);
			this.uiManager.showToast('Raw value copied to clipboard', 'info');
		}
	}

	showFullValue(value, name, line) {
		// Create modal to show full value
		const modal = document.createElement('div');
		modal.className = 'value-modal';
		modal.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0,0,0,0.8);
			z-index: 10000;
			display: flex;
			align-items: center;
			justify-content: center;
		`;

		const modalContent = document.createElement('div');
		modalContent.style.cssText = `
			background: white;
			padding: 20px;
			border-radius: 8px;
			max-width: 80%;
			max-height: 80%;
			overflow: auto;
			position: relative;
		`;

		modalContent.innerHTML = `
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
				<h3 style="margin: 0;">${this.escapeHtml(name)} (Line ${line})</h3>
				<button onclick="this.closest('.value-modal').remove()" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">✕</button>
			</div>
			<pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow: auto; max-height: 400px; white-space: pre-wrap;">${this.escapeHtml(value)}</pre>
			<div style="margin-top: 15px;">
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(value)}'); window.app.uiManager.showToast('Value copied!', 'success');" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">📋 Copy Value</button>
			</div>
		`;

		modal.appendChild(modalContent);
		document.body.appendChild(modal);

		// Close on background click
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		});
	}

	clearResults() {
		try {
			this.dataManager.clear();
			document.getElementById('logInput').value = '';
			document.getElementById('searchFilter').value = '';
			document.getElementById('combinedHeader').style.display = 'none';

			// Clear all views
			const containers = ['resultsContent', 'logViewContent', 'tableViewContent'];
			containers.forEach(id => {
				const container = document.getElementById(id);
				if (container) {
					container.innerHTML = '';
				}
			});

			// Show placeholder
			document.getElementById('resultsPlaceholder').style.display = 'block';

			this.uiManager.showToast('Results cleared', 'info');
			this.log('Results cleared');
		} catch (error) {
			this.log('Clear error', error);
			this.uiManager.showError('Failed to clear results', error);
		}
	}

	// Utility methods
	copyToClipboard(text) {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text).catch(() => {
				this.fallbackCopy(text);
			});
		} else {
			this.fallbackCopy(text);
		}
	}

	fallbackCopy(text) {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand('copy');
		document.body.removeChild(textArea);
	}

	escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	escapeForJS(str) {
		return JSON.stringify(str).slice(1, -1);
	}
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	window.app = new ToscaLogParserApp();
	console.log('Tosca Log Parser App initialized');

	// Add debug helper for easier console log capture
	window.debugApp = () => {
		const filteredData = window.app?.dataManager.getFilteredData() || [];
		const totalFilteredVariables = filteredData.reduce((sum, group) => sum + (group.variables?.length || 0), 0);

		const data = {
			appExists: !!window.app,
			parsedDataCount: window.app?.dataManager.getParsedData().length || 0,
			groupedDataCount: window.app?.dataManager.getGroupedData().length || 0,
			filteredDataCount: totalFilteredVariables,
			filteredGroupCount: filteredData.length,
			currentView: window.app?.uiManager.currentView,
			elementStates: {
				resultsPlaceholder: document.getElementById('resultsPlaceholder')?.style.display,
				resultsContent: document.getElementById('resultsContent')?.style.display,
				logViewContent: document.getElementById('logViewContent')?.style.display,
				tableViewContent: document.getElementById('tableViewContent')?.style.display,
				combinedHeader: document.getElementById('combinedHeader')?.style.display
			}
		};
		console.log('🔍 Debug App State:');
		console.log(JSON.stringify(data, null, 2));
		return data;
	};

	// Add helper to copy debug info
	window.copyDebug = () => {
		const data = window.debugApp();
		navigator.clipboard.writeText(JSON.stringify(data, null, 2))
			.then(() => console.log('✅ Debug info copied to clipboard!'))
			.catch(() => console.log('❌ Failed to copy to clipboard'));
	};
});

export default ToscaLogParserApp;