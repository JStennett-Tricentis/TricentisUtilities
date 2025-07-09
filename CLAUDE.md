# Tosca Cloud URLs Navigator - Claude Context

## Project Overview

This is a web application that provides quick navigation tools for Tosca Cloud environments. It allows users to easily navigate between different environments, tenants, workspaces, and pages within the Tosca Cloud platform.

## Key Features

- **Environment Navigator**: Dropdown-based navigation for environments, tenants, workspaces, and pages
- **JIRA Integration**: Quick ticket lookup functionality
- **Configuration Manager**: Visual and JSON-based configuration editing
- **Bookmarklet**: Browser bookmarklet for quick navigation from any page
- **Config File Selection**: Choose between different configuration files

## File Structure

```yml
/
├── index.html                 # Main HTML file with tabs for navigation, JIRA, config, and bookmarklet
├── styles.css                 # Styling for the application
├── config.json                # Default configuration file
├── config.fusionx.json        # FusionX-specific configuration
├── config.example.json        # Example configuration template
├── js/
│   ├── app.js                 # Main application initialization and event handlers
│   ├── config.js              # Configuration management and loading
│   ├── navigation.js          # Navigation logic and URL building
│   └── bookmarklet.js         # Bookmarklet generation and management
└── assets/                    # Images and icons
```

## Configuration System

### Config File Structure

```json
{
  "defaults": {
    "workspace": "reporting"      // Default workspace to auto-select
  },
  "sharedUris": {
    "workspaces": {
      "reporting": {
        "name": "Reporting",
        "type": "portal",
        "workspace": "Reporting",
        "default": true            // Marks as default workspace
      }
    },
    "pages": { ... },             // Common pages across workspaces
    "swaggerPages": { ... }       // Swagger API endpoints
  },
  "environments": {
    "my-dev": {
      "name": "Development",
      "tenants": {
        "fusionx": {
          "name": "FusionX",
          "workspaces": ["reporting", "fusionx", ...]
        }
      }
    }
  }
}
```

### Current Default Settings

- **Default workspace**: "Reporting" (changed from "FusionX")
- **Config file selector**: Users can choose between config.json, config.fusionx.json, or config.example.json
- **Bookmarklet**: Automatically updates based on selected config file

## Recent Changes Made

1. **Changed default workspace** from "FusionX" to "Reporting"
2. **Added defaults section** to config files for easier default management
3. **Updated navigation logic** to use `config.defaults?.workspace` and fallback to `workspace.default`
4. **Added config file selector** in the configuration tab
5. **Updated bookmarklet** to use selected config file and new defaults

## Key Functions

### config.js

- `loadConfigFromFile(filename)`: Loads configuration from specified file
- `loadSelectedConfigFile()`: Loads user-selected config file and updates UI
- `initConfig()`: Initializes configuration on app start
- `updateConfigDisplay()`: Updates all UI elements when config changes

### navigation.js

- `updateWorkspaces()`: Populates workspace dropdown with auto-selection of default
- `updateUrlPreview()`: Builds and displays URL preview
- `navigateToUrl()`: Navigates to constructed URL

### bookmarklet.js

- `updateBookmarklet()`: Generates bookmarklet code with current config
- Contains embedded navigation logic for the bookmarklet popup

## Development Notes

- The application supports both file-based and localStorage-based configuration
- CORS restrictions are handled by falling back to built-in config when needed
- All configuration changes automatically update the bookmarklet
- The config file selection is persistent across browser sessions

## Common Tasks

- **Adding new environments**: Use the visual editor in the config tab
- **Adding new workspaces**: Use the shared URI editor
- **Changing defaults**: Modify the `defaults` section in config files
- **Testing different configs**: Use the config file selector dropdown

## Ignore

- `Log Parser/` directory - This is for the next phase of the project and should be ignored in current development
