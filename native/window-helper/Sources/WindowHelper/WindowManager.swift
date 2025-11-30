import Cocoa
import ApplicationServices

// MARK: - Window Manager

public enum WindowManagerError: Error, LocalizedError {
    case accessibilityPermissionDenied
    case operationFailed(String)
    case appNotFound(String)
    case noWindowsFound
    
    public var errorDescription: String? {
        switch self {
        case .accessibilityPermissionDenied:
            return "Accessibility permissions are required. Please enable them in System Settings > Privacy & Security > Accessibility."
        case .operationFailed(let message):
            return "Operation failed: \(message)"
        case .appNotFound(let name):
            return "Application '\(name)' not found."
        case .noWindowsFound:
            return "No windows found to perform the operation."
        }
    }
}

public struct WindowManager {
    // MARK: - Helpers
    
    static func getAllWindowElements(of app: NSRunningApplication) throws -> [AXUIElement] {
        let axApp = AXUIElementCreateApplication(app.processIdentifier)
        
        var value: CFTypeRef?
        let result = AXUIElementCopyAttributeValue(axApp, kAXWindowsAttribute as CFString, &value)
        
        // Check if accessibility permissions are granted
        if result == .apiDisabled || result == .noValue {
            throw WindowManagerError.accessibilityPermissionDenied
        }
        
        if result == .success, let windows = value as? [AXUIElement] {
            return windows
        }
        
        // If we get here, it might be a permissions issue or the app has no windows
        // Don't throw an error here - let the caller decide based on context
        return []
    }
    
    static func checkAccessibilityPermissions() -> Bool {
        // Try to access a system app to check permissions
        let systemApps = NSWorkspace.shared.runningApplications.filter { $0.activationPolicy == .regular }
        guard let testApp = systemApps.first else { return false }
        
        let axApp = AXUIElementCreateApplication(testApp.processIdentifier)
        var value: CFTypeRef?
        let result = AXUIElementCopyAttributeValue(axApp, kAXWindowsAttribute as CFString, &value)
        
        return result == .success
    }
    
    // MARK: - Actions
    
    public static func minimizeAllWindows() throws {
        // Check accessibility permissions first
        if !checkAccessibilityPermissions() {
            throw WindowManagerError.accessibilityPermissionDenied
        }
        
        var successCount = 0
        var failureCount = 0
        var totalWindows = 0
        var errors: [String] = []
        var permissionErrors = 0
        
        let apps = NSWorkspace.shared.runningApplications.filter { $0.activationPolicy == .regular }
        
        if apps.isEmpty {
            throw WindowManagerError.noWindowsFound
        }
        
        for app in apps {
            do {
                let windows = try getAllWindowElements(of: app)
                totalWindows += windows.count
                
                for window in windows {
                    // Check if window is already minimized
                    var minimized: CFTypeRef?
                    let checkResult = AXUIElementCopyAttributeValue(window, kAXMinimizedAttribute as CFString, &minimized)
                    
                    if checkResult == .success, let isMinimized = minimized as? Bool, isMinimized {
                        // Skip already minimized windows
                        continue
                    }
                    
                    let result = AXUIElementSetAttributeValue(window, kAXMinimizedAttribute as CFString, kCFBooleanTrue)
                    if result == .success {
                        successCount += 1
                    } else {
                        failureCount += 1
                        let errorMsg = "Failed to minimize window: \(result.rawValue)"
                        errors.append(errorMsg)
                        // Log error to stderr
                        FileHandle.standardError.write(Data(errorMsg.utf8))
                        FileHandle.standardError.write(Data("\n".utf8))
                        
                        if result == .apiDisabled || result == .noValue {
                            permissionErrors += 1
                        }
                    }
                }
            } catch WindowManagerError.accessibilityPermissionDenied {
                permissionErrors += 1
                let errorMsg = "Accessibility permission denied for app: \(app.localizedName ?? "Unknown")"
                errors.append(errorMsg)
                FileHandle.standardError.write(Data(errorMsg.utf8))
                FileHandle.standardError.write(Data("\n".utf8))
            } catch {
                // Other errors - log and continue
                let errorMsg = "Error accessing windows for app \(app.localizedName ?? "Unknown"): \(error.localizedDescription)"
                errors.append(errorMsg)
                FileHandle.standardError.write(Data(errorMsg.utf8))
                FileHandle.standardError.write(Data("\n".utf8))
            }
        }
        
        // Print summary to stdout
        print("Minimized \(successCount)/\(totalWindows) windows")
        
        if totalWindows == 0 {
            if permissionErrors > 0 {
                throw WindowManagerError.accessibilityPermissionDenied
            }
            throw WindowManagerError.noWindowsFound
        }
        
        if failureCount > 0 {
            let errorMsg = "Failed to minimize \(failureCount)/\(totalWindows) windows"
            if failureCount == totalWindows || permissionErrors > 0 {
                throw WindowManagerError.accessibilityPermissionDenied
            } else {
                throw WindowManagerError.operationFailed("\(errorMsg). Details: \(errors.joined(separator: "; "))")
            }
        }
    }
    
