// Navigation functions

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

	updateTenants();
}

function updateTenants() {
	const envKey = document.getElementById('environment').value;
	const tenantSelect = document.getElementById('tenant');
	tenantSelect.innerHTML = '<option value="">-- Select Tenant --</option>';

	if (envKey && config.environments[envKey]) {
		for (const [key, tenant] of Object.entries(config.environments[envKey].tenants)) {
			const option = document.createElement('option');
			option.value = key;
			option.textContent = tenant.name;
			tenantSelect.appendChild(option);
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
		for (const [key, workspace] of Object.entries(config.environments[envKey].tenants[tenantKey].workspaces)) {
			const option = document.createElement('option');
			option.value = key;
			option.textContent = workspace.name;
			workspaceSelect.appendChild(option);
		}
	}

	updatePages();
}

function updatePages() {
	const envKey = document.getElementById('environment').value;
	const tenantKey = document.getElementById('tenant').value;
	const workspaceKey = document.getElementById('workspace').value;
	const pageSelect = document.getElementById('page');
	pageSelect.innerHTML = '<option value="">-- Default (Workspace Home) --</option>';

	if (envKey && tenantKey && workspaceKey &&
		config.environments[envKey]?.tenants[tenantKey]?.workspaces[workspaceKey]) {

		const pages = config.environments[envKey].tenants[tenantKey].workspaces[workspaceKey].pages;
		for (const [key, pageName] of Object.entries(pages)) {
			const option = document.createElement('option');
			option.value = key;
			option.textContent = pageName;
			pageSelect.appendChild(option);
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
		const pagePath = pageKey || '';
		const basePath = pageKey && workspaceKey.endsWith('/home') ? workspaceKey.replace('/home', '') : workspaceKey;
		fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${basePath}${pagePath}`;
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
		const pagePath = pageKey || '';
		const basePath = pageKey && workspaceKey.endsWith('/home') ? workspaceKey.replace('/home', '') : workspaceKey;
		fullUrl = `https://${tenantKey}.${envKey}.tricentis.com${basePath}${pagePath}`;
	} else {
		fullUrl = `https://${tenantKey}.${envKey}.tricentis.com`;
	}

	if (newTab) {
		window.open(fullUrl, '_blank');
	} else {
		window.location.href = fullUrl;
	}
}