// Navigation functions

// Auto-populate from current URL if on Tricentis domain
function autoPopulateFromCurrentUrl() {
	const currentUrl = window.location.href;
	const tricentisMatch = currentUrl.match(/https:\/\/([^.]+)\.([^.]+)\.tricentis\.com/);
	
	if (tricentisMatch) {
		const tenant = tricentisMatch[1];
		const environment = tricentisMatch[2];
		
		// Try to find matching environment
		const envSelect = document.getElementById('environment');
		for (let option of envSelect.options) {
			if (option.value === environment) {
				envSelect.value = environment;
				updateTenants();
				break;
			}
		}
		
		// Try to find matching tenant
		setTimeout(() => {
			const tenantSelect = document.getElementById('tenant');
			for (let option of tenantSelect.options) {
				if (option.value === tenant) {
					tenantSelect.value = tenant;
					updateWorkspaces();
					break;
				}
			}
			
			// Auto-populate workspace from URL path
			setTimeout(() => {
				const pathMatch = currentUrl.match(/\/_portal\/space\/([^\/\?]+)/);
				if (pathMatch) {
					const workspaceName = pathMatch[1];
					const workspaceSelect = document.getElementById('workspace');
					for (let option of workspaceSelect.options) {
						if (option.textContent === workspaceName || option.value === workspaceName) {
							workspaceSelect.value = option.value;
							updatePages();
							break;
						}
					}
				}
			}, 100);
		}, 100);
	}
}

// Update all dropdowns
function updateEnvironments() {
	const envSelect = document.getElementById('environment');
	envSelect.innerHTML = '<option value="">-- Select Environment --</option>';

	for (const [key, env] of Object.entries(config.environments)) {
		const option = document.createElement('option');
		option.value = key;
		option.textContent = env.name;
		envSelect.appendChild(option);
	}

	// Auto-populate if on Tricentis domain
	autoPopulateFromCurrentUrl();
	
	updateTenants();
}

function updateTenants() {
	const envKey = document.getElementById('environment').value;
	const tenantSelect = document.getElementById('tenant');
	tenantSelect.innerHTML = '<option value="">-- Select Tenant --</option>';

	if (envKey && config.environments[envKey]) {
		let fusionxFound = false;
		
		for (const [key, tenant] of Object.entries(config.environments[envKey].tenants)) {
			const option = document.createElement('option');
			option.value = key;
			option.textContent = tenant.name;
			tenantSelect.appendChild(option);
			
			// Check if this is FusionX tenant
			if (tenant.name === 'FusionX' || key === 'fusionx') {
				fusionxFound = true;
			}
		}
		
		// Auto-select FusionX if available and no current selection
		if (fusionxFound && !tenantSelect.value) {
			for (let option of tenantSelect.options) {
				if (option.textContent === 'FusionX' || option.value === 'fusionx') {
					tenantSelect.value = option.value;
					break;
				}
			}
		}
	}

	updateWorkspaces();
}

function updateWorkspaces() {
	const envKey = document.getElementById('environment').value;
	const tenantKey = document.getElementById('tenant').value;
	const workspaceSelect = document.getElementById('workspace');
	workspaceSelect.innerHTML = '<option value="">-- Select Workspace --</option>';

	if (envKey && tenantKey && config.environments[envKey]?.tenants[tenantKey]) {
		const workspaceNames = config.environments[envKey].tenants[tenantKey].workspaces;
		let fusionxFound = false;
		
		for (const workspaceName of workspaceNames) {
			// Look for matching workspace in sharedUris - check direct key match first, then workspace property, then name
			let workspaceKey = null;
			let workspace = null;
			
			// First check if workspaceName is directly a key in sharedUris.workspaces
			if (config.sharedUris.workspaces[workspaceName]) {
				workspaceKey = workspaceName;
				workspace = config.sharedUris.workspaces[workspaceName];
			} else {
				// If not, look for matching workspace property or name
				workspaceKey = Object.keys(config.sharedUris.workspaces).find(key => 
					config.sharedUris.workspaces[key].workspace === workspaceName || 
					config.sharedUris.workspaces[key].name === workspaceName
				);
				if (workspaceKey) {
					workspace = config.sharedUris.workspaces[workspaceKey];
				}
			}
			
			if (workspace) {
				const option = document.createElement('option');
				option.value = workspaceKey;
				option.textContent = workspace.name;
				workspaceSelect.appendChild(option);
				
				// Check if this is FusionX
				if (workspace.name === 'FusionX' || workspaceName === 'FusionX') {
					fusionxFound = true;
				}
			} else {
				// If no matching workspace found in sharedUris, create a basic portal option
				const option = document.createElement('option');
				option.value = workspaceName;
				option.textContent = workspaceName;
				workspaceSelect.appendChild(option);
				
				// Check if this is FusionX
				if (workspaceName === 'FusionX') {
					fusionxFound = true;
				}
			}
		}
		
		// Auto-select FusionX if available and no current selection
		if (fusionxFound && !workspaceSelect.value) {
			for (let option of workspaceSelect.options) {
				if (option.textContent === 'FusionX') {
					workspaceSelect.value = option.value;
					break;
				}
			}
		}
	}

	updatePages();
}

