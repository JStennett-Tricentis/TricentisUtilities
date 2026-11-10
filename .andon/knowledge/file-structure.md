---
title: File Structure
tags: [file-structure]
paths: [index.html, styles.css, config.json, config.fusionx.json, config.example.json, app.js, config.js, navigation.js, bookmarklet.js, ToscaLogParserApp.js, LogParser.js, UIManager.js, DataManager.js, log-parser-styles.css, log-parser.html]
updated: 2026-11-10
---

Imported from `CLAUDE.md:16` by Andon (import CLAUDE.md:16 65a12434c06508bb); the original stays there.

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
