# Window Helper Node.js Addon

This is a native Node.js addon for macOS window management, converted from the Swift helper application. It provides direct access to macOS window management APIs through Node.js/Electron.

## Features

- Minimize all windows
- Restore all minimized windows
- Hide all applications
- Minimize specific application
- Minimize all windows except a specific application
- Request accessibility permissions
- Check accessibility permissions

## Building

The addon is built automatically during `npm install` via the `postinstall` script, or you can build it manually:

```bash
cd native/window-helper-addon
npm install
```

Or from the project root:

```bash
npm run build:window-helper-addon
```

## Requirements

- macOS 10.13 or later
- Node.js with node-gyp support
- Xcode Command Line Tools
- node-addon-api

## Usage

```javascript
const windowHelper = require('./native/window-helper-addon');

// Request accessibility permission
windowHelper.requestPermission();

// Minimize all windows
const result = windowHelper.minimizeAllWindows();
console.log(`Minimized ${result.minimized}/${result.total} windows`);

// Restore all windows
const restoreResult = windowHelper.restoreAllWindows();
console.log(`Restored ${restoreResult.restored}/${restoreResult.total} windows`);

// Check permissions
const hasPermissions = windowHelper.checkAccessibilityPermissions();
```

## API

### `requestPermission(): boolean`
Requests accessibility permissions from the system. Returns `true` if permissions are already granted.

### `minimizeAllWindows(): WindowManagerResult`
Minimizes all windows across all applications.

### `restoreAllWindows(): WindowManagerResult`
Restores all minimized windows.

### `hideAllApps(): WindowManagerResult`
Hides all applications.

### `minimizeApp(appName: string): WindowManagerResult`
Minimizes windows of a specific application.

### `minimizeAllWindowsExcluding(excludeAppName: string): WindowManagerResult`
Minimizes all windows except those belonging to the specified application.

### `checkAccessibilityPermissions(): boolean`
Checks if accessibility permissions are granted.

## WindowManagerResult

```typescript
interface WindowManagerResult {
  success: boolean;
  minimized?: number;
  restored?: number;
  total?: number;
  error: string;
  errorCode: string;
}
```

## Error Codes

- `ACCESSIBILITY_PERMISSION_DENIED`: Accessibility permissions are required
- `NO_WINDOWS_FOUND`: No windows found to perform the operation
- `APP_NOT_FOUND`: Specified application not found
- `OPERATION_FAILED`: Operation failed for other reasons

## Development

The addon is written in C++/Objective-C++ using:
- node-addon-api for Node.js bindings
- Cocoa and ApplicationServices frameworks for macOS APIs

## Notes

- The addon requires accessibility permissions to manage windows
- The addon is macOS-only (other platforms would need separate implementations)
- The addon is automatically included in the Electron build via electron-builder