    public static func restoreAllWindows() throws {
        // Check accessibility permissions first
        if !checkAccessibilityPermissions() {
            throw WindowManagerError.accessibilityPermissionDenied
        }
        
        var successCount = 0
        var failureCount = 0
        var totalRestored = 0
        var errors: [String] = []
        var permissionErrors = 0
        
        let apps = NSWorkspace.shared.runningApplications.filter { $0.activationPolicy == .regular }
        
        if apps.isEmpty {
            throw WindowManagerError.noWindowsFound
        }
        
        for app in apps {
            do {
                let windows = try getAllWindowElements(of: app)
                
                for window in windows {
                    var minimized: CFTypeRef?
                    let res = AXUIElementCopyAttributeValue(window, kAXMinimizedAttribute as CFString, &minimized)
                    
                    if res == .success,
                       let minimizedValue = minimized as? Bool,
                       minimizedValue == true {
                        
                        totalRestored += 1
                        let restoreResult = AXUIElementSetAttributeValue(window, kAXMinimizedAttribute as CFString, kCFBooleanFalse)
                        if restoreResult == .success {
                            successCount += 1
                        } else {
                            failureCount += 1
                            let errorMsg = "Failed to restore window: \(restoreResult.rawValue)"
                            errors.append(errorMsg)
                            FileHandle.standardError.write(Data(errorMsg.utf8))
                            FileHandle.standardError.write(Data("\n".utf8))
                            
                            if restoreResult == .apiDisabled || restoreResult == .noValue {
                                permissionErrors += 1
                            }
                        }
                    }
                }
                
                // Bring app to front if any window was restored
                if totalRestored > 0 {
                    app.activate(options: .activateAllWindows)
                }
            } catch WindowManagerError.accessibilityPermissionDenied {
                permissionErrors += 1
                let errorMsg = "Accessibility permission denied for app: \(app.localizedName ?? "Unknown")"
                errors.append(errorMsg)
                FileHandle.standardError.write(Data(errorMsg.utf8))
                FileHandle.standardError.write(Data("\n".utf8))
            } catch {
                // Other errors - log and continue
                let errorMsg = "Error accessing windows for app \(app.localizedName ?? "Unknown"): \(error.localizedDescription)"
                errors.append(errorMsg)
                FileHandle.standardError.write(Data(errorMsg.utf8))
                FileHandle.standardError.write(Data("\n".utf8))
            }
        }
        
        // Print summary to stdout
        print("Restored \(successCount)/\(totalRestored) windows")
        
        if totalRestored == 0 {
            if permissionErrors > 0 {
                throw WindowManagerError.accessibilityPermissionDenied
            }
            throw WindowManagerError.noWindowsFound
        }
        
        if failureCount > 0 {
            let errorMsg = "Failed to restore \(failureCount)/\(totalRestored) windows"
            if failureCount == totalRestored || permissionErrors > 0 {
                throw WindowManagerError.accessibilityPermissionDenied
            } else {
                throw WindowManagerError.operationFailed("\(errorMsg). Details: \(errors.joined(separator: "; "))")
            }
        }
    }
    
    public static func hideAllApps() throws {
        let apps = NSWorkspace.shared.runningApplications.filter { $0.activationPolicy == .regular }
        
        if apps.isEmpty {
            throw WindowManagerError.noWindowsFound
        }
        
        for app in apps {
            // Note: hide() doesn't return a value, but we can check if app is still visible
            app.hide()
        }
        
        // Verify apps were hidden (basic check)
        let stillVisible = NSWorkspace.shared.runningApplications.filter { 
            $0.activationPolicy == .regular && !$0.isHidden 
        }
        
        if !stillVisible.isEmpty {
            throw WindowManagerError.operationFailed("Failed to hide \(stillVisible.count) application(s)")
        }
    }
    