function updatePages() {
	const workspaceKey = document.getElementById('workspace').value;
	const pageSelect = document.getElementById('page');
	pageSelect.innerHTML = '<option value="">-- Select Page --</option>';

	if (workspaceKey && config.sharedUris.workspaces[workspaceKey]) {
		const workspace = config.sharedUris.workspaces[workspaceKey];
		
		// For portal workspaces, show universal pages
		if (workspace.type === 'portal' && config.sharedUris.pages) {
			for (const [pageKey, pageName] of Object.entries(config.sharedUris.pages)) {
				const option = document.createElement('option');
				option.value = pageKey;
				option.textContent = pageName;
				pageSelect.appendChild(option);
			}
		}
		// For swagger workspaces, show swagger endpoints
		else if (workspace.type === 'swagger' && config.sharedUris.swaggerPages) {
			for (const [swaggerPath, swaggerName] of Object.entries(config.sharedUris.swaggerPages)) {
				const option = document.createElement('option');
				option.value = swaggerPath;
				option.textContent = swaggerName;
				pageSelect.appendChild(option);
			}
		}
		// For custom workspaces, no additional pages (they're direct links)
	} else if (workspaceKey) {
		// Handle workspaces not in sharedUris (basic portal workspaces)
		if (config.sharedUris.pages) {
			for (const [pageKey, pageName] of Object.entries(config.sharedUris.pages)) {
				const option = document.createElement('option');
				option.value = pageKey;
				option.textContent = pageName;
				pageSelect.appendChild(option);
			}
		}
	}

	updateUrlPreview();
}

function updateUrlPreview() {
	const envKey = document.getElementById('environment').value;
	const tenantKey = document.getElementById('tenant').value;
	const workspaceKey = document.getElementById('workspace').value;
	const pageKey = document.getElementById('page').value;
	const customPath = document.getElementById('customPath').value.trim();

	if (!envKey || !tenantKey) {
		document.getElementById('urlPreview').textContent = 'URL Preview: Select environment and tenant';
		return;
	}

	let fullUrl = '';

	if (customPath) {
		fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${customPath}`;
	} else if (workspaceKey) {
		const workspace = config.sharedUris.workspaces[workspaceKey];
		
		if (workspace) {
			// Found workspace in sharedUris
			if (workspace.type === 'portal') {
				// Portal workspace: /_portal/space/{WorkspaceName}{/page}
				const basePath = `/_portal/space/${workspace.workspace}`;
				const pagePath = pageKey || '';
				fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${basePath}${pagePath}`;
			} else if (workspace.type === 'swagger') {
				// Swagger workspace: direct path from pageKey (which contains the full swagger path)
				if (pageKey) {
					fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${pageKey}`;
				} else {
					fullUrl = `https://${tenantKey}.${envKey}.tricentis.com`;
				}
			} else {
				// Custom workspace: direct path (no additional pages)
				fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${workspace.path}`;
			}
		} else {
			// Basic portal workspace (just workspace name)
			const basePath = `/_portal/space/${workspaceKey}`;
			const pagePath = pageKey || '';
			fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${basePath}${pagePath}`;
		}
	} else {
		fullUrl = `https://${tenantKey}.${envKey}.tricentis.com`;
	}

	document.getElementById('urlPreview').textContent = `URL Preview: ${fullUrl}`;
}

function navigateToUrl(newTab = false) {
	const envKey = document.getElementById('environment').value;
	const tenantKey = document.getElementById('tenant').value;
	const workspaceKey = document.getElementById('workspace').value;
	const pageKey = document.getElementById('page').value;
	const customPath = document.getElementById('customPath').value.trim();

	if (!envKey || !tenantKey) {
		alert('Please select an environment and tenant');
		return;
	}

	let fullUrl = '';

	if (customPath) {
		fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${customPath}`;
	} else if (workspaceKey) {
		const workspace = config.sharedUris.workspaces[workspaceKey];
		
		if (workspace) {
			// Found workspace in sharedUris
			if (workspace.type === 'portal') {
				// Portal workspace: /_portal/space/{WorkspaceName}{/page}
				const basePath = `/_portal/space/${workspace.workspace}`;
				const pagePath = pageKey || '';
				fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${basePath}${pagePath}`;
			} else if (workspace.type === 'swagger') {
				// Swagger workspace: direct path from pageKey (which contains the full swagger path)
				if (pageKey) {
					fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${pageKey}`;
				} else {
					fullUrl = `https://${tenantKey}.${envKey}.tricentis.com`;
				}
			} else {
				// Custom workspace: direct path (no additional pages)
				fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${workspace.path}`;
			}
		} else {
			// Basic portal workspace (just workspace name)
			const basePath = `/_portal/space/${workspaceKey}`;
			const pagePath = pageKey || '';
			fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${basePath}${pagePath}`;
		}
	} else {
		fullUrl = `https://${tenantKey}.${envKey}.tricentis.com`;
	}

	if (newTab) {
		window.open(fullUrl, '_blank');
	} else {
		window.location.href = fullUrl;
	}
}

// JIRA Functions
function openJiraTicket(newTab = false) {
	const ticketInput = document.getElementById('jiraTicket').value.trim();
	
	if (!ticketInput) {
		alert('Please enter a ticket number or ID');
		return;
	}
	
	// Check if it's already a full ticket ID or just a number
	const url = isNaN(ticketInput) ? ticketInput : 'TPI-' + ticketInput;
	const fullUrl = `https://tricentis.atlassian.net/browse/${url}`;
	
	if (newTab) {
		window.open(fullUrl, '_blank');
	} else {
		window.location.href = fullUrl;
	}
}

function handleJiraEnter(event) {
	if (event.key === 'Enter') {
		openJiraTicket();
	}
}