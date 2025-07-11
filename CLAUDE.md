# Tosca Tools - Claude Context

## Project Overview

This is a comprehensive web application toolkit for Tosca Cloud environments. It provides quick navigation tools, advanced log parsing capabilities, JIRA integration, and productivity features in a unified interface.

## Key Features

- **Log Parser**: Advanced Tosca Cloud execution log analysis with variable extraction
- **Environment Navigation**: Dropdown-based navigation for environments, tenants, workspaces, and pages
- **JIRA Integration**: Quick ticket lookup functionality
- **Configuration Manager**: Visual and JSON-based configuration editing
- **Bookmarklet**: Browser bookmarklet for quick navigation from any page
- **Config File Selection**: Choose between different configuration files

## File Structure

```yml
/
├── index.html                 # Main HTML file with tabs for log parser, navigation, JIRA, config, and bookmarklet
├── styles.css                 # Styling for the application including log parser components
├── config.json                # Default configuration file
├── config.fusionx.json        # FusionX-specific configuration
├── config.example.json        # Example configuration template
├── js/
│   ├── app.js                 # Main application initialization and event handlers
│   ├── config.js              # Configuration management and loading
│   ├── navigation.js          # Navigation logic and URL building
│   └── bookmarklet.js         # Bookmarklet generation and management
├── log-parser-js/             # Log parser JavaScript modules
│   ├── ToscaLogParserApp.js   # Main log parser application
│   ├── core/
│   │   └── LogParser.js       # Core parsing logic
│   ├── ui/
│   │   └── UIManager.js       # UI management and rendering
│   └── data/
│       └── DataManager.js     # Data processing and grouping
├── log-parser-styles.css      # Additional styles for standalone log parser
├── log-parser.html            # Standalone log parser page (optional)
├── logParserWebsite/          # Original log parser source (for reference)
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
- **Tab order**: Log Parser is now the default first tab

## Recent Changes Made

1. **Integrated Log Parser**: Added full log parser functionality as the primary tab
2. **Changed default workspace** from "FusionX" to "Reporting"
3. **Added defaults section** to config files for easier default management
4. **Updated navigation logic** to use `config.defaults?.workspace` and fallback to `workspace.default`
5. **Added config file selector** in the configuration tab
6. **Updated bookmarklet** to use selected config file and new defaults
7. **Expanded site width** from 1000px to 1400px for better log parser display
8. **Integrated log parser styles** with main application CSS

## Key Functions

### config.js

- `loadConfigFromFile(filename)`: Loads configuration from specified file
- `loadSelectedConfigFile()`: Loads user-selected config file and updates UI
- `initConfig()`: Initializes configuration on app start
- `updateConfigDisplay()`: Updates all UI elements when config changes

### navigation.js

- `updateWorkspaces()`: Populates workspace dropdown with auto-selection of default
- `updateUrlPreview()`: Builds and displays URL preview
- `navigationToUrl()`: Navigations to constructed URL

### bookmarklet.js

- `updateBookmarklet()`: Generates bookmarklet code with current config
- Contains embedded navigation logic for the bookmarklet popup

### log-parser-js/ToscaLogParserApp.js

- Main coordinator for log parser functionality
- Integrates LogParser, UIManager, and DataManager modules
- Handles initialization and event coordination

### log-parser-js/core/LogParser.js

- Core parsing logic for Tosca Cloud execution logs
- Extracts buffer variables, JSON payloads, URLs, tokens, and timestamps
- Handles multi-line JSON and context detection

### log-parser-js/ui/UIManager.js

- UI management and rendering for log parser
- Creates variable tables, log views, and table views
- Handles syntax highlighting and interactive elements

### log-parser-js/data/DataManager.js

- Data processing and grouping for parsed variables
- Categorizes variables by type (JSON, Token, URL, ID, Timestamp, Buffer)
- Groups variables by TestCase and Operation context

## Development Notes

- The application supports both file-based and localStorage-based configuration
- CORS restrictions are handled by falling back to built-in config when needed
- All configuration changes automatically update the bookmarklet
- The config file selection is persistent across browser sessions
- Log parser functionality is fully integrated using ES6 modules
- CSS is organized with prefixed classes to avoid conflicts between tools
- Site width is optimized for log parser display (1400px)

## Common Tasks

- **Adding new environments**: Use the visual editor in the config tab
- **Adding new workspaces**: Use the shared URI editor
- **Changing defaults**: Modify the `defaults` section in config files
- **Testing different configs**: Use the config file selector dropdown
- **Parsing logs**: Use the log parser tab with paste or file upload
- **Customizing log parser**: Modify files in `log-parser-js/` directory

## Ignore

- `Log Parser/` directory - This is for the next phase of the project and should be ignored in current development