    public static func minimizeApp(named: String) throws {
        // Check accessibility permissions first
        if !checkAccessibilityPermissions() {
            throw WindowManagerError.accessibilityPermissionDenied
        }
        
        let apps = NSWorkspace.shared.runningApplications.filter { ($0.localizedName ?? "") == named }
        
        if apps.isEmpty {
            throw WindowManagerError.appNotFound(named)
        }
        
        var successCount = 0
        var failureCount = 0
        var totalWindows = 0
        var errors: [String] = []
        var permissionErrors = 0
        
        for app in apps {
            do {
                let windows = try getAllWindowElements(of: app)
                totalWindows += windows.count
                
                for window in windows {
                    // Check if window is already minimized
                    var minimized: CFTypeRef?
                    let checkResult = AXUIElementCopyAttributeValue(window, kAXMinimizedAttribute as CFString, &minimized)
                    
                    if checkResult == .success, let isMinimized = minimized as? Bool, isMinimized {
                        // Skip already minimized windows
                        continue
                    }
                    
                    let result = AXUIElementSetAttributeValue(window, kAXMinimizedAttribute as CFString, kCFBooleanTrue)
                    if result == .success {
                        successCount += 1
                    } else {
                        failureCount += 1
                        let errorMsg = "Failed to minimize window in \(named): \(result.rawValue)"
                        errors.append(errorMsg)
                        FileHandle.standardError.write(Data(errorMsg.utf8))
                        FileHandle.standardError.write(Data("\n".utf8))
                        
                        if result == .apiDisabled || result == .noValue {
                            permissionErrors += 1
                        }
                    }
                }
            } catch WindowManagerError.accessibilityPermissionDenied {
                permissionErrors += 1
                let errorMsg = "Accessibility permission denied for app: \(named)"
                errors.append(errorMsg)
                FileHandle.standardError.write(Data(errorMsg.utf8))
                FileHandle.standardError.write(Data("\n".utf8))
            } catch {
                // Other errors - log and continue
                let errorMsg = "Error accessing windows for app \(named): \(error.localizedDescription)"
                errors.append(errorMsg)
                FileHandle.standardError.write(Data(errorMsg.utf8))
                FileHandle.standardError.write(Data("\n".utf8))
            }
        }
        
        if totalWindows == 0 {
            if permissionErrors > 0 {
                throw WindowManagerError.accessibilityPermissionDenied
            }
            throw WindowManagerError.noWindowsFound
        }
        
        if failureCount > 0 {
            let errorMsg = "Failed to minimize \(failureCount)/\(totalWindows) windows in \(named)"
            if failureCount == totalWindows || permissionErrors > 0 {
                throw WindowManagerError.accessibilityPermissionDenied
            } else {
                throw WindowManagerError.operationFailed("\(errorMsg). Details: \(errors.joined(separator: "; "))")
            }
        }
    }
    
    public static func minimizeAllWindowsExcluding(excludeAppName: String) throws {
        // Check accessibility permissions first
        if !checkAccessibilityPermissions() {
            throw WindowManagerError.accessibilityPermissionDenied
        }
        
        let apps = NSWorkspace.shared.runningApplications.filter {
            $0.activationPolicy == .regular && ($0.localizedName ?? "") != excludeAppName
        }
        
        if apps.isEmpty {
            throw WindowManagerError.noWindowsFound
        }
        
        var successCount = 0
        var failureCount = 0
        var totalWindows = 0
        var errors: [String] = []
        var permissionErrors = 0
        
        for app in apps {
            do {
                let windows = try getAllWindowElements(of: app)
                totalWindows += windows.count
                
                for window in windows {
                    // Check if window is already minimized
                    var minimized: CFTypeRef?
                    let checkResult = AXUIElementCopyAttributeValue(window, kAXMinimizedAttribute as CFString, &minimized)
                    
                    if checkResult == .success, let isMinimized = minimized as? Bool, isMinimized {
                        // Skip already minimized windows
                        continue
                    }
                    
                    let result = AXUIElementSetAttributeValue(window, kAXMinimizedAttribute as CFString, kCFBooleanTrue)
                    if result == .success {
                        successCount += 1
                    } else {
                        failureCount += 1
                        let errorMsg = "Failed to minimize window: \(result.rawValue)"
                        errors.append(errorMsg)
                        FileHandle.standardError.write(Data(errorMsg.utf8))
                        FileHandle.standardError.write(Data("\n".utf8))
                        
                        if result == .apiDisabled || result == .noValue {
                            permissionErrors += 1
                        }
                    }
                }
            } catch WindowManagerError.accessibilityPermissionDenied {
                permissionErrors += 1
                let errorMsg = "Accessibility permission denied for app: \(app.localizedName ?? "Unknown")"
                errors.append(errorMsg)
                FileHandle.standardError.write(Data(errorMsg.utf8))
                FileHandle.standardError.write(Data("\n".utf8))
            } catch {
                // Other errors - log and continue
                let errorMsg = "Error accessing windows for app \(app.localizedName ?? "Unknown"): \(error.localizedDescription)"
                errors.append(errorMsg)
                FileHandle.standardError.write(Data(errorMsg.utf8))
                FileHandle.standardError.write(Data("\n".utf8))
            }
        }
        
        if totalWindows == 0 {
            if permissionErrors > 0 {
                throw WindowManagerError.accessibilityPermissionDenied
            }
            throw WindowManagerError.noWindowsFound
        }
        
        if failureCount > 0 {
            let errorMsg = "Failed to minimize \(failureCount)/\(totalWindows) windows"
            if failureCount == totalWindows || permissionErrors > 0 {
                throw WindowManagerError.accessibilityPermissionDenied
            } else {
                throw WindowManagerError.operationFailed("\(errorMsg). Details: \(errors.joined(separator: "; "))")
            }
        }
    }
}

