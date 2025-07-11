// UI Manager - Handles all user interface interactions
class UIManager {
	constructor() {
		this.currentView = 'variables';
		this.wordWrapEnabled = false;
		this.debugMode = false;
		this.setupEventListeners();
	}

	setupEventListeners() {
		// Input mode switching
		document.getElementById('pasteBtn')?.addEventListener('click', () => this.switchInputMode('paste'));
		document.getElementById('fileBtn')?.addEventListener('click', () => this.switchInputMode('file'));

		// View buttons
		document.getElementById('variablesViewBtn')?.addEventListener('click', () => this.showVariablesView());
		document.getElementById('cardsViewBtn')?.addEventListener('click', () => this.showCardsView());
		document.getElementById('logsViewBtn')?.addEventListener('click', () => this.showLogsView());
		document.getElementById('tableViewBtn')?.addEventListener('click', () => this.showTableView());
		document.getElementById('wordWrapBtn')?.addEventListener('click', () => this.toggleWordWrap());

		// Action buttons
		document.getElementById('copyAllBtn')?.addEventListener('click', () => this.onCopyAll());
		document.getElementById('exportBtn')?.addEventListener('click', () => this.onExport());
		document.getElementById('clearBtn')?.addEventListener('click', () => this.onClear());

		// Search filter
		document.getElementById('searchFilter')?.addEventListener('input', () => this.onSearchChange());
	}

	// Event handler callbacks - these will be set by the main app
	onCopyAll = () => { };
	onExport = () => { };
	onClear = () => { };
	onSearchChange = () => { };
	onParseContent = () => { };

	switchInputMode(mode) {
		document.querySelectorAll('.input-btn').forEach(btn => btn.classList.remove('active'));
		document.querySelectorAll('.input-mode').forEach(mode => mode.classList.remove('active'));

		if (mode === 'paste') {
			document.getElementById('pasteBtn')?.classList.add('active');
			document.getElementById('pasteMode')?.classList.add('active');
		} else if (mode === 'file') {
			document.getElementById('fileBtn')?.classList.add('active');
			document.getElementById('fileMode')?.classList.add('active');
		}
	}

	showVariablesView() {
		this.currentView = 'variables';
		this.updateViewButtons();

		document.getElementById('resultsContent').style.display = 'block';
		document.getElementById('cardsViewContent').style.display = 'none';
		document.getElementById('logViewContent').style.display = 'none';
		document.getElementById('tableViewContent').style.display = 'none';
		document.getElementById('wordWrapBtn').style.display = 'none';
	}

	showCardsView() {
		this.currentView = 'cards';
		this.updateViewButtons();

		document.getElementById('resultsContent').style.display = 'none';
		document.getElementById('cardsViewContent').style.display = 'block';
		document.getElementById('logViewContent').style.display = 'none';
		document.getElementById('tableViewContent').style.display = 'none';
		document.getElementById('wordWrapBtn').style.display = 'none';

		// If we have data, render it in cards format
		if (this.lastFilteredData && this.lastFilteredData.length > 0) {
			this.renderCardsView(this.lastFilteredData);
		}
	}

	showLogsView(rawLogText = '', hierarchicalGroups = null) {
		this.currentView = 'logs';
		this.updateViewButtons();

		document.getElementById('resultsContent').style.display = 'none';
		document.getElementById('cardsViewContent').style.display = 'none';
		document.getElementById('logViewContent').style.display = 'block';
		document.getElementById('tableViewContent').style.display = 'none';
		document.getElementById('wordWrapBtn').style.display = 'inline-block';

		// Get search filter if active
		const searchFilter = document.getElementById('searchFilter');
		const searchTerm = searchFilter ? searchFilter.value : '';

		// Always use the original colored logs display
		this.displayColoredLogs(rawLogText, searchTerm);
	}

	showTableView(rawLogText = '', hierarchicalGroups = null) {
		this.currentView = 'table';
		this.updateViewButtons();

		document.getElementById('resultsContent').style.display = 'none';
		document.getElementById('cardsViewContent').style.display = 'none';
		document.getElementById('logViewContent').style.display = 'none';
		document.getElementById('tableViewContent').style.display = 'block';
		document.getElementById('wordWrapBtn').style.display = 'none';

		// Get search filter if active
		const searchFilter = document.getElementById('searchFilter');
		const searchTerm = searchFilter ? searchFilter.value : '';

		// Always use the simple table view - one line per row
		this.displaySimpleTable(rawLogText, searchTerm);
	}

	updateViewButtons() {
		document.querySelectorAll('.log-parser-view-btn').forEach(btn => btn.classList.remove('active'));
		document.getElementById(`${this.currentView}ViewBtn`)?.classList.add('active');
	}

	toggleWordWrap() {
		this.wordWrapEnabled = !this.wordWrapEnabled;
		const logContent = document.querySelector('#logViewContent .log-view-content');
		if (logContent) {
			logContent.classList.toggle('word-wrap', this.wordWrapEnabled);
		}

		const btn = document.getElementById('wordWrapBtn');
		if (btn) {
			btn.textContent = this.wordWrapEnabled ? '📄 Unwrap' : '📄 Wrap';
			btn.classList.toggle('active', this.wordWrapEnabled);
		}

		if (this.debugMode) {
			console.log('🖥️ UI: Word wrap toggled:', this.wordWrapEnabled, 'Element found:', !!logContent);
		}
	}

	// Show/hide loading state
	showLoading(message = 'Processing...') {
		const btn = document.getElementById('parseBtn');
		if (btn) {
			btn.disabled = true;
			btn.innerHTML = `<span>⏳ ${message}</span>`;
		}
	}

