# Window Helper Addon Setup

This document describes the setup and conversion from the Swift helper to a Node.js native addon.

## Overview

The Swift helper application (`MacWindowHelper`) has been converted to a Node.js native addon that can be directly used in the Electron app without spawning external processes.

## Architecture

### Components

1. **C++/Objective-C++ Implementation** (`src/window_manager.mm`)
   - Contains the core window management logic using macOS APIs
   - Uses Cocoa and ApplicationServices frameworks
   - Provides the same functionality as the Swift version

2. **Node.js Bindings** (`src/window_helper.cc`)
   - Uses node-addon-api to create Node.js bindings
   - Exposes functions to JavaScript/TypeScript
   - Handles error conversion and result formatting

3. **TypeScript Wrapper** (`src/main/platform/window-helper.ts`)
   - Provides a clean TypeScript interface
   - Handles addon loading in both dev and production
   - Includes error handling and logging

4. **Build Configuration** (`binding.gyp`)
   - Configures node-gyp to build the addon
   - Links against Cocoa and ApplicationServices frameworks
   - Sets minimum macOS version to 10.13

## Building

### Prerequisites

- macOS 10.13 or later
- Xcode Command Line Tools
- Node.js with node-gyp support

### Build Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the addon:
   ```bash
   npm run build:window-helper-addon
   ```

   Or from the addon directory:
   ```bash
   cd native/window-helper-addon
   npm install
   ```

The addon will be built to `native/window-helper-addon/build/Release/window_helper.node`.

## Integration

### Development

In development, the addon is loaded from `native/window-helper-addon` relative to the project root.

### Production

The addon is bundled with the Electron app via electron-builder's `extraResources` configuration. It's placed in `native/window-helper-addon` within the app's resources directory.

## Usage

The addon is used through the `windowHelper` module:

```typescript
import { windowHelper } from './window-helper';

// Minimize all windows
const result = windowHelper.minimizeAllWindows();
if (result.success) {
  console.log(`Minimized ${result.minimized}/${result.total} windows`);
} else {
  console.error(`Error: ${result.error}`);
}
```

## Benefits

1. **Performance**: Direct function calls instead of spawning processes
2. **Reliability**: No process management or IPC overhead
3. **Integration**: Better error handling and type safety
4. **Distribution**: Single binary instead of separate helper executable
5. **Debugging**: Easier to debug with native debugging tools

## Migration Notes

The old Swift helper (`MacWindowHelper`) is still included in the build for backward compatibility but is no longer used. It can be removed in a future version.

## Troubleshooting

### Build Issues

If the addon fails to build:

1. Ensure Xcode Command Line Tools are installed:
   ```bash
   xcode-select --install
   ```

2. Check node-gyp is working:
   ```bash
   npm install -g node-gyp
   node-gyp --version
   ```

3. Clean and rebuild:
   ```bash
   cd native/window-helper-addon
   npm run clean
   npm install
   ```

### Runtime Issues

If the addon fails to load:

1. Check the addon file exists:
   ```bash
   ls -la native/window-helper-addon/build/Release/window_helper.node
   ```

2. Check file permissions (should be executable)

3. Check Electron version compatibility (should work with Electron 39+)

4. Review logs for specific error messages

## Future Improvements

- Add Windows and Linux implementations
- Add more window management features
- Improve error messages
- Add unit tests for the addon

