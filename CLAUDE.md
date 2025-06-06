# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Tricentis Navigator - A browser-based tool for navigating Tricentis cloud environments

## Code Structure and Style Guidelines

### JavaScript
- Indentation: Use tabs for JavaScript files
- Naming: Use camelCase for variables and functions
- Functions: Use function declarations (not arrow functions)
- Error handling: Use try/catch blocks for config operations, alerts for navigation errors
- DOM interaction: Use getElementById and querySelector for DOM manipulation
- Module pattern: Functions exported via window object (e.g., `window.functionName = functionName`)
- JavaScript features: Use ES6 features (template literals, let/const, for...of loops)

### HTML/CSS
- HTML indentation: 2 spaces
- CSS organization: Properties grouped logically, sometimes alphabetized
- Class naming: Use kebab-case for CSS classes and DOM IDs
- CSS features: Use flexbox, grid, gradients and transitions for layouts/effects

### Configuration
- Store user configuration in localStorage
- Provide default configuration in config.js
- Use JSON for configuration management

## Commands
No formal build, lint or test infrastructure is used in this project. The application is plain HTML, CSS and JavaScript that runs directly in the browser without a build process.

To serve locally, you can use a simple static HTTP server:
```
python -m http.server
```

## Important Files
- app.js: Main application and event handling
- navigation.js: URL building and navigation functions
- config.js: Configuration management
- bookmarklet.js: Bookmarklet generation for quick access
- index.html: Main UI structure
- styles.css: All styling rules