	hideLoading() {
		const btn = document.getElementById('parseBtn');
		if (btn) {
			btn.disabled = false;
			btn.innerHTML = '🔄 Parse Logs';
		}
	}

	// Show progress for large operations
	showProgress(current, total, message = 'Processing') {
		const percentage = Math.round((current / total) * 100);
		const btn = document.getElementById('parseBtn');
		if (btn) {
			btn.innerHTML = `<span>⏳ ${message} ${percentage}%</span>`;
		}
	}

	// Display results with improved performance
	displayResults(filteredData) {
		if (this.debugMode) {
			console.log('🖥️ UI: displayResults called with:', {
				filteredDataLength: filteredData?.length,
				filteredData: filteredData
			});
		}

		// Store filtered data for view switching
		this.lastFilteredData = filteredData;

		const resultsPlaceholder = document.getElementById('resultsPlaceholder');
		const resultsContent = document.getElementById('resultsContent');

		if (this.debugMode) {
			console.log('🖥️ UI: DOM elements found:', {
				resultsPlaceholder: !!resultsPlaceholder,
				resultsContent: !!resultsContent
			});
		}

		if (!filteredData || filteredData.length === 0) {
			if (this.debugMode) {
				console.log('🖥️ UI: No filtered data, showing placeholder');
			}
			resultsPlaceholder.style.display = 'block';
			resultsContent.style.display = 'none';
			resultsPlaceholder.innerHTML = `
                <p>📊</p>
                <p>No variables match your current filters</p>
            `;
			return;
		}

		if (this.debugMode) {
			console.log('🖥️ UI: Has filtered data, showing results content');
		}
		resultsPlaceholder.style.display = 'none';

		// Show content based on current view
		if (this.currentView === 'cards') {
			resultsContent.style.display = 'none';
			document.getElementById('cardsViewContent').style.display = 'block';
			this.renderCardsView(filteredData);
		} else {
			resultsContent.style.display = 'block';
			document.getElementById('cardsViewContent').style.display = 'none';
			this.renderGroupedResults(filteredData);
		}
	}

	// Render grouped results with virtual scrolling for large datasets
	renderGroupedResults(groupedData) {
		const container = document.getElementById('resultsContent');
		if (!container) return;

		// Clear existing content
		container.innerHTML = '';

		// Debug: log what we're trying to render
		if (this.debugMode) {
			console.log('🖥️ UI: Rendering groups:', {
				totalGroups: groupedData.length,
				groupDetails: groupedData.map(g => ({ name: g.name, variableCount: g.variables.length }))
			});
		}

		// If we have many groups, implement virtual scrolling
		if (groupedData.length > 10) {
			this.renderVirtualizedGroups(container, groupedData);
		} else {
			this.renderAllGroups(container, groupedData);
		}
	}

	renderAllGroups(container, groupedData) {
		if (this.debugMode) {
			console.log('🖥️ UI: Creating group elements...', groupedData.length);
		}
		const fragment = document.createDocumentFragment();

		groupedData.forEach((group, index) => {
			if (this.debugMode) {
				console.log(`🖥️ UI: Creating group ${index}: ${group.name} with ${group.variables.length} variables`);
			}
			const groupElement = this.createGroupElement(group, index);
			fragment.appendChild(groupElement);
		});

		if (this.debugMode) {
			console.log('🖥️ UI: Appending fragment to container');
		}
		container.appendChild(fragment);
		if (this.debugMode) {
			console.log('🖥️ UI: Container now has', container.children.length, 'children');
			console.log('🖥️ UI: Container innerHTML length:', container.innerHTML.length);
			console.log('🖥️ UI: Container first child:', container.children[0]?.className, container.children[0]?.children.length, 'children');
		}
	}

	// Simple virtual scrolling implementation
	renderVirtualizedGroups(container, groupedData) {
		// For now, render first 20 groups and add "Load More" button
		const visibleGroups = groupedData.slice(0, 20);
		this.renderAllGroups(container, visibleGroups);

		if (groupedData.length > 20) {
			const loadMoreBtn = document.createElement('button');
			loadMoreBtn.className = 'load-more-btn';
			loadMoreBtn.textContent = `Load More (${groupedData.length - 20} remaining)`;
			loadMoreBtn.style.cssText = `
				width: 100%;
				padding: 15px;
				background: #f8f9fa;
				border: 1px solid #dee2e6;
				border-radius: 4px;
				cursor: pointer;
				margin-top: 10px;
			`;

			loadMoreBtn.addEventListener('click', () => {
				loadMoreBtn.remove();
				const remainingGroups = groupedData.slice(20);
				this.renderAllGroups(container, remainingGroups);
			});

			container.appendChild(loadMoreBtn);
		}
	}

	// Render cards view
	renderCardsView(groupedData) {
		const container = document.getElementById('cardsViewContent');
		if (!container) return;

		// Clear existing content but keep the operation-cards wrapper
		const operationCards = container.querySelector('.operation-cards');
		if (operationCards) {
			operationCards.innerHTML = '';
		}

		if (!groupedData || groupedData.length === 0) {
			if (operationCards) {
				operationCards.innerHTML = '<div class="operation-card"><div class="operation-card-body"><p style="text-align: center; color: #6c757d;">No operations to display</p></div></div>';
			}
			return;
		}

		// Generate cards from grouped data
		groupedData.forEach(group => {
			const cardElement = this.createOperationCard(group);
			operationCards.appendChild(cardElement);
		});
	}

