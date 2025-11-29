# macOS Window Helper Documentation

## Overview

The Window Helper is a native Swift binary that provides window management functionality for the Electron app on macOS. It uses the Accessibility API (AXUIElement) to minimize and restore windows across all applications.

## What It Does

The Window Helper provides the following commands:

- `minimize-all` - Minimizes all windows across all applications
- `restore-all` - Restores all previously minimized windows
- `minimize-all-except <AppName>` - Minimizes all windows except the specified app
- `hide-all` - Hides all applications
- `minimize-app <AppName>` - Minimizes windows of a specific application

## Architecture

The helper is built as a Swift Package Manager executable located at `native/window-helper/`. The project structure:

```
native/window-helper/
├── Package.swift                    # Swift Package Manager configuration
├── Sources/WindowHelper/
│   ├── main.swift                  # CLI entry point
│   └── WindowManager.swift        # Window management logic
├── build-macos.sh                  # Build script
├── codesign-macos.sh               # Code signing script
├── entitlements.plist              # Code signing entitlements
└── bin/
    └── MacWindowHelper             # Compiled binary (generated)
```

## Building the Helper

### Automated Build

The helper is automatically built when you run:

```bash
npm run build:mac
```

Or build it separately:

```bash
npm run build:window-helper
```

This runs the `build-macos.sh` script which:
1. Compiles the Swift code in release mode
2. Copies the binary to `native/window-helper/bin/MacWindowHelper`

### Manual Build

To build manually:

```bash
cd native/window-helper
./build-macos.sh
```

Or using Swift directly:

```bash
cd native/window-helper
swift build -c release
mkdir -p bin
cp .build/release/MacWindowHelper bin/MacWindowHelper
```

## Code Signing

### Prerequisites

You need a valid code signing certificate. To list available certificates:

```bash
security find-identity -v -p codesigning
```

### Setting Up the Certificate

Set the `MAC_CERT_NAME` environment variable to your certificate name:

```bash
export MAC_CERT_NAME="Developer ID Application: Your Name (TEAM_ID)"
```

Or add it to your shell profile (`~/.zshrc` or `~/.bash_profile`):

```bash
echo 'export MAC_CERT_NAME="Developer ID Application: Your Name (TEAM_ID)"' >> ~/.zshrc
source ~/.zshrc
```

### Signing the Binary

Sign the binary using the provided script:

```bash
npm run sign:window-helper
```

Or manually:

```bash
cd native/window-helper
./codesign-macos.sh
```

The script will:
1. Check if the binary exists
2. Verify the certificate is set
3. Sign the binary with entitlements
4. Verify the signature

### Entitlements

The helper requires the following entitlements (configured in `entitlements.plist`):

- `com.apple.security.accessibility` - Required to control windows via Accessibility API
- `com.apple.security.device.camera` - Set to `false` (not needed)
- Hardened Runtime enabled

## How Electron Calls the Helper

### Path Resolution

The Electron app resolves the helper path differently in development and production:

**Development:**
- Checks: `native/window-helper/bin/MacWindowHelper` (project root)

**Production:**
- Checks: `process.resourcesPath/MacWindowHelper`
- The binary is bundled via `electron-builder.yml` `extraResources`

### Integration Flow

1. **IPC Request** - Renderer process calls IPC channel (`system:minimize-all-windows` or `system:restore-all-windows`)
2. **Main Process Handler** - `src/main/index.ts` receives the IPC call
3. **Platform Handler** - Routes to `src/main/platform/macos.ts`
4. **Helper Execution** - Uses `execFile` to run the binary with appropriate arguments
5. **Error Handling** - Checks for missing binary, permission errors, and non-zero exit codes

### Code Example

```typescript
// In src/main/platform/macos.ts
export async function minimizeAllWindows(): Promise<void> {
  const helperPath = await ensureWindowHelperExists();
  const { stdout, stderr } = await execFileAsync(helperPath, ['minimize-all']);
  // Handle output and errors...
}
```

## Accessibility Requirements

### Why It's Needed

The Window Helper uses macOS Accessibility API (`AXUIElement`) to control windows. This requires explicit user permission for security reasons.

### Setting Up Permissions

1. Open **System Settings** (or System Preferences on older macOS)
2. Go to **Privacy & Security** → **Accessibility**
3. Click the lock icon to make changes (enter your password)
4. Add the Electron app to the list:
   - In development: Add Terminal or your IDE
   - In production: Add the packaged app (`PresentBuddy.app`)

