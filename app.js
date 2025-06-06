// Main application initialization and event handlers

// Tab switching
function switchTab(tabName) {
	// Hide all tab contents
	document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
	document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

	// Show selected tab
	document.getElementById(tabName + '-tab').classList.add('active');
	event.target.classList.add('active');
}

// Initialize the application
function initApp() {
	// Initialize configuration
	initConfig();

	// Set up event listeners
	setupEventListeners();
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
			navigateToUrl();
		}
	});
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
	initApp();
});

// Export functions for global use
window.switchTab = switchTab;
window.navigateToUrl = navigateToUrl;
window.updateTenants = updateTenants;
window.updateWorkspaces = updateWorkspaces;
window.updatePages = updatePages;
window.updateUrlPreview = updateUrlPreview;
window.loadConfig = loadConfig;
window.resetToDefault = resetToDefault;
window.addEnvironment = addEnvironment;
window.deleteEnvironment = deleteEnvironment;
window.deleteTenant = deleteTenant;