	createOperationCard(group) {
		const card = document.createElement('div');
		card.className = 'operation-card';

		// Determine status based on group name or variables
		const status = group.name.includes('FAILED') ? 'failed' : 'success';
		const statusText = status === 'failed' ? 'Failed' : 'Success';

		card.innerHTML = `
			<div class="operation-card-header">
				<h3 class="operation-card-title">${this.getOperationIcon(group)} "${group.name}"</h3>
				<span class="operation-card-status ${status}">${statusText}</span>
			</div>
			<div class="operation-card-body">
				${this.createOperationSections(group.variables)}
			</div>
			<div class="operation-card-actions">
				<button class="operation-action-btn copy" onclick="this.copyGroup('${group.name}')">📋 Copy</button>
				<button class="operation-action-btn view" onclick="this.viewGroup('${group.name}')">👁️ View Details</button>
				<button class="operation-action-btn variables">🔗 Variables: ${group.variables.length}</button>
			</div>
		`;

		return card;
	}

	getOperationIcon(group) {
		const name = group.name.toLowerCase();
		if (name.includes('token') || name.includes('auth')) return '🔑';
		if (name.includes('request') || name.includes('post') || name.includes('get')) return '📡';
		if (name.includes('response')) return '📨';
		if (name.includes('url') || name.includes('endpoint')) return '🔗';
		if (name.includes('test') || name.includes('verify')) return '✅';
		if (name.includes('wait') || name.includes('time')) return '⏱️';
		if (name.includes('generate') || name.includes('create')) return '⚡';
		return '📋';
	}

	createOperationSections(variables) {
		const requestVars = variables.filter(v => v.name.toLowerCase().includes('request') ||
			v.name.toLowerCase().includes('endpoint') ||
			v.name.toLowerCase().includes('authorization'));
		const responseVars = variables.filter(v => v.name.toLowerCase().includes('response') ||
			v.name.toLowerCase().includes('status') ||
			v.type === 'Token' ||
			v.name.toLowerCase().includes('buffer'));
		const otherVars = variables.filter(v => !requestVars.includes(v) && !responseVars.includes(v));

		let sections = '';

		if (requestVars.length > 0) {
			sections += `
				<div class="operation-section">
					<div class="operation-section-title request">REQUEST:</div>
					<div class="operation-items">
						${requestVars.map(v => this.createOperationItem(v, 'ok')).join('')}
					</div>
				</div>
			`;
		}

		if (responseVars.length > 0) {
			sections += `
				<div class="operation-section">
					<div class="operation-section-title response">RESPONSE:</div>
					<div class="operation-items">
						${responseVars.map(v => this.createOperationItem(v, v.type === 'Token' ? 'buffer' : 'verification')).join('')}
					</div>
				</div>
			`;
		}

		if (otherVars.length > 0) {
			sections += `
				<div class="operation-section">
					<div class="operation-section-title">VARIABLES:</div>
					<div class="operation-items">
						${otherVars.map(v => this.createOperationItem(v, 'buffer')).join('')}
					</div>
				</div>
			`;
		}

		return sections;
	}

	createOperationItem(variable, itemType) {
		const icon = itemType === 'ok' ? '✓' : itemType === 'buffer' ? '📋' : '🔍';
		const truncatedValue = variable.value && variable.value.length > 50 ?
			variable.value.substring(0, 50) + '...' : variable.value;

		return `
			<div class="operation-item ${itemType}">
				<span class="operation-item-icon">${icon}</span>
				<span class="operation-item-name">"${variable.name}"</span>
				<span class="operation-item-value ${variable.value && variable.value.length > 50 ? 'truncated' : ''}">${truncatedValue || 'Ok'}</span>
			</div>
		`;
	}

	createGroupElement(group, groupIndex) {
		const groupDiv = document.createElement('div');
		groupDiv.className = 'group';

		// Create header
		const headerDiv = document.createElement('div');
		headerDiv.className = 'group-header';

		const badges = this.createVariableTypeBadges(group.variables);
		const timestampDisplay = group.timestamp ?
			new Date(group.timestamp).toLocaleTimeString() : '';

		headerDiv.innerHTML = `
			<div class="group-info">
				<div style="flex: 1;">
					<div class="group-title">${this.escapeHtml(group.name)}</div>
					<div class="group-meta">
						${badges}
						${timestampDisplay ? `<span class="timestamp">${timestampDisplay}</span>` : ''}
					</div>
				</div>
			</div>
			<button onclick="window.app.copyGroupVariables(${groupIndex})" class="group-copy-btn">📋 Copy Group</button>
		`;

		// Create content
		const contentDiv = document.createElement('div');
		contentDiv.className = 'group-content';
		const tableHTML = this.createVariableTable(group.variables);
		contentDiv.innerHTML = tableHTML;

		if (this.debugMode) {
			console.log('🖥️ UI: Group element created:', {
				groupName: group.name,
				variableCount: group.variables.length,
				headerHTML: headerDiv.innerHTML.length,
				tableHTML: tableHTML.length,
				contentDivHTML: contentDiv.innerHTML.length
			});
		}

		groupDiv.appendChild(headerDiv);
		groupDiv.appendChild(contentDiv);

		if (this.debugMode) {
			console.log('🖥️ UI: Final group element:', {
				groupDivChildren: groupDiv.children.length,
				groupDivHTML: groupDiv.innerHTML.length
			});
		}

		return groupDiv;
	}

	createVariableTypeBadges(variables) {
		const counts = {
			'Buffer Variable': 0,
			'JSON': 0,
			'URL': 0,
			'Token': 0,
			'other': 0
		};

		variables.forEach(v => {
			if (counts.hasOwnProperty(v.type)) {
				counts[v.type]++;
			} else {
				counts.other++;
			}
		});

		let badges = '';
		if (counts['Buffer Variable'] > 0) badges += `<span class="badge badge-buffers">${counts['Buffer Variable']} vars</span>`;
		if (counts['JSON'] > 0) badges += `<span class="badge badge-json">${counts['JSON']} JSON</span>`;
		if (counts['URL'] > 0) badges += `<span class="badge badge-urls">${counts['URL']} URLs</span>`;
		if (counts['Token'] > 0) badges += `<span class="badge badge-tokens">${counts['Token']} tokens</span>`;
		if (counts.other > 0) badges += `<span class="badge badge-other">+${counts.other} other</span>`;

		return badges;
	}

