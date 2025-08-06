// Main application initialization and event handlers

// Tab switching
function switchTab(tabName, event) {
	// Hide all tab contents
	document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
	document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

	// Show selected tab
	document.getElementById(tabName + '-tab').classList.add('active');
	if (event && event.target) {
		event.target.classList.add('active');
	}

	// Hide mobile menu after selection
	const tabs = document.querySelector('.tabs');
	if (tabs.classList.contains('show')) {
		tabs.classList.remove('show');
	}
}

// Mobile menu toggle
function toggleMenu() {
	const tabs = document.querySelector('.tabs');
	tabs.classList.toggle('show');
}

// Initialize the application
async function initApp() {
	// Initialize configuration (now async)
	await initConfig();

	// Set up event listeners
	setupEventListeners();

	// Populate tenant environment selector
	updateTenantEnvSelector();
}

function setupEventListeners() {
	// Navigation event listeners
	document.getElementById('environment').addEventListener('change', updateTenants);
	document.getElementById('tenant').addEventListener('change', updateWorkspaces);
	document.getElementById('workspace').addEventListener('change', updatePages);
	document.getElementById('page').addEventListener('change', updateUrlPreview);
	document.getElementById('customPath').addEventListener('input', updateUrlPreview);

	// Handle Enter key in custom path field
	document.getElementById('customPath').addEventListener('keypress', function (e) {
		if (e.key === 'Enter') {
			navigationToUrl();
		}
	});

	// Handle workspace type switching
	const typeSelect = document.getElementById('newUriType');
	if (typeSelect) {
		typeSelect.addEventListener('change', function () {
			const workspaceGroup = document.getElementById('workspaceNameGroup');
			const customGroup = document.getElementById('customPathGroup');

			if (this.value === 'portal') {
				workspaceGroup.style.display = 'block';
				customGroup.style.display = 'none';
			} else {
				workspaceGroup.style.display = 'none';
				customGroup.style.display = 'block';
			}
		});
	}
}

function updateTenantEnvSelector() {
	const select = document.getElementById('tenantEnvSelect');
	if (select) {
		select.innerHTML = '<option value="">-- Select Environment --</option>';
		for (const [key, env] of Object.entries(config.environments)) {
			const option = document.createElement('option');
			option.value = key;
			option.textContent = env.name;
			select.appendChild(option);
		}
	}
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function () {
	await initApp();
});

// Export functions for global use
window.switchTab = switchTab;
window.navigationToUrl = navigationToUrl;
window.updateTenants = updateTenants;
window.updateWorkspaces = updateWorkspaces;
window.updatePages = updatePages;
window.updateUrlPreview = updateUrlPreview;
window.loadConfig = loadConfig;
window.resetToDefault = resetToDefault;
window.addEnvironment = addEnvironment;
window.addTenant = addTenant;
window.addSharedUri = addSharedUri;
window.addWorkspaceToTenant = addWorkspaceToTenant;
window.removeWorkspaceFromTenant = removeWorkspaceFromTenant;
window.deleteEnvironment = deleteEnvironment;
window.deleteTenant = deleteTenant;
window.deleteSharedUri = deleteSharedUri;
window.showWorkspaceManager = showWorkspaceManager;
window.editWorkspace = editWorkspace;
window.saveWorkspaceEdit = saveWorkspaceEdit;
window.openJiraTicket = openJiraTicket;
window.handleJiraEnter = handleJiraEnter;
window.loadSelectedConfigFile = loadSelectedConfigFile;