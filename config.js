// Default configuration
let config = {
	// Shared URI library - reusable across different combinations
	sharedUris: {
		workspaces: {
			"fusionx": {
				name: "FusionX",
				type: "portal", // portal, swagger, admin, custom
				workspace: "FusionX" // Used in /_portal/space/{workspace}/
			},
			"reporting": {
				name: "Reporting",
				type: "portal",
				workspace: "Reporting"
			},
			"api-simulator": {
				name: "API Simulator", 
				type: "portal",
				workspace: "APISimulator"
			},
			"e2g-swagger": {
				name: "E2G Swagger API",
				type: "custom",
				path: "/_e2g/experimentalApis/swagger/index.html"
			},
			"inv-swagger": {
				name: "INV Swagger API",
				type: "custom", 
				path: "/_inv/experimentalApis/swagger/index.html"
			},
			"admin-panel": {
				name: "Admin Panel",
				type: "custom",
				path: "/_admin/dashboard"
			},
			"portal-home": {
				name: "Portal Home",
				type: "custom",
				path: "/_portal/home"
			},
			"test-management": {
				name: "Test Management",
				type: "portal",
				workspace: "TestManagement"
			},
			"ci-cd-dashboard": {
				name: "CI/CD Dashboard", 
				type: "portal",
				workspace: "CICD"
			}
		},
		// Universal pages that work with any portal workspace
		pages: {
			"": "Home",
			"/dashboard": "Dashboard",
			"/agents/all": "Agents (All)",
			"/reporting/create": "Create Report", 
			"/settings": "Settings",
			"/projects": "Projects",
			"/executions": "Executions",
			"/dashboards": "Dashboards",
			"/reports": "Reports",
			"/analytics": "Analytics",
			"/simulator": "API Simulator",
			"/endpoints": "Manage Endpoints",
			"/logs": "Request Logs",
			"/testcases": "Test Cases",
			"/testsuites": "Test Suites",
			"/results": "Test Results",
			"/pipelines": "Pipelines",
			"/builds": "Build History",
			"/deployments": "Deployments",
			"/profile": "User Profile",
			"/notifications": "Notifications"
		}
	},

	// Environment/Tenant/Workspace combinations
	environments: {
		"my-dev": {
			name: "Development",
			tenants: {
				"fusionx": {
					name: "FusionX",
					workspaces: ["fusionx", "reporting", "api-simulator"]
				},
				"tricentis": {
					name: "Tricentis",
					workspaces: ["e2g-swagger", "inv-swagger", "admin-panel", "portal-home"]
				}
			}
		},
		"my-test": {
			name: "Staging",
			tenants: {
				"fusionx": {
					name: "FusionX",
					workspaces: ["fusionx", "reporting", "api-simulator"]
				},
				"tricentis": {
					name: "Tricentis",
					workspaces: ["e2g-swagger", "admin-panel", "test-management"]
				}
			}
		},
		"my": {
			name: "Production",
			tenants: {
				"fusionx": {
					name: "FusionX",
					workspaces: ["fusionx", "reporting"]
				},
				"tricentis": {
					name: "Tricentis",
					workspaces: ["portal-home", "admin-panel"]
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
			const parsedConfig = JSON.parse(saved);
			// Validate config structure
			if (parsedConfig && parsedConfig.sharedUris && parsedConfig.environments) {
				config = parsedConfig;
			} else {
				console.warn('Invalid saved config structure, using default');
			}
		} catch (e) {
			console.warn('Invalid saved config JSON, using default');
		}
	}
	updateConfigDisplay();
	// Call updateEnvironments if it exists (from navigation.js)
	if (typeof updateEnvironments === 'function') {
		updateEnvironments();
	}
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
	updateTenantEnvSelector();
}

function loadConfig() {
	try {
		const newConfig = JSON.parse(document.getElementById('configJson').value);
		config = newConfig;
		saveConfig();
		if (typeof updateEnvironments === 'function') {
			updateEnvironments();
		}
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
	if (typeof updateEnvironments === 'function') {
		updateEnvironments();
	}
	updateConfigDisplay();
	showStatus(`Environment "${name}" added successfully!`, 'success');
}

function addTenant() {
	const envKey = document.getElementById('tenantEnvSelect').value;
	const name = document.getElementById('newTenantName').value.trim();
	const key = document.getElementById('newTenantKey').value.trim();

	if (!envKey || !name || !key) {
		showStatus('Please select environment and enter tenant name and key', 'error');
		return;
	}

	if (config.environments[envKey].tenants[key]) {
		showStatus('Tenant key already exists in this environment', 'error');
		return;
	}

	config.environments[envKey].tenants[key] = {
		name: name,
		workspaces: []
	};

	document.getElementById('newTenantName').value = '';
	document.getElementById('newTenantKey').value = '';

	saveConfig();
	if (typeof updateEnvironments === 'function') {
		updateEnvironments();
	}
	updateConfigDisplay();
	showStatus(`Tenant "${name}" added to ${config.environments[envKey].name}!`, 'success');
}

function addSharedUri() {
	const name = document.getElementById('newUriName').value.trim();
	const key = document.getElementById('newUriKey').value.trim();
	const type = document.getElementById('newUriType').value;
	const workspace = document.getElementById('newUriWorkspace').value.trim();
	const path = document.getElementById('newUriPath').value.trim();

	if (!name || !key) {
		showStatus('Please enter workspace name and key', 'error');
		return;
	}

	if (type === 'portal' && !workspace) {
		showStatus('Please enter portal workspace name', 'error');
		return;
	}

	if (type === 'custom' && !path) {
		showStatus('Please enter custom path', 'error');
		return;
	}

	if (config.sharedUris.workspaces[key]) {
		showStatus('Workspace key already exists', 'error');
		return;
	}

	const newWorkspace = {
		name: name,
		type: type
	};

	if (type === 'portal') {
		newWorkspace.workspace = workspace;
	} else {
		newWorkspace.path = path;
	}

	config.sharedUris.workspaces[key] = newWorkspace;

	document.getElementById('newUriName').value = '';
	document.getElementById('newUriKey').value = '';
	document.getElementById('newUriWorkspace').value = '';
	document.getElementById('newUriPath').value = '';

	saveConfig();
	updateConfigDisplay();
	showStatus(`Workspace "${name}" added successfully!`, 'success');
}

function addWorkspaceToTenant(envKey, tenantKey, workspaceKey) {
	if (!config.environments[envKey].tenants[tenantKey].workspaces.includes(workspaceKey)) {
		config.environments[envKey].tenants[tenantKey].workspaces.push(workspaceKey);
		saveConfig();
		if (typeof updateEnvironments === 'function') {
			updateEnvironments();
		}
		updateConfigDisplay();
		showStatus('Workspace added to tenant!', 'success');
	} else {
		showStatus('Workspace already exists for this tenant', 'error');
	}
}

function removeWorkspaceFromTenant(envKey, tenantKey, workspaceKey) {
	const workspaces = config.environments[envKey].tenants[tenantKey].workspaces;
	const index = workspaces.indexOf(workspaceKey);
	if (index > -1) {
		workspaces.splice(index, 1);
		saveConfig();
		if (typeof updateEnvironments === 'function') {
			updateEnvironments();
		}
		updateConfigDisplay();
		showStatus('Workspace removed from tenant!', 'success');
	}
}

function renderConfigEditor() {
	const editor = document.getElementById('configEditor');
	
	// Ensure config has required structure
	if (!config || !config.sharedUris || !config.environments) {
		editor.innerHTML = '<div style="color: red;">Error: Invalid configuration structure</div>';
		return;
	}
	
	editor.innerHTML = `
        <div class="config-section">
            <h4>🌐 Shared Workspace Library</h4>
            <div style="margin-bottom: 20px;">
                ${Object.entries(config.sharedUris.workspaces).map(([key, workspace]) =>
		`<div class="workspace-item">
                        <div>
                            <strong>${workspace.name}</strong> (${key})<br>
                            <small style="color: #6c757d;">
                                ${workspace.type === 'portal' 
                                    ? `Portal: /_portal/space/${workspace.workspace}/` 
                                    : `Custom: ${workspace.path}`}
                            </small>
                        </div>
                        <div>
                            <button class="btn-info small-btn" onclick="editWorkspace('${key}')">Edit</button>
                            <button class="btn-warning small-btn" onclick="deleteSharedUri('${key}')">Delete</button>
                        </div>
                    </div>`
	).join('')}
            </div>
        </div>

        <div class="config-section">
            <h4>🏢 Environment/Tenant Assignments</h4>
            ${Object.entries(config.environments).map(([envKey, env]) => `
                <div class="config-item">
                    <div class="config-header">
                        <span class="config-title">🌍 ${env.name} (${envKey})</span>
                        <button class="btn-warning small-btn" onclick="deleteEnvironment('${envKey}')">Delete Env</button>
                    </div>
                    <div style="padding-left: 20px;">
                        ${Object.entries(env.tenants).map(([tenantKey, tenant]) => `
                            <div class="tenant-item" style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                                <div class="config-header">
                                    <span>🏢 ${tenant.name} (${tenantKey})</span>
                                    <div>
                                        <button class="btn-info small-btn" onclick="showWorkspaceManager('${envKey}', '${tenantKey}')">Manage Workspaces</button>
                                        <button class="btn-warning small-btn" onclick="deleteTenant('${envKey}', '${tenantKey}')">Delete</button>
                                    </div>
                                </div>
                                <div style="margin-top: 10px;">
                                    <strong>Workspaces:</strong>
                                    ${tenant.workspaces.length ? tenant.workspaces.map(wsKey =>
		`<span class="workspace-tag" style="display: inline-block; background: #e9ecef; padding: 2px 8px; margin: 2px; border-radius: 3px; font-size: 12px;">
                                            ${config.sharedUris.workspaces[wsKey]?.name || wsKey}
                                        </span>`
	).join('') : '<em style="color: #6c757d;">No workspaces assigned</em>'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function showWorkspaceManager(envKey, tenantKey) {
	const tenant = config.environments[envKey].tenants[tenantKey];
	const availableWorkspaces = Object.entries(config.sharedUris.workspaces)
		.filter(([key]) => !tenant.workspaces.includes(key));

	const popup = document.createElement('div');
	popup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 999999; display: flex;
        align-items: center; justify-content: center;
    `;

	popup.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; width: 700px; max-width: 95vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #e1e8ed; padding-bottom: 15px;">
                <h3 style="margin: 0; color: #2c3e50; font-size: 1.4em;">🔧 Manage Workspaces</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()"
                        style="padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">✕</button>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #667eea;">
                <strong style="color: #2c3e50;">Environment:</strong> ${config.environments[envKey].name}<br>
                <strong style="color: #2c3e50;">Tenant:</strong> ${tenant.name}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                <div>
                    <h4 style="margin: 0 0 15px 0; color: #2c3e50; display: flex; align-items: center;">
                        ✅ Currently Assigned (${tenant.workspaces.length})
                    </h4>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e1e8ed; border-radius: 6px; padding: 10px; background: white;">
                        ${tenant.workspaces.length ? tenant.workspaces.map(wsKey => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e9ecef; margin: 8px 0; border-radius: 6px; background: #f8f9fa;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #2c3e50;">${config.sharedUris.workspaces[wsKey]?.name || wsKey}</div>
                                    <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">${config.sharedUris.workspaces[wsKey]?.path || ''}</div>
                                </div>
                                <button onclick="removeWorkspaceFromTenant('${envKey}', '${tenantKey}', '${wsKey}'); this.parentElement.remove();"
                                        style="padding: 6px 12px; background: #f093fb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 10px; transition: all 0.2s;">
                                    🗑️ Remove
                                </button>
                            </div>
                        `).join('') : '<div style="text-align: center; color: #6c757d; padding: 20px; font-style: italic;">No workspaces assigned yet</div>'}
                    </div>
                </div>

                <div>
                    <h4 style="margin: 0 0 15px 0; color: #2c3e50; display: flex; align-items: center;">
                        ➕ Available to Add (${availableWorkspaces.length})
                    </h4>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e1e8ed; border-radius: 6px; padding: 10px; background: white;">
                        ${availableWorkspaces.length ? availableWorkspaces.map(([wsKey, workspace]) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e9ecef; margin: 8px 0; border-radius: 6px; background: #fff;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #2c3e50;">${workspace.name}</div>
                                    <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">${workspace.path}</div>
                                    <div style="font-size: 11px; color: #495057; margin-top: 2px;">
                                        ${Object.keys(workspace.pages).length} page${Object.keys(workspace.pages).length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                <button onclick="addWorkspaceToTenant('${envKey}', '${tenantKey}', '${wsKey}'); this.parentElement.remove();"
                                        style="padding: 6px 12px; background: #38ef7d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 10px; transition: all 0.2s;">
                                    ➕ Add
                                </button>
                            </div>
                        `).join('') : '<div style="text-align: center; color: #6c757d; padding: 20px; font-style: italic;">All workspaces are already assigned</div>'}
                    </div>
                </div>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e1e8ed; text-align: center;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()"
                        style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
                    ✅ Done
                </button>
            </div>
        </div>
    `;

	document.body.appendChild(popup);
	popup.onclick = (e) => { if (e.target === popup) popup.remove(); };
}

function deleteSharedUri(uriKey) {
	if (confirm(`Delete shared URI "${config.sharedUris.workspaces[uriKey].name}"? This will remove it from all tenant assignments.`)) {
		// Remove from all tenant assignments
		Object.values(config.environments).forEach(env => {
			Object.values(env.tenants).forEach(tenant => {
				const index = tenant.workspaces.indexOf(uriKey);
				if (index > -1) {
					tenant.workspaces.splice(index, 1);
				}
			});
		});

		// Remove from shared URIs
		delete config.sharedUris.workspaces[uriKey];

		saveConfig();
		if (typeof updateEnvironments === 'function') {
			updateEnvironments();
		}
		updateConfigDisplay();
		showStatus('Shared URI deleted and removed from all assignments', 'success');
	}
}

function deleteEnvironment(envKey) {
	if (confirm(`Delete environment "${config.environments[envKey].name}"?`)) {
		delete config.environments[envKey];
		saveConfig();
		if (typeof updateEnvironments === 'function') {
			updateEnvironments();
		}
		updateConfigDisplay();
		showStatus('Environment deleted', 'success');
	}
}

function deleteTenant(envKey, tenantKey) {
	if (confirm(`Delete tenant "${config.environments[envKey].tenants[tenantKey].name}"?`)) {
		delete config.environments[envKey].tenants[tenantKey];
		saveConfig();
		if (typeof updateEnvironments === 'function') {
			updateEnvironments();
		}
		updateConfigDisplay();
		showStatus('Tenant deleted', 'success');
	}
}

function editWorkspace(workspaceKey) {
	const workspace = config.sharedUris.workspaces[workspaceKey];
	if (!workspace) return;

	const popup = document.createElement('div');
	popup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 999999; display: flex;
        align-items: center; justify-content: center;
    `;

	popup.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; width: 500px; max-width: 90vw;">
            <h3 style="margin: 0 0 20px 0;">Edit Workspace: ${workspace.name}</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Name:</label>
                <input type="text" id="editName" value="${workspace.name}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Type:</label>
                <select id="editType" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="portal" ${workspace.type === 'portal' ? 'selected' : ''}>Portal Workspace</option>
                    <option value="custom" ${workspace.type === 'custom' ? 'selected' : ''}>Custom Path</option>
                </select>
            </div>
            
            <div id="editWorkspaceGroup" style="margin-bottom: 15px; ${workspace.type !== 'portal' ? 'display: none;' : ''}">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Portal Workspace Name:</label>
                <input type="text" id="editWorkspace" value="${workspace.workspace || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div id="editPathGroup" style="margin-bottom: 15px; ${workspace.type !== 'custom' ? 'display: none;' : ''}">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Custom Path:</label>
                <input type="text" id="editPath" value="${workspace.path || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="saveWorkspaceEdit('${workspaceKey}'); this.parentElement.parentElement.parentElement.remove();"
                        style="flex: 1; padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Save Changes
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()"
                        style="flex: 1; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Cancel
                </button>
            </div>
        </div>
    `;

	document.body.appendChild(popup);
	popup.onclick = (e) => { if (e.target === popup) popup.remove(); };

	// Add type switching logic
	document.getElementById('editType').onchange = function() {
		const workspaceGroup = document.getElementById('editWorkspaceGroup');
		const pathGroup = document.getElementById('editPathGroup');
		
		if (this.value === 'portal') {
			workspaceGroup.style.display = 'block';
			pathGroup.style.display = 'none';
		} else {
			workspaceGroup.style.display = 'none';
			pathGroup.style.display = 'block';
		}
	};
}

function saveWorkspaceEdit(workspaceKey) {
	const name = document.getElementById('editName').value.trim();
	const type = document.getElementById('editType').value;
	const workspace = document.getElementById('editWorkspace').value.trim();
	const path = document.getElementById('editPath').value.trim();

	if (!name) {
		alert('Please enter a workspace name');
		return;
	}

	if (type === 'portal' && !workspace) {
		alert('Please enter portal workspace name');
		return;
	}

	if (type === 'custom' && !path) {
		alert('Please enter custom path');
		return;
	}

	const updatedWorkspace = {
		name: name,
		type: type
	};

	if (type === 'portal') {
		updatedWorkspace.workspace = workspace;
	} else {
		updatedWorkspace.path = path;
	}

	config.sharedUris.workspaces[workspaceKey] = updatedWorkspace;
	saveConfig();
	if (typeof updateEnvironments === 'function') {
		updateEnvironments();
	}
	updateConfigDisplay();
	showStatus(`Workspace "${name}" updated successfully!`, 'success');
}

function showStatus(message, type) {
	const status = document.getElementById('configStatus');
	status.innerHTML = `<div class="status-message ${type}">${message}</div>`;
	setTimeout(() => status.innerHTML = '', 3000);
}