	createVariableTable(variables) {
		if (this.debugMode) {
			console.log('🖥️ UI: Creating variable table for', variables.length, 'variables');
		}
		let html = '<table class="variable-table">';
		html += '<thead><tr><th>Name</th><th>Value</th><th>Type</th><th>Line</th><th>Actions</th></tr></thead>';
		html += '<tbody>';

		variables.forEach((variable, index) => {
			html += this.createVariableRow(variable, index);
		});

		html += '</tbody></table>';
		if (this.debugMode) {
			console.log('🖥️ UI: Generated table HTML length:', html.length);
		}
		return html;
	}

	createVariableRow(variable, index) {
		if (this.debugMode) {
			console.log(`🖥️ UI: Creating row ${index} for variable:`, {
				name: variable.name,
				type: variable.type,
				valueLength: variable.value?.length || 0
			});
		}

		const typeClass = this.getTypeClass(variable.type);
		const typeLabel = this.getTypeLabel(variable.type);

		let valueDisplay = '';
		let actionButtons = '';

		if (variable.type === 'JSON') {
			valueDisplay = this.createJSONDisplay(variable);
			actionButtons = `
				<button onclick="window.app.copyForPostman('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-postman" title="Copy for Postman">🚀</button>
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Raw">📄</button>
			`;
		} else if (variable.type === 'URL') {
			valueDisplay = `<a href="${this.escapeHtml(variable.value)}" target="_blank" class="url-link">${this.escapeHtml(variable.value)}</a>`;
			actionButtons = `
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy URL">📋</button>
				<button onclick="window.open('${this.escapeForJS(variable.value)}', '_blank')" class="var-btn var-btn-view" title="Open URL">🔗</button>
			`;
		} else if (variable.type === 'Token') {
			// Truncate tokens by half
			const halfLength = Math.floor(variable.value.length / 10);
			const displayValue = variable.value.substring(0, halfLength) + '...';
			valueDisplay = `<span class="variable-value token-value">${this.escapeHtml(displayValue)}</span>`;
			actionButtons = `
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Token">📋</button>
				<button onclick="window.app.showFullValue('${this.escapeForJS(variable.value)}', '${this.escapeForJS(variable.name)}', ${variable.line})" class="var-btn var-btn-view" title="View Full">👁️</button>
			`;
		} else if (variable.type === 'ID') {
			const displayValue = variable.value.length > 100 ?
				variable.value.substring(0, 100) + '...' : variable.value;
			valueDisplay = `<span class="variable-value id-value">${this.escapeHtml(displayValue)}</span>`;
			actionButtons = `
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Value">📋</button>
				<button onclick="window.app.showFullValue('${this.escapeForJS(variable.value)}', '${this.escapeForJS(variable.name)}', ${variable.line})" class="var-btn var-btn-view" title="View Full">👁️</button>
			`;
		} else {
			const displayValue = variable.value.length > 100 ?
				variable.value.substring(0, 100) + '...' : variable.value;
			valueDisplay = `<span class="variable-value">${this.escapeHtml(displayValue)}</span>`;
			actionButtons = `
				<button onclick="window.app.copyToClipboard('${this.escapeForJS(variable.value)}')" class="var-btn var-btn-copy" title="Copy Value">📋</button>
				<button onclick="window.app.showFullValue('${this.escapeForJS(variable.value)}', '${this.escapeForJS(variable.name)}', ${variable.line})" class="var-btn var-btn-view" title="View Full">👁️</button>
			`;
		}

		const rowClass = variable.type === 'JSON' ? 'json-row' : '';

		const rowHTML = `<tr class="${rowClass}">
			<td class="variable-name">${this.escapeHtml(variable.name)}</td>
			<td class="variable-value-cell">${valueDisplay}</td>
			<td><span class="type-badge ${typeClass}">${typeLabel}</span></td>
			<td class="line-number">${variable.line}</td>
			<td class="var-actions"><div class="var-actions">${actionButtons}</div></td>
		</tr>`;

		if (this.debugMode) {
			console.log(`🖥️ UI: Generated row HTML for ${variable.name}:`, rowHTML.length, 'chars');
		}
		return rowHTML;
	}

	createJSONDisplay(variable) {
		const formatted = this.formatJSONWithHighlighting(variable.value);
		return `<div class="json-container-full">
			<div class="json-full-display">
				<pre class="json-formatted-full">${formatted}</pre>
			</div>
		</div>`;
	}

	formatJSONWithHighlighting(jsonStr) {
		try {
			const parsed = JSON.parse(jsonStr);
			const formatted = JSON.stringify(parsed, null, 2);

			return formatted
				.replace(/(".*?")(:)/g, '<span class="json-key">$1</span><span class="json-colon">$2</span>')
				.replace(/(:)(\s*)(".*?")/g, '$1$2<span class="json-string">$3</span>')
				.replace(/(:)(\s*)(true|false)/g, '$1$2<span class="json-boolean">$3</span>')
				.replace(/(:)(\s*)(null)/g, '$1$2<span class="json-null">$3</span>')
				.replace(/(:)(\s*)(\d+\.?\d*)/g, '$1$2<span class="json-number">$3</span>');
		} catch (e) {
			return this.escapeHtml(jsonStr);
		}
	}

