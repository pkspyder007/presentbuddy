import Cocoa
import ApplicationServices

// MARK: - Window Manager

public struct WindowManager {
    // MARK: - Helpers
    
    static func getAllWindowElements(of app: NSRunningApplication) -> [AXUIElement] {
        let axApp = AXUIElementCreateApplication(app.processIdentifier)
        
        var value: CFTypeRef?
        let result = AXUIElementCopyAttributeValue(axApp, kAXWindowsAttribute as CFString, &value)
        
        if result == .success, let windows = value as? [AXUIElement] {
            return windows
        }
        return []
    }
    
    // MARK: - Actions
    
    public static func minimizeAllWindows() {
        let apps = NSWorkspace.shared.runningApplications.filter { $0.activationPolicy == .regular }
        for app in apps {
            let windows = getAllWindowElements(of: app)
            for window in windows {
                AXUIElementSetAttributeValue(window, kAXMinimizedAttribute as CFString, kCFBooleanTrue)
            }
        }
    }
    
    public static func restoreAllWindows() {
        let apps = NSWorkspace.shared.runningApplications.filter { $0.activationPolicy == .regular }
        
        for app in apps {
            let windows = getAllWindowElements(of: app)
            
            for window in windows {
                var minimized: CFTypeRef?
                let res = AXUIElementCopyAttributeValue(window, kAXMinimizedAttribute as CFString, &minimized)
                
                if res == .success,
                   let minimizedValue = minimized as? Bool,
                   minimizedValue == true {
                    
                    AXUIElementSetAttributeValue(window, kAXMinimizedAttribute as CFString, kCFBooleanFalse)
                }
            }
            
            // Bring app to front if any window was restored
            app.activate(options: .activateAllWindows)
        }
    }
    
    public static func hideAllApps() {
        let apps = NSWorkspace.shared.runningApplications.filter { $0.activationPolicy == .regular }
        for app in apps { app.hide() }
    }
    
    public static func minimizeApp(named: String) {
        let apps = NSWorkspace.shared.runningApplications.filter { ($0.localizedName ?? "") == named }
        
        for app in apps {
            let windows = getAllWindowElements(of: app)
            for window in windows {
                AXUIElementSetAttributeValue(window, kAXMinimizedAttribute as CFString, kCFBooleanTrue)
            }
        }
    }
    
    public static func minimizeAllWindowsExcluding(excludeAppName: String) {
        let apps = NSWorkspace.shared.runningApplications.filter {
            $0.activationPolicy == .regular && ($0.localizedName ?? "") != excludeAppName
        }
        for app in apps {
            let windows = getAllWindowElements(of: app)
            for window in windows {
                AXUIElementSetAttributeValue(window, kAXMinimizedAttribute as CFString, kCFBooleanTrue)
            }
        }
    }
}

