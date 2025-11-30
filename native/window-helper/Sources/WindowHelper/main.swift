import Foundation
import AppKit
import ApplicationServices

// MARK: - CLI

func printUsage() {
    print("""
    MacWindowHelper – macOS window manager

    Commands:
      request-permission              Triggers accessibility permission request
      minimize-all                    Minimizes all windows across all apps
      minimize-all-except <name>      Minimizes all windows except the specified app
      restore-all                     Restores all minimized windows across all apps
      hide-all                        Hides all applications
      minimize-app <name>              Minimizes windows of a specific app
    """)
}

// MARK: - Error Handling

func logError(_ error: Error, context: String) {
    let errorMessage = "[ERROR] \(context): \(error.localizedDescription)"
    
    // Log to stderr
    FileHandle.standardError.write(Data(errorMessage.utf8))
    FileHandle.standardError.write(Data("\n".utf8))
    
    // Also print to console (stderr)
    fputs(errorMessage + "\n", stderr)
}



func handleError(_ error: Error, command: String) {
    // Log the error
    logError(error, context: "Command '\(command)' failed")
    
    // Suppress dialogs when called from Electron (NO_DIALOG=1)
    // Electron will show its own dialogs
    let suppressDialogs = ProcessInfo.processInfo.environment["NO_DIALOG"] == "1"
    if suppressDialogs {
        return
    }
    
    // Only show dialogs if not suppressed
    let windowManagerError = error as? WindowManagerError
    if let wmError = windowManagerError {
        let alert = NSAlert()
        alert.alertStyle = .warning
        alert.addButton(withTitle: "OK")
        alert.messageText = wmError.localizedDescription
        
        if case .accessibilityPermissionDenied = wmError {
            alert.informativeText = "Please enable Accessibility permissions in System Settings → Privacy & Security → Accessibility."
        }
        
        alert.runModal()
    }
}

func requestAccessibilityPermission() {
    // Trigger accessibility permission request using AXIsProcessTrustedWithOptions
    // This will show the system permission dialog and add the binary to the accessibility list
    let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
    let trusted = AXIsProcessTrustedWithOptions(options)
    
    if !trusted {
        // Wait for system dialog to appear
        Thread.sleep(forTimeInterval: 1.0)
    }
    
    print("Accessibility permission request completed")
}

let args = CommandLine.arguments

guard args.count >= 2 else {
    printUsage()
    exit(0)
}

let command = args[1]

// Ensure we can show dialogs (required for NSAlert)
let app = NSApplication.shared
app.setActivationPolicy(.accessory)

do {
    switch command {
    case "request-permission":
        // Dedicated command to trigger accessibility permission request
        requestAccessibilityPermission()
        exit(0)
    case "minimize-all":
        try WindowManager.minimizeAllWindows()
    case "minimize-all-except":
        if args.count >= 3 {
            try WindowManager.minimizeAllWindowsExcluding(excludeAppName: args[2])
        } else {
            let error = NSError(domain: "WindowHelper", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "Usage: minimize-all-except <AppName>"
            ])
            handleError(error, command: command)
            exit(1)
        }
    case "restore-all":
        try WindowManager.restoreAllWindows()
    case "hide-all":
        try WindowManager.hideAllApps()
    case "minimize-app":
        if args.count >= 3 {
            try WindowManager.minimizeApp(named: args[2])
        } else {
            let error = NSError(domain: "WindowHelper", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "Usage: minimize-app <AppName>"
            ])
            handleError(error, command: command)
            exit(1)
        }
    default:
        printUsage()
        exit(1)
    }
} catch {
    handleError(error, command: command)
    exit(1)
}

