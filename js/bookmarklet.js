// Bookmarklet generation and management

// Bookmarklet generation and management

function updateBookmarklet() {
	const configStr = JSON.stringify(config).replace(/'/g, "\\'");
	const bookmarkletCode = `
        (function() {
            if (document.getElementById('tricentis-nav-overlay')) return;

            const config = ${configStr};

            const overlay = document.createElement('div');
            overlay.id = 'tricentis-nav-overlay';
            overlay.style.cssText = \`
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); z-index: 999999; display: flex;
                align-items: center; justify-content: center;
            \`;

            const popup = document.createElement('div');
            popup.style.cssText = \`
                background: white !important;
                padding: 30px;
                border-radius: 12px;
                width: 600px;
                max-width: 90vw;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                color: #333 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            \`;

            const envOptions = Object.entries(config.environments).map(([key, env]) =>
                \`<option value="\${key}">\${env.name}</option>\`).join('');

            popup.innerHTML = \`
                <div style="display: flex; align-items: center; margin: 0 0 20px 0;">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiByeD0iNCIgZmlsbD0iIzJjM2U1MCIvPgo8dGV4dCB4PSI1IiB5PSIxOSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPlQ8L3RleHQ+Cjx0ZXh0IHg9IjE1IiB5PSIxOSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjdlZWEiPk48L3RleHQ+Cjwvc3ZnPgo="
                         style="width: 28px; height: 28px; margin-right: 10px; border-radius: 4px;"
                         alt="Tosca Cloud">
                    <h2 style="margin: 0; color: #2c3e50 !important;">Tosca Cloud/Swagger Quick Navigation</h2>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333 !important;">Environment:</label>
                        <select id="quickEnv" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; color: #333 !important; background: white !important;">
                            <option value="">Select...</option>
                            \${envOptions}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333 !important;">Tenant:</label>
                        <select id="quickTenant" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; color: #333 !important; background: white !important;">
                            <option value="">Select...</option>
                        </select>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333 !important;">Workspace:</label>
                        <select id="quickWorkspace" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; color: #333 !important; background: white !important;">
                            <option value="">Select...</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333 !important;">Page:</label>
                        <select id="quickPage" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; color: #333 !important; background: white !important;">
                            <option value="">Default</option>
                        </select>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="document.getElementById('tricentis-nav-overlay').remove()"
                            style="padding: 10px 15px; background: #6c757d; color: white !important; border: none; border-radius: 4px; cursor: pointer;">
                        ✕
                    </button>
                    <button id="currentTabBtn" style="flex: 1; padding: 10px; background: #11998e; color: white !important; border: none; border-radius: 4px; cursor: pointer;">
                        🔗 Current Tab
                    </button>
                    <button id="newTabBtn" style="flex: 1; padding: 10px; background: #667eea; color: white !important; border: none; border-radius: 4px; cursor: pointer;">
                        🆕 New Tab
                    </button>
                </div>
            \`;

            overlay.appendChild(popup);
            document.body.appendChild(overlay);

            // Add event listeners
            const envSelect = document.getElementById('quickEnv');
            const tenantSelect = document.getElementById('quickTenant');
            const workspaceSelect = document.getElementById('quickWorkspace');
            const pageSelect = document.getElementById('quickPage');

            // Auto-populate from current URL if on Tosca Cloud domain
            function autoPopulateBookmarklet() {
                const currentUrl = window.location.href;
                const tricentisMatch = currentUrl.match(/https:\\/\\/([^.]+)\\.([^.]+)\\.tricentis\\.com/);

                if (tricentisMatch) {
                    const tenant = tricentisMatch[1];
                    const environment = tricentisMatch[2];

                    // Try to set environment
                    for (let option of envSelect.options) {
                        if (option.value === environment) {
                            envSelect.value = environment;
                            envSelect.onchange();
                            break;
                        }
                    }

                    // Try to set tenant after a brief delay
                    setTimeout(() => {
                        for (let option of tenantSelect.options) {
                            if (option.value === tenant) {
                                tenantSelect.value = tenant;
                                tenantSelect.onchange();
                                break;
                            }
                        }

                        // Try to set workspace from URL path
                        setTimeout(() => {
                            const pathMatch = currentUrl.match(/\\/_portal\\/space\\/([^\\/\\?]+)/);
                            if (pathMatch) {
                                const workspaceName = pathMatch[1];
                                for (let option of workspaceSelect.options) {
                                    if (option.textContent === workspaceName || option.value === workspaceName) {
                                        workspaceSelect.value = option.value;
                                        workspaceSelect.onchange();
                                        break;
                                    }
                                }
                            }
                        }, 100);
                    }, 100);
                }
            }

            // Call auto-populate after a brief delay to let the DOM settle
            setTimeout(autoPopulateBookmarklet, 150);

            envSelect.onchange = function() {
                const envKey = this.value;
                tenantSelect.innerHTML = '<option value="">Select...</option>';
                workspaceSelect.innerHTML = '<option value="">Select...</option>';
                pageSelect.innerHTML = '<option value="">Default</option>';
                if (envKey && config.environments[envKey]) {
                    let fusionxFound = false;

                    Object.entries(config.environments[envKey].tenants).forEach(([key, tenant]) => {
                        tenantSelect.innerHTML += \`<option value="\${key}">\${tenant.name}</option>\`;
                        if (tenant.name === 'FusionX' || key === 'fusionx') {
                            fusionxFound = true;
                        }
                    });

                    // Auto-select FusionX if available
                    if (fusionxFound) {
                        for (let option of tenantSelect.options) {
                            if (option.textContent === 'FusionX' || option.value === 'fusionx') {
                                tenantSelect.value = option.value;
                                tenantSelect.onchange();
                                break;
                            }
                        }
                    }
                }
            };

            tenantSelect.onchange = function() {
                const envKey = envSelect.value;
                const tenantKey = this.value;
                workspaceSelect.innerHTML = '<option value="">Select...</option>';
                pageSelect.innerHTML = '<option value="">Default</option>';
                if (envKey && tenantKey && config.environments[envKey]?.tenants[tenantKey]) {
                    const workspaceNames = config.environments[envKey].tenants[tenantKey].workspaces;
                    let fusionxFound = false;

                    workspaceNames.forEach(workspaceName => {
                        // Look for matching workspace in sharedUris - check direct key match first
                        let workspaceKey = null;
                        let workspace = null;

                        if (config.sharedUris.workspaces[workspaceName]) {
                            workspaceKey = workspaceName;
                            workspace = config.sharedUris.workspaces[workspaceName];
                        } else {
                            // Look for matching workspace property or name
                            workspaceKey = Object.keys(config.sharedUris.workspaces).find(key =>
                                config.sharedUris.workspaces[key].workspace === workspaceName ||
                                config.sharedUris.workspaces[key].name === workspaceName
                            );
                            if (workspaceKey) {
                                workspace = config.sharedUris.workspaces[workspaceKey];
                            }
                        }

                        if (workspace) {
                            workspaceSelect.innerHTML += \`<option value="\${workspaceKey}">\${workspace.name}</option>\`;
                            if (workspace.name === 'FusionX') fusionxFound = true;
                        } else {
                            // Basic portal workspace
                            workspaceSelect.innerHTML += \`<option value="\${workspaceName}">\${workspaceName}</option>\`;
                            if (workspaceName === 'FusionX') fusionxFound = true;
                        }
                    });

                    // Auto-select default workspace (Reporting) if available
                    const defaultWorkspace = config.defaults?.workspace;
                    if (defaultWorkspace) {
                        for (let option of workspaceSelect.options) {
                            if (option.value === defaultWorkspace) {
                                workspaceSelect.value = option.value;
                                workspaceSelect.onchange();
                                break;
                            }
                        }
                    }
                    // Fallback to workspace marked as default
                    if (!workspaceSelect.value) {
                        for (let option of workspaceSelect.options) {
                            const workspace = config.sharedUris.workspaces[option.value];
                            if (workspace && workspace.default) {
                                workspaceSelect.value = option.value;
                                workspaceSelect.onchange();
                                break;
                            }
                        }
                    }
                }
            };

            workspaceSelect.onchange = function() {
                const workspaceKey = this.value;
                pageSelect.innerHTML = '<option value="">-- Select Page --</option>';
                if (workspaceKey && config.sharedUris.workspaces[workspaceKey]) {
                    const workspace = config.sharedUris.workspaces[workspaceKey];

                    // For portal workspaces, show universal pages
                    if (workspace.type === 'portal' && config.sharedUris.pages) {
                        Object.entries(config.sharedUris.pages).forEach(([key, pageName]) => {
                            pageSelect.innerHTML += \`<option value="\${key}">\${pageName}</option>\`;
                        });
                    }
                    // For swagger workspaces, show swagger endpoints
                    else if (workspace.type === 'swagger' && config.sharedUris.swaggerPages) {
                        Object.entries(config.sharedUris.swaggerPages).forEach(([swaggerPath, swaggerName]) => {
                            pageSelect.innerHTML += \`<option value="\${swaggerPath}">\${swaggerName}</option>\`;
                        });
                    }
                } else if (workspaceKey) {
                    // Handle workspaces not in sharedUris (basic portal workspaces)
                    if (config.sharedUris.pages) {
                        Object.entries(config.sharedUris.pages).forEach(([key, pageName]) => {
                            pageSelect.innerHTML += \`<option value="\${key}">\${pageName}</option>\`;
                        });
                    }
                }
            };

            function buildUrl() {
                const envKey = envSelect.value;
                const tenantKey = tenantSelect.value;
                const workspaceKey = workspaceSelect.value;
                const pageKey = pageSelect.value;

                if (!envKey || !tenantKey) return null;

                if (workspaceKey && config.sharedUris.workspaces[workspaceKey]) {
                    const workspace = config.sharedUris.workspaces[workspaceKey];

                    if (workspace.type === 'portal') {
                        // Portal workspace: /_portal/space/{WorkspaceName}{/page}
                        const basePath = \`/_portal/space/\${workspace.workspace}\`;
                        const pagePath = pageKey || '';
                        return \`https://\${tenantKey}.\${envKey}.tricentis.com\${basePath}\${pagePath}\`;
                    } else if (workspace.type === 'swagger') {
                        // Swagger workspace: direct path from pageKey (which contains the full swagger path)
                        if (pageKey) {
                            return \`https://\${tenantKey}.\${envKey}.tricentis.com\${pageKey}\`;
                        } else {
                            return \`https://\${tenantKey}.\${envKey}.tricentis.com\`;
                        }
                    } else {
                        // Custom workspace: direct path (no additional pages)
                        return \`https://\${tenantKey}.\${envKey}.tricentis.com\${workspace.path}\`;
                    }
                } else if (workspaceKey) {
                    // Basic portal workspace (just workspace name)
                    const basePath = \`/_portal/space/\${workspaceKey}\`;
                    const pagePath = pageKey || '';
                    return \`https://\${tenantKey}.\${envKey}.tricentis.com\${basePath}\${pagePath}\`;
                } else {
                    return \`https://\${tenantKey}.\${envKey}.tricentis.com\`;
                }
            }

            document.getElementById('newTabBtn').onclick = function() {
                const url = buildUrl();
                if (url) window.open(url, '_blank');
                else alert('Please select environment and tenant');
            };

            document.getElementById('currentTabBtn').onclick = function() {
                const url = buildUrl();
                if (url) window.location.href = url;
                else alert('Please select environment and tenant');
            };

            overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        })();
    `;

	document.getElementById('bookmarkletLink').href = `javascript:${encodeURIComponent(bookmarkletCode)}`;
}