### Permission Check

The app checks for Accessibility permissions on startup (macOS only). If permissions are missing, a dialog will appear with instructions.

The check is implemented in `src/main/platform/accessibility.ts` and integrated into `src/main/index.ts`.

### Manual Permission Check

You can test if permissions are granted by running the helper directly:

```bash
./native/window-helper/bin/MacWindowHelper minimize-all
```

If permissions are missing, the command will fail silently or with an error.

## Debugging

### Running the Helper Manually

Test the helper directly from the terminal:

```bash
# Minimize all windows
./native/window-helper/bin/MacWindowHelper minimize-all

# Restore all windows
./native/window-helper/bin/MacWindowHelper restore-all

# Minimize all except a specific app
./native/window-helper/bin/MacWindowHelper minimize-all-except "Finder"

# Get usage help
./native/window-helper/bin/MacWindowHelper
```

### Checking Logs

The Electron app logs helper execution:

- **Success**: Helper output is logged to console
- **Errors**: Non-zero exit codes and stderr are logged with warnings
- **Missing Binary**: Shows error dialog to user

Check Electron logs:

```bash
# In development
npm run electron:dev
# Check console output

# In production
# Check Console.app or system logs
```

### Common Issues

#### Binary Not Found

**Error**: "Window Helper is missing or not signed properly."

**Solutions**:
1. Build the helper: `npm run build:window-helper`
2. Check the path in `macos.ts` matches your setup
3. Verify `electron-builder.yml` includes the binary in `extraResources`

#### Permission Denied

**Error**: "Accessibility permissions required"

**Solutions**:
1. Enable Accessibility permissions in System Settings
2. Restart the app after enabling permissions
3. Verify the app is in the Accessibility list

#### Code Signing Issues

**Error**: Binary fails to run or is rejected by macOS

**Solutions**:
1. Sign the binary: `npm run sign:window-helper`
2. Verify certificate is valid: `security find-identity -v -p codesigning`
3. Check entitlements are correct in `entitlements.plist`
4. For distribution, ensure notarization is configured

#### Helper Exits with Non-Zero Code

**Symptoms**: Windows don't minimize/restore, but no error shown

**Solutions**:
1. Check Electron console for warnings
2. Run helper manually to see error messages
3. Verify Accessibility permissions are granted
4. Check if helper binary is executable: `chmod +x native/window-helper/bin/MacWindowHelper`

## Troubleshooting

### Helper Works in Terminal but Not in Electron

1. Check the path resolution in `macos.ts`
2. Verify binary exists at the expected location
3. Check file permissions: `ls -la native/window-helper/bin/MacWindowHelper`
4. Ensure binary is signed (required for some macOS versions)

### Helper Doesn't Minimize/Restore Windows

1. Verify Accessibility permissions are enabled
2. Check if other apps are blocking (some security software)
3. Test with a simple app first (e.g., TextEdit)
4. Check macOS version compatibility (requires macOS 10.13+)

### Build Failures

1. Ensure Swift is installed: `swift --version`
2. Check Swift version compatibility (requires Swift 5.9+)
3. Verify Package.swift syntax is correct
4. Clean build: `rm -rf native/window-helper/.build`

### Code Signing Failures

1. Verify certificate name matches exactly (case-sensitive)
2. Check certificate hasn't expired
3. Ensure certificate has code signing capability
4. Try signing manually to see detailed error: `codesign --force --deep --sign "$MAC_CERT_NAME" native/window-helper/bin/MacWindowHelper`

## Packaging

The helper is automatically included in macOS builds via `electron-builder.yml`:

```yaml
mac:
  extraResources:
    - from: native/window-helper/bin/MacWindowHelper
      to: MacWindowHelper
```

The binary is placed in the app's `Resources` directory and accessed via `process.resourcesPath`.

## Security Considerations

1. **Code Signing**: Required for distribution and some macOS security features
2. **Entitlements**: Must request only necessary permissions
3. **Hardened Runtime**: Enabled for better security
4. **User Permissions**: Accessibility requires explicit user consent
5. **Binary Integrity**: Verify binary hasn't been tampered with

## Future Improvements

- Add more window management features (maximize, move, resize)
- Support for window grouping/filtering
- Performance optimizations for large numbers of windows
- Better error messages and recovery
- Automated permission request flow

