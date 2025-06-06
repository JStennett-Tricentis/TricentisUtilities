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
                background: white; padding: 30px; border-radius: 12px;
                width: 600px; max-width: 90vw; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            \`;

            const envOptions = Object.entries(config.environments).map(([key, env]) =>
                \`<option value="\${key}">\${env.name}</option>\`).join('');

            popup.innerHTML = \`
                <h2 style="margin: 0 0 20px 0; color: #2c3e50;">🚀 Quick Navigate</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Environment:</label>
                        <select id="quickEnv" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Select...</option>
                            \${envOptions}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Tenant:</label>
                        <select id="quickTenant" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Select...</option>
                        </select>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Workspace:</label>
                        <select id="quickWorkspace" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Select...</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Page:</label>
                        <select id="quickPage" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Default</option>
                        </select>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="newTabBtn" style="flex: 1; padding: 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🆕 New Tab
                    </button>
                    <button id="currentTabBtn" style="flex: 1; padding: 10px; background: #11998e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🔗 Current Tab
                    </button>
                    <button onclick="document.getElementById('tricentis-nav-overlay').remove()"
                            style="padding: 10px 15px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ✕
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

            envSelect.onchange = function() {
                const envKey = this.value;
                tenantSelect.innerHTML = '<option value="">Select...</option>';
                workspaceSelect.innerHTML = '<option value="">Select...</option>';
                pageSelect.innerHTML = '<option value="">Default</option>';
                if (envKey && config.environments[envKey]) {
                    Object.entries(config.environments[envKey].tenants).forEach(([key, tenant]) => {
                        tenantSelect.innerHTML += \`<option value="\${key}">\${tenant.name}</option>\`;
                    });
                }
            };

            tenantSelect.onchange = function() {
                const envKey = envSelect.value;
                const tenantKey = this.value;
                workspaceSelect.innerHTML = '<option value="">Select...</option>';
                pageSelect.innerHTML = '<option value="">Default</option>';
                if (envKey && tenantKey && config.environments[envKey]?.tenants[tenantKey]) {
                    const workspaceKeys = config.environments[envKey].tenants[tenantKey].workspaces;
                    workspaceKeys.forEach(workspaceKey => {
                        const workspace = config.sharedUris.workspaces[workspaceKey];
                        if (workspace) {
                            workspaceSelect.innerHTML += \`<option value="\${workspaceKey}">\${workspace.name}</option>\`;
                        }
                    });
                }
            };

            workspaceSelect.onchange = function() {
                const workspaceKey = this.value;
                pageSelect.innerHTML = '<option value="">Home</option>';
                if (workspaceKey && config.sharedUris.workspaces[workspaceKey]) {
                    const workspace = config.sharedUris.workspaces[workspaceKey];
                    // Only show pages for portal workspaces
                    if (workspace.type === 'portal' && config.sharedUris.pages) {
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
                    } else {
                        // Custom workspace: direct path (no additional pages)
                        return \`https://\${tenantKey}.\${envKey}.tricentis.com\${workspace.path}\`;
                    }
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