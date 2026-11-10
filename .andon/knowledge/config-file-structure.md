---
title: Config File Structure
tags: [config-file-structure]
paths: []
updated: 2026-11-10
---

Imported from `CLAUDE.md:46` by Andon (import CLAUDE.md:46 6ad94ec6e4d8635f); the original stays there.

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