	getTypeClass(type) {
		const typeClasses = {
			'JSON': 'type-json',
			'URL': 'type-url',
			'ID': 'type-id',
			'Timestamp': 'type-timestamp',
			'Token': 'type-token'
		};
		return typeClasses[type] || 'type-buffer';
	}

	getTypeLabel(type) {
		const typeLabels = {
			'JSON': 'JSON',
			'URL': 'URL',
			'ID': 'ID',
			'Timestamp': 'TIME',
			'Token': 'TOKEN'
		};
		return typeLabels[type] || 'VAR';
	}

	// Update header with statistics
	updateHeader(parsedData) {
		const combinedCount = document.getElementById('combinedCount');
		if (!combinedCount || !parsedData.length) return;

		const minLine = Math.min(...parsedData.map(item => item.line));
		const maxLine = Math.max(...parsedData.map(item => item.line));

		const jsonCount = parsedData.filter(item => item.type === 'JSON').length;
		const urlCount = parsedData.filter(item => item.type === 'URL').length;
		const tokenCount = parsedData.filter(item => item.type === 'Token').length;

		let summary = `${parsedData.length} Variables Found`;
		if (jsonCount > 0) summary += ` • ${jsonCount} JSON Payloads`;
		if (urlCount > 0) summary += ` • ${urlCount} URLs`;
		if (tokenCount > 0) summary += ` • ${tokenCount} Tokens`;
		summary += ` • Lines ${minLine}-${maxLine}`;

		combinedCount.textContent = summary;
		document.getElementById('combinedHeader').style.display = 'block';
	}

