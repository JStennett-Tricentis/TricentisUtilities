// Default configuration
let config = {
	environments: {
		"my-dev": {
			name: "Development",
			tenants: {
				"fusionx": {
					name: "FusionX",
					workspaces: {
						"/_portal/space/FusionX/home": {
							name: "FusionX Workspace",
							pages: {
								"/agents/all": "Agents (All)",
								"/reporting/create": "Create Report",
								"/settings": "Settings",
								"/projects": "Projects",
								"/executions": "Executions"
							}
						},
						"/_portal/space/Reporting/home": {
							name: "Reporting Workspace",
							pages: {
								"/dashboards": "Dashboards",
								"/reports": "Reports",
								"/analytics": "Analytics"
							}
						}
					}
				},
				"tricentis": {
					name: "Tricentis",
					workspaces: {
						"/_e2g/experimentalApis/swagger/index.html": {
							name: "E2G Swagger",
							pages: {}
						}
					}
				},
				"peregrineci": {
					name: "PeregrineCI",
					workspaces: {
						"/_inv/experimentalApis/swagger/index.html": {
							name: "INV Swagger",
							pages: {}
						}
					}
				}
			}
		},
		"my-test": {
			name: "Test",
			tenants: {
				"fusionx": {
					name: "FusionX",
					workspaces: {
						"/_portal/space/FusionX/home": {
							name: "FusionX Workspace",
							pages: {
								"/agents/all": "Agents (All)",
								"/reporting/create": "Create Report"
							}
						}
					}
				}
			}
		},
		"my": {
			name: "Production",
			tenants: {
				"fusionx": {
					name: "FusionX",
					workspaces: {
						"/_portal/space/FusionX/home": {
							name: "FusionX Workspace",
							pages: {
								"/agents/all": "Agents (All)"
							}
						}
					}
				}
			}
		}
	}
};

// Load config from localStorage or use default
function initConfig() {
	const saved = localStorage.getItem('tricentis-nav-config');
	if (saved) {
		try {
			config = JSON.parse(saved);
		} catch (e) {
			console.warn('Invalid saved config, using default');
		}
	}
	updateConfigDisplay();
	updateEnvironments();
}

// Save config to localStorage
function saveConfig() {
	localStorage.setItem('tricentis-nav-config', JSON.stringify(config));
}

// Configuration management functions
function updateConfigDisplay() {
	document.getElementById('configJson').value = JSON.stringify(config, null, 2);
	updateBookmarklet();
	renderConfigEditor();
}

function loadConfig() {
	try {
		const newConfig = JSON.parse(document.getElementById('configJson').value);
		config = newConfig;
		saveConfig();
		updateEnvironments();
		updateConfigDisplay();
		showStatus('Configuration loaded successfully!', 'success');
	} catch (e) {
		showStatus('Invalid JSON configuration: ' + e.message, 'error');
	}
}

function resetToDefault() {
	if (confirm('This will reset all configuration to default. Are you sure?')) {
		localStorage.removeItem('tricentis-nav-config');
		location.reload();
	}
}

function addEnvironment() {
	const name = document.getElementById('newEnvName').value.trim();
	const key = document.getElementById('newEnvKey').value.trim();

	if (!name || !key) {
		showStatus('Please enter both environment name and key', 'error');
		return;
	}

	if (config.environments[key]) {
		showStatus('Environment key already exists', 'error');
		return;
	}

	config.environments[key] = {
		name: name,
		tenants: {}
	};

	document.getElementById('newEnvName').value = '';
	document.getElementById('newEnvKey').value = '';

	saveConfig();
	updateEnvironments();
	updateConfigDisplay();
	showStatus(`Environment "${name}" added successfully!`, 'success');
}

function renderConfigEditor() {
	const editor = document.getElementById('configEditor');
	editor.innerHTML = '';

	for (const [envKey, env] of Object.entries(config.environments)) {
		const envDiv = document.createElement('div');
		envDiv.className = 'config-item';
		envDiv.innerHTML = `
            <div class="config-header">
                <span class="config-title">🌍 ${env.name} (${envKey})</span>
                <button class="btn-warning small-btn" onclick="deleteEnvironment('${envKey}')">Delete</button>
            </div>
            <div style="padding-left: 20px;">
                ${Object.keys(env.tenants).map(tenantKey =>
			`<div class="workspace-item">
                        <span>🏢 ${env.tenants[tenantKey].name} (${tenantKey})</span>
                        <button class="btn-warning small-btn" onclick="deleteTenant('${envKey}', '${tenantKey}')">Delete</button>
                    </div>`
		).join('')}
            </div>
        `;
		editor.appendChild(envDiv);
	}
}

function deleteEnvironment(envKey) {
	if (confirm(`Delete environment "${config.environments[envKey].name}"?`)) {
		delete config.environments[envKey];
		saveConfig();
		updateEnvironments();
		updateConfigDisplay();
		showStatus('Environment deleted', 'success');
	}
}

function deleteTenant(envKey, tenantKey) {
	if (confirm(`Delete tenant "${config.environments[envKey].tenants[tenantKey].name}"?`)) {
		delete config.environments[envKey].tenants[tenantKey];
		saveConfig();
		updateEnvironments();
		updateConfigDisplay();
		showStatus('Tenant deleted', 'success');
	}
}

function showStatus(message, type) {
	const status = document.getElementById('configStatus');
	status.innerHTML = `<div class="status-message ${type}">${message}</div>`;
	setTimeout(() => status.innerHTML = '', 3000);
}