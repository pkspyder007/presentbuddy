# macOS Window Helper Documentation

## Overview

**Note: The Swift helper has been replaced by a Node.js native addon. See `native/window-helper-addon/README.md` for current documentation.**

The Window Helper functionality is now provided by a Node.js native addon located at `native/window-helper-addon/`. This provides better performance and integration compared to the previous Swift binary approach.

## Migration

The old Swift helper (`MacWindowHelper`) has been replaced with a Node.js native addon that:
- Provides direct function calls instead of spawning processes
- Offers better error handling and type safety
- Is easier to debug and maintain
- Is bundled as a single `.node` file instead of a separate executable

## Current Implementation

See `native/window-helper-addon/README.md` and `native/window-helper-addon/SETUP.md` for:
- Current architecture and usage
- Building instructions
- API documentation
- Troubleshooting

## Legacy Information

The following information is kept for historical reference only:

### Previous Swift Implementation

The previous implementation was a Swift Package Manager executable that provided window management through command-line arguments. It has been fully replaced by the Node.js addon.

### Old Build Commands (No Longer Used)

- `npm run build:window-helper` - Removed
- `npm run sign:window-helper` - Removed

### Old File Structure (Removed)

```
native/window-helper/
├── Package.swift                    # Removed
├── Sources/WindowHelper/            # Removed
│   ├── main.swift                  # Removed
│   └── WindowManager.swift         # Removed
├── build-macos.sh                  # Removed
├── codesign-macos.sh               # Removed
└── entitlements.plist              # Removed
```

## For New Development

All window management functionality is now accessed through the `windowHelper` module:

```typescript
import { windowHelper } from './window-helper';

const result = windowHelper.minimizeAllWindows();
```

See `src/main/platform/window-helper.ts` for the full API.