	// Toast notifications
	showToast(message, type = 'info') {
		const toast = document.createElement('div');
		toast.className = `toast toast-${type}`;
		toast.textContent = message;
		toast.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			padding: 12px 20px;
			background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
			color: white;
			border-radius: 4px;
			z-index: 10000;
			font-weight: 500;
			box-shadow: 0 4px 12px rgba(0,0,0,0.2);
			transform: translateX(100%);
			transition: transform 0.3s ease;
		`;

		document.body.appendChild(toast);

		setTimeout(() => toast.style.transform = 'translateX(0)', 10);
		setTimeout(() => {
			toast.style.transform = 'translateX(100%)';
			setTimeout(() => toast.remove(), 300);
		}, 3000);
	}

	// Error handling
	showError(message, error = null) {
		if (this.debugMode || error) {
			console.error('UI Error:', message, error);
		}
		this.showToast(`Error: ${message}`, 'error');
		this.hideLoading();
	}

	// Display colored logs with syntax highlighting
	displayColoredLogs(rawLogText, searchTerm = '') {
		const container = document.getElementById('logViewContent');

		if (!rawLogText) {
			container.innerHTML = '<div class="log-view-content">No logs to display</div>';
			return;
		}

		const logLines = rawLogText.split('\n');

		// Apply search filter if active
		const filteredLines = searchTerm ?
			logLines.map((line, index) => ({ line, index }))
				.filter(item => item.line.toLowerCase().includes(searchTerm.toLowerCase())) :
			logLines.map((line, index) => ({ line, index }));

		container.className = 'log-view-content';
		if (this.wordWrapEnabled) {
			container.classList.add('word-wrap');
		}

		let html = '<div class="log-view-content">';
		filteredLines.forEach(item => {
			const highlightedLine = this.addColorHighlighting(item.line);
			const lineNumber = typeof item.index !== 'undefined' ? item.index + 1 : item;
			html += `<div class="log-line" data-line="${lineNumber}">${highlightedLine}</div>`;
		});
		html += '</div>';

		container.innerHTML = html;
		if (this.debugMode) {
			console.log('🖥️ UI: Logs displayed, lines:', filteredLines.length);
		}
	}


	// Add color highlighting to log lines
	addColorHighlighting(line) {
		let highlighted = this.escapeHtml(line);

		// Highlight timestamps
		highlighted = highlighted.replace(
			/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/g,
			'<span class="log-timestamp">$1</span>'
		);

		// Highlight log levels
		highlighted = highlighted.replace(/\[(INF|ERR|WAR|DEB)\]/g, '<span class="log-level-$1">[$1]</span>');

		// Highlight test case names
		highlighted = highlighted.replace(
			/(Starting TestCase\s*['"])([^'"]+)(['"'])/g,
			'$1<span class="log-testcase">$2</span>$3'
		);

		// Highlight JSON objects in logs
		if (highlighted.includes('{') && highlighted.includes('}') && highlighted.includes('"')) {
			// Highlight the entire JSON block with a background
			highlighted = highlighted.replace(
				/(\{[^}]*\})/g,
				'<span class="log-json-block">$1</span>'
			);

			// Highlight JSON keys
			highlighted = highlighted.replace(
				/("[\w-]+")(\s*:\s*)/g,
				'<span class="log-json-key">$1</span><span class="log-json-colon">$2</span>'
			);

			// Highlight JSON string values
			highlighted = highlighted.replace(
				/(:)(\s*)("([^"\\\\]|\\\\.)*")/g,
				'$1$2<span class="log-json-string">$3</span>'
			);

			// Highlight JSON numbers
			highlighted = highlighted.replace(
				/(:)(\s*)(\d+\.?\d*)/g,
				'$1$2<span class="log-json-number">$3</span>'
			);

			// Highlight JSON booleans and null
			highlighted = highlighted.replace(
				/(:)(\s*)(true|false|null)/g,
				'$1$2<span class="log-json-boolean">$3</span>'
			);

			// Highlight JSON brackets
			highlighted = highlighted.replace(
				/([{}[\]])/g,
				'<span class="log-json-bracket">$1</span>'
			);
		}

		// Highlight request/response operations
		highlighted = highlighted.replace(
			/(\[Succeeded\]\s*['"])([^'"]*(?:Request|request)[^'"]*?)(['"])/g,
			'$1<span class="log-request-operation">$2</span>$3'
		);

		highlighted = highlighted.replace(
			/(\[Succeeded\]\s*['"])([^'"]*(?:Response|response)[^'"]*?)(['"])/g,
			'$1<span class="log-response-operation">$2</span>$3'
		);

		// Highlight HTTP status codes and response times
		highlighted = highlighted.replace(
			/(Server Response Time:\s*)(\d+\s*ms)/g,
			'$1<span class="log-response-time">$2</span>'
		);

		highlighted = highlighted.replace(
			/(Expected value == |Actual value:\s*)(["']?\d{3}\s+[A-Za-z\s]+["']?)/g,
			'$1<span class="log-status-code">$2</span>'
		);

		// Highlight buffer variables
		highlighted = highlighted.replace(
			/(Buffer with name[:\s]*['"])([^'"]*?)(['"][^'"]*has been set to value[:\s]*['"])([^'"]*?)(['"])/g,
			'$1<span class="log-buffer-name">$2</span>$3<span class="log-buffer-value">$4</span>$5'
		);

		// Highlight URLs
		highlighted = highlighted.replace(
			/(^|[^>])(https?:\/\/[^\s'"<>]+)/g,
			'$1<span class="log-url">$2</span>'
		);

		// Highlight status
		highlighted = highlighted.replace(/\[(Succeeded|Failed)\]/g, '<span class="log-status-$1">[$1]</span>');

		return highlighted;
	}

	// Display simple table view - one line per row
	displaySimpleTable(rawLogText, searchTerm = '') {
		const container = document.getElementById('tableViewContent');

		if (!rawLogText) {
			container.innerHTML = '<div class="table-view">No logs to display</div>';
			return;
		}

		// Parse raw logs into table data
		const tableData = this.parseLogsForTable(rawLogText);

		// Apply search filter if active
		const filteredTableData = searchTerm ?
			tableData.filter(row => this.matchesTableSearch(row, searchTerm.toLowerCase())) :
			tableData;

		// Generate simple table HTML
		const tableHTML = this.generateSimpleTableHTML(filteredTableData);
		container.innerHTML = tableHTML;

		if (this.debugMode) {
			console.log('🖥️ UI: Simple table displayed, rows:', filteredTableData.length);
		}
	}

	// Generate clean HTML table with each log line as a row
	generateSimpleTableHTML(tableData) {
		if (!tableData || tableData.length === 0) {
			return '<div class="table-view">No log entries to display</div>';
		}

		let html = `
			<div class="table-view-content">
				<table class="log-table">
					<thead>
						<tr>
							<th class="th-line">Line</th>
							<th class="th-operation">Operation</th>
							<th class="th-details">Details</th>
							<th class="th-variable">Variable</th>
							<th class="th-value">Value</th>
							<th class="th-actions">Actions</th>
							<th class="th-status">Status</th>
						</tr>
					</thead>
					<tbody>
		`;

		tableData.forEach(logInfo => {
			html += this.generateSimpleTableRow(logInfo);
		});

		html += `
					</tbody>
				</table>
			</div>
		`;

		return html;
	}

	// Generate a single table row for a log line
	generateSimpleTableRow(logInfo) {
		const rowClass = this.getRowClass(logInfo);
		const operationDisplay = this.getOperationNameDisplay(logInfo);
		const detailsDisplay = this.getDetailsDisplay(logInfo);
		const variableDisplay = logInfo.variable ? this.escapeHtml(logInfo.variable) : '';
		const valueDisplay = this.getCleanValueDisplay(logInfo);
		const statusDisplay = this.getStatusDisplay(logInfo);
		const actionsDisplay = this.getActionsDisplay(logInfo);

		return `
			<tr class="${rowClass}">
				<td class="td-line">${logInfo.lineNumber}</td>
				<td class="td-operation">${operationDisplay}</td>
				<td class="td-details">${detailsDisplay}</td>
				<td class="td-variable">${variableDisplay}</td>
				<td class="td-value">${valueDisplay}</td>
				<td class="td-actions"><div class="var-actions">${actionsDisplay}</div></td>
				<td class="td-status">${statusDisplay}</td>
			</tr>
		`;
	}

	// Helper methods for table row generation
	getRowClass(logInfo) {
		let classes = ['log-table-row'];

		if (logInfo.type) {
			classes.push(`row-type-${logInfo.type}`);
		}

		if (logInfo.status) {
			classes.push(`row-status-${logInfo.status.toLowerCase()}`);
		}

		return classes.join(' ');
	}



	getOperationNameDisplay(logInfo) {
		let operation = logInfo.operation || logInfo.content || '';

		// Clean up operation names - remove common prefixes and suffixes
		operation = operation.replace(/^Buffer with name[:\s]*['"]([^'"]*)['"]\s*has been set to value.*/, '$1 - Buffer Set');
		operation = operation.replace(/^\[Succeeded\]\s*['"]?([^'"]*?)['"]?$/, '$1');
		operation = operation.replace(/^\[Failed\]\s*['"]?([^'"]*?)['"]?$/, '$1 - FAILED');
		operation = operation.replace(/^Starting:\s*/, '');
		operation = operation.replace(/^Set Buffer:\s*/, '');

		// Truncate long operations but keep full content in title
		const maxLength = 60;
		if (operation.length > maxLength) {
			const truncated = operation.substring(0, maxLength) + '...';
			return `<span title="${this.escapeHtml(operation)}">${this.escapeHtml(truncated)}</span>`;
		}

		return this.escapeHtml(operation);
	}

	getDetailsDisplay(logInfo) {
		// For buffer variables, show context about when they were set
		if (logInfo.variable && logInfo.value) {
			// Check if this is part of a REQUEST/RESPONSE pattern by looking at the original line
			const line = logInfo.originalLine || '';

			if (line.includes('REQUEST:') || line.includes('RESPONSE:')) {
				return 'API Operation';
			} else if (line.includes('Expression')) {
				return line.match(/Expression[^']*'([^']*)'/) ?
					`Expression: ${line.match(/Expression[^']*'([^']*)'/)[1]}` : 'Expression Evaluation';
			} else if (line.includes('Waited for')) {
				return line.match(/Waited for (\d+ms)/) ?
					`Wait: ${line.match(/Waited for (\d+ms)/)[1]}` : 'Wait Operation';
			}
			return 'Buffer Variable';
		}

		// For other operations, extract details
		let operation = logInfo.operation || logInfo.content || '';

		if (operation.includes('Starting TestCase')) {
			return 'Test Case Start';
		} else if (operation.includes('FAILED')) {
			return 'Operation Failed';
		} else if (operation.includes('Expression')) {
			const match = operation.match(/'([^']*)'\s*evaluated to\s*'([^']*)'/);
			return match ? `Expression: ${match[1]} → ${match[2]}` : 'Expression Evaluation';
		} else if (operation.includes('Waited for')) {
			const match = operation.match(/Waited for (\d+(?:ms|s))/);
			return match ? `Wait: ${match[1]}` : 'Wait Operation';
		} else if (operation.includes('REQUEST:') || operation.includes('RESPONSE:')) {
			return 'API Operation';
		}

		return '';
	}

	getCleanValueDisplay(logInfo) {
		if (!logInfo.value) return '';

		// Handle JSON values
		if (logInfo.jsonBody) {
			const jsonId = `table-json-${logInfo.lineNumber}`;
			const preview = logInfo.value.substring(0, 40) + (logInfo.value.length > 40 ? '...' : '');

			return `
				<div class="json-table-container">
					<div class="json-preview-line" onclick="toggleTableJson('${jsonId}')" style="cursor: pointer;">
						<span class="json-indicator">{ }</span>
						<code style="font-size: 11px;">${this.escapeHtml(preview)}</code>
						<span id="${jsonId}-toggle" class="json-toggle">▶</span>
					</div>
					<div id="${jsonId}" class="json-expanded-content" style="display: none; margin-top: 5px;">
						<pre class="json-formatted-table">${this.formatJSONWithHighlighting(logInfo.value)}</pre>
					</div>
				</div>
			`;
		}

		// Handle regular values - just show the value without variable name
		const maxLength = 100;
		if (logInfo.value.length > maxLength) {
			const truncated = logInfo.value.substring(0, maxLength) + '...';
			return `
				<span title="${this.escapeHtml(logInfo.value)}" class="table-value-code">
					${this.escapeHtml(truncated)}
				</span>
			`;
		}

		return `<span class="table-value-code">${this.escapeHtml(logInfo.value)}</span>`;
	}

	getStatusDisplay(logInfo) {
		// Check for failure indicators
		if (logInfo.status === 'Failed' ||
			(logInfo.operation && logInfo.operation.includes('FAILED')) ||
			(logInfo.content && logInfo.content.includes('FAILED'))) {
			return '<span class="status-failed">❌</span>';
		}

		// Check for success indicators
		if (logInfo.variable && logInfo.value) {
			return '<span class="status-success">✅</span>';
		}

		if (logInfo.status === 'Succeeded' ||
			(logInfo.operation && logInfo.operation.includes('Succeeded'))) {
			return '<span class="status-success">✅</span>';
		}

		// For expressions that evaluate to True
		if (logInfo.content && logInfo.content.includes("evaluated to 'True'")) {
			return '<span class="status-success">✅</span>';
		}

		// For expressions that evaluate to False
		if (logInfo.content && logInfo.content.includes("evaluated to 'False'")) {
			return '<span class="status-failed">❌</span>';
		}

		// Default for operations that completed
		if (logInfo.operation || logInfo.content) {
			return '<span class="status-success">✅</span>';
		}

		return '';
	}

	// Removed old getValueDisplay and getTypeDisplay methods - using new structure instead

	getActionsDisplay(logInfo) {
		if (!logInfo.variable || !logInfo.value) return '';

		let actions = [];

		// Copy button - always available for variables
		actions.push(`
			<button class="var-btn var-btn-copy"
					onclick="window.app.copyToClipboard('${this.escapeForJS(logInfo.value)}')"
					title="Copy Value">
				📋
			</button>
		`);

		// Postman button for JSON values
		if (logInfo.jsonBody) {
			actions.push(`
				<button class="var-btn var-btn-postman"
						onclick="window.app.copyForPostman('${this.escapeForJS(logInfo.value)}')"
						title="Copy for Postman">
					🚀
				</button>
			`);
		}

		// View button for long values
		if (logInfo.value && logInfo.value.length > 100) {
			actions.push(`
				<button class="var-btn var-btn-view"
						onclick="window.app.showFullValue('${this.escapeForJS(logInfo.value)}', '${this.escapeForJS(logInfo.variable)}', ${logInfo.lineNumber})"
						title="View Full Value">
					👁️
				</button>
			`);
		}

		return actions.join('');
	}

	// Parse logs into structured table format
	parseLogsForTable(logText) {
		const lines = logText.split('\n');
		const tableData = [];
		let lineNumber = 0;
		let currentTestCase = '';

		lines.forEach(line => {
			lineNumber++;
			if (!line.trim()) return;

			// Extract basic log information
			const logInfo = this.extractLogInfo(line, lineNumber);
			if (!logInfo) return;

			// Track current test case
			if (logInfo.type === 'testcase') {
				currentTestCase = logInfo.content;
			}

			// Add test case context to all entries
			logInfo.testCase = currentTestCase;
			logInfo.originalLine = line;

			tableData.push(logInfo);
		});

		return tableData;
	}

	// Extract structured information from a log line
	extractLogInfo(line, lineNumber) {
		// Extract timestamp
		const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/);
		const timestamp = timestampMatch ? timestampMatch[1] : '';

		// Extract log level
		const levelMatch = line.match(/\[(INF|ERR|WAR|DEB)\]/);
		const level = levelMatch ? levelMatch[1] : '';

		// Extract component
		const componentMatch = line.match(/\[([^\]]+)\](?:\s*\[[^\]]*\])*\s*(.*)$/);
		const component = componentMatch ? componentMatch[1] : '';

		// Get the main content after prefixes
		let content = line.replace(/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[^[]*(?:\[[^\]]*\])*\s*/, '').trim();

		// Determine the type and extract relevant information
		let type = 'message';
		let operation = '';
		let status = '';
		let variable = '';
		let value = '';
		let jsonBody = '';
		let indentLevel = this.getIndentLevel(line);

		// Test Case detection
		const testCaseMatch = content.match(/Starting TestCase\s*['"]([^'"]+)['"]/);
		if (testCaseMatch) {
			type = 'testcase';
			operation = testCaseMatch[1];
			content = `Starting: ${testCaseMatch[1]}`;
		}
		// Operation with status
		else if (content.match(/^\[(Succeeded|Failed)\]/)) {
			const operationMatch = content.match(/^\[(Succeeded|Failed)\]\s*['"]([^'"]+)['"]/);
			if (operationMatch) {
				type = 'operation';
				status = operationMatch[1];
				operation = operationMatch[2];
				content = operation;
			}
		}
		// Buffer variable (handle Message: prefix)
		else if (content.includes('Buffer with name')) {
			const bufferMatch = content.match(/(?:Message:\s*)?Buffer with name[:\s]*['"]([^'"]*)['"]\s*has been set to value[:\s]*['"]([^'"]*)['"]/i);
			if (bufferMatch) {
				type = 'variable';
				variable = bufferMatch[1];
				value = bufferMatch[2];
				operation = `Set Buffer: ${variable}`;

				// Check if value is JSON
				if (this.isValidJSON(value)) {
					jsonBody = value;
				}
			}
		}
		// Message content
		else if (content.includes('Message:')) {
			const messageContent = content.replace(/.*Message:\s*/, '');
			type = 'message';
			content = messageContent;
			operation = messageContent;
		}
		// Duration entries
		else if (content.match(/\[DURATION:/)) {
			const durationMatch = content.match(/\[DURATION:\s*([^\]]+)\]/);
			if (durationMatch) {
				type = 'duration';
				operation = `Duration: ${durationMatch[1]}`;
				content = `Execution time: ${durationMatch[1]}`;
			}
		}

		// Clean up operation name for display
		if (!operation && content) {
			operation = content.length > 60 ? content.substring(0, 60) + '...' : content;
		}

		return {
			lineNumber,
			timestamp,
			level,
			component,
			type,
			operation,
			status,
			variable,
			value,
			jsonBody,
			indentLevel: Math.floor(indentLevel / 4), // Convert to levels
			content,
			testCase: ''
		};
	}

	// Check if table row matches search term
	matchesTableSearch(row, searchTerm) {
		const searchableFields = [
			row.operation,
			row.variable,
			row.value,
			row.testCase,
			row.content,
			row.level,
			row.status
		];

		return searchableFields.some(field =>
			field && field.toString().toLowerCase().includes(searchTerm)
		);
	}

	// Removed displayHierarchicalTable - using simple table view instead

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

	// Get indentation level from line
	getIndentLevel(line) {
		const match = line.match(/^(\s*)/);
		return match ? match[1].length : 0;
	}

	// Utility functions
	escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	escapeForJS(str) {
		return JSON.stringify(str).slice(1, -1);
	}

	// Removed old structured rendering methods - using simple table approach instead

	// Get variable type badge for table display
	getVariableTypeBadge(value) {
		const type = this.detectVariableType(value);
		const typeClass = this.getTypeClass(type);
		const typeLabel = this.getTypeLabel(type);
		return `<span class="type-badge ${typeClass}">${typeLabel}</span>`;
	}

	// Detect variable type (simplified version)
	detectVariableType(value) {
		if (!value || typeof value !== 'string') return 'Buffer Variable';

		if (this.isValidJSON(value)) return 'JSON';
		if (value.match(/^https?:\/\//)) return 'URL';
		if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) return 'ID';
		if (value.match(/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/)) return 'Timestamp';
		if (value.startsWith('ey') && value.length > 50) return 'Token';

		return 'Buffer Variable';
	}



	// Removed setupTableGroupToggles - using simple flat table structure

	// Removed duplicate matchesTableSearch method - using the one defined earlier
}

// Global function for JSON toggling in structured view
window.toggleStructuredJson = function (elementId) {
	const element = document.getElementById(elementId);
	const toggle = element?.previousElementSibling?.querySelector('.json-expand-icon');

	if (element && toggle) {
		if (element.style.display === 'none' || !element.style.display) {
			element.style.display = 'block';
			toggle.textContent = '▲';
		} else {
			element.style.display = 'none';
			toggle.textContent = '▼';
		}
	}
};

export default UIManager;