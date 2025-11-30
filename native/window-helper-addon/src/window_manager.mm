#import <Cocoa/Cocoa.h>
#import <ApplicationServices/ApplicationServices.h>
#include "window_manager.h"
#include <string>
#include <vector>

// Helper function to check accessibility permissions
bool CheckAccessibilityPermissionsNative() {
    NSArray* runningApps = [[NSWorkspace sharedWorkspace] runningApplications];
    NSRunningApplication* testApp = nil;
    
    for (NSRunningApplication* app in runningApps) {
        if ([app activationPolicy] == NSApplicationActivationPolicyRegular) {
            testApp = app;
            break;
        }
    }
    
    if (!testApp) {
        return false;
    }
    
    AXUIElementRef axApp = AXUIElementCreateApplication([testApp processIdentifier]);
    CFTypeRef value = nil;
    AXError result = AXUIElementCopyAttributeValue(axApp, kAXWindowsAttribute, &value);
    
    if (value) {
        CFRelease(value);
    }
    CFRelease(axApp);
    
    return result == kAXErrorSuccess;
}

// Request accessibility permission
bool RequestAccessibilityPermission() {
    NSDictionary* options = @{(__bridge NSString*)kAXTrustedCheckOptionPrompt: @YES};
    Boolean trusted = AXIsProcessTrustedWithOptions((__bridge CFDictionaryRef)options);
    
    if (!trusted) {
        [NSThread sleepForTimeInterval:1.0];
    }
    
    return trusted;
}

// Get all window elements for an app
std::vector<AXUIElementRef> GetAllWindowElements(NSRunningApplication* app) {
    std::vector<AXUIElementRef> windows;
    
    AXUIElementRef axApp = AXUIElementCreateApplication([app processIdentifier]);
    CFTypeRef value = nil;
    AXError result = AXUIElementCopyAttributeValue(axApp, kAXWindowsAttribute, &value);
    
    if (result == kAXErrorSuccess && value) {
        CFArrayRef windowsArray = (CFArrayRef)value;
        CFIndex count = CFArrayGetCount(windowsArray);
        
        for (CFIndex i = 0; i < count; i++) {
            AXUIElementRef window = (AXUIElementRef)CFArrayGetValueAtIndex(windowsArray, i);
            CFRetain(window);
            windows.push_back(window);
        }
        
        CFRelease(value);
    }
    
    CFRelease(axApp);
    return windows;
}

// Minimize all windows
WindowManagerResult MinimizeAllWindowsNative() {
    WindowManagerResult result = {false, 0, 0, 0, "", ""};
    
    if (!CheckAccessibilityPermissionsNative()) {
        result.error = "Accessibility permissions are required. Please enable them in System Settings > Privacy & Security > Accessibility.";
        result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        return result;
    }
    
    NSArray* apps = [[NSWorkspace sharedWorkspace] runningApplications];
    NSMutableArray* regularApps = [NSMutableArray array];
    
    for (NSRunningApplication* app in apps) {
        if ([app activationPolicy] == NSApplicationActivationPolicyRegular) {
            [regularApps addObject:app];
        }
    }
    
    if ([regularApps count] == 0) {
        result.error = "No windows found to perform the operation.";
        result.errorCode = "NO_WINDOWS_FOUND";
        return result;
    }
    
    int successCount = 0;
    int failureCount = 0;
    int totalWindows = 0;
    int permissionErrors = 0;
    
    for (NSRunningApplication* app in regularApps) {
        @try {
            std::vector<AXUIElementRef> windows = GetAllWindowElements(app);
            totalWindows += (int)windows.size();
            
            for (AXUIElementRef window : windows) {
                // Check if already minimized
                CFTypeRef minimizedValue = nil;
                AXError checkResult = AXUIElementCopyAttributeValue(window, kAXMinimizedAttribute, &minimizedValue);
                
                if (checkResult == kAXErrorSuccess && minimizedValue) {
                    Boolean isMinimized = CFBooleanGetValue((CFBooleanRef)minimizedValue);
                    if (isMinimized) {
                        CFRelease(minimizedValue);
                        CFRelease(window);
                        continue;
                    }
                    CFRelease(minimizedValue);
                }
                
                // Minimize the window
                CFBooleanRef trueValue = kCFBooleanTrue;
                AXError minimizeResult = AXUIElementSetAttributeValue(window, kAXMinimizedAttribute, trueValue);
                
                if (minimizeResult == kAXErrorSuccess) {
                    successCount++;
                } else {
                    failureCount++;
                    if (minimizeResult == kAXErrorAPIDisabled || minimizeResult == kAXErrorNoValue) {
                        permissionErrors++;
                    }
                }
                
                CFRelease(window);
            }
        } @catch (NSException* exception) {
            failureCount++;
        }
    }
    
    result.total = totalWindows;
    result.minimized = successCount;
    
    if (totalWindows == 0) {
        if (permissionErrors > 0) {
            result.error = "Accessibility permissions are required.";
            result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        } else {
            result.error = "No windows found to perform the operation.";
            result.errorCode = "NO_WINDOWS_FOUND";
        }
        return result;
    }
    
    if (failureCount > 0) {
        if (failureCount == totalWindows || permissionErrors > 0) {
            result.error = "Accessibility permissions are required.";
            result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        } else {
            result.error = "Failed to minimize " + std::to_string(failureCount) + "/" + std::to_string(totalWindows) + " windows.";
            result.errorCode = "OPERATION_FAILED";
        }
        return result;
    }
    
    result.success = true;
    return result;
}

// Restore all windows
WindowManagerResult RestoreAllWindowsNative() {
    WindowManagerResult result = {false, 0, 0, 0, "", ""};
    
    if (!CheckAccessibilityPermissionsNative()) {
        result.error = "Accessibility permissions are required. Please enable them in System Settings > Privacy & Security > Accessibility.";
        result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        return result;
    }
    
    NSArray* apps = [[NSWorkspace sharedWorkspace] runningApplications];
    NSMutableArray* regularApps = [NSMutableArray array];
    
    for (NSRunningApplication* app in apps) {
        if ([app activationPolicy] == NSApplicationActivationPolicyRegular) {
            [regularApps addObject:app];
        }
    }
    
    if ([regularApps count] == 0) {
        result.error = "No windows found to perform the operation.";
        result.errorCode = "NO_WINDOWS_FOUND";
        return result;
    }
    
    int successCount = 0;
    int failureCount = 0;
    int totalRestored = 0;
    int permissionErrors = 0;
    
    for (NSRunningApplication* app in regularApps) {
        @try {
            std::vector<AXUIElementRef> windows = GetAllWindowElements(app);
            bool shouldActivate = false;
            
            for (AXUIElementRef window : windows) {
                CFTypeRef minimizedValue = nil;
                AXError checkResult = AXUIElementCopyAttributeValue(window, kAXMinimizedAttribute, &minimizedValue);
                
                if (checkResult == kAXErrorSuccess && minimizedValue) {
                    Boolean isMinimized = CFBooleanGetValue((CFBooleanRef)minimizedValue);
                    if (isMinimized) {
                        totalRestored++;
                        shouldActivate = true;
                        
                        CFBooleanRef falseValue = kCFBooleanFalse;
                        AXError restoreResult = AXUIElementSetAttributeValue(window, kAXMinimizedAttribute, falseValue);
                        
                        if (restoreResult == kAXErrorSuccess) {
                            successCount++;
                        } else {
                            failureCount++;
                            if (restoreResult == kAXErrorAPIDisabled || restoreResult == kAXErrorNoValue) {
                                permissionErrors++;
                            }
                        }
                    }
                    CFRelease(minimizedValue);
                }
                
                CFRelease(window);
            }
            
            if (shouldActivate) {
                [app activateWithOptions:NSApplicationActivateAllWindows];
            }
        } @catch (NSException* exception) {
            failureCount++;
        }
    }
    
    result.total = totalRestored;
    result.restored = successCount;
    
    if (totalRestored == 0) {
        if (permissionErrors > 0) {
            result.error = "Accessibility permissions are required.";
            result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        } else {
            result.error = "No windows found to perform the operation.";
            result.errorCode = "NO_WINDOWS_FOUND";
        }
        return result;
    }
    
    if (failureCount > 0) {
        if (failureCount == totalRestored || permissionErrors > 0) {
            result.error = "Accessibility permissions are required.";
            result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        } else {
            result.error = "Failed to restore " + std::to_string(failureCount) + "/" + std::to_string(totalRestored) + " windows.";
            result.errorCode = "OPERATION_FAILED";
        }
        return result;
    }
    
    result.success = true;
    return result;
}

// Hide all apps
WindowManagerResult HideAllAppsNative() {
    WindowManagerResult result = {false, 0, 0, 0, "", ""};
    
    NSArray* apps = [[NSWorkspace sharedWorkspace] runningApplications];
    NSMutableArray* regularApps = [NSMutableArray array];
    
    for (NSRunningApplication* app in apps) {
        if ([app activationPolicy] == NSApplicationActivationPolicyRegular) {
            [regularApps addObject:app];
        }
    }
    
    if ([regularApps count] == 0) {
        result.error = "No applications found.";
        result.errorCode = "NO_WINDOWS_FOUND";
        return result;
    }
    
    for (NSRunningApplication* app in regularApps) {
        [app hide];
    }
    
    // Verify apps were hidden
    NSArray* stillVisible = [[NSWorkspace sharedWorkspace] runningApplications];
    int visibleCount = 0;
    for (NSRunningApplication* app in stillVisible) {
        if ([app activationPolicy] == NSApplicationActivationPolicyRegular && ![app isHidden]) {
            visibleCount++;
        }
    }
    
    if (visibleCount > 0) {
        result.error = "Failed to hide " + std::to_string(visibleCount) + " application(s).";
        result.errorCode = "OPERATION_FAILED";
        return result;
    }
    
    result.success = true;
    return result;
}

// Minimize specific app
WindowManagerResult MinimizeAppNative(const std::string& appName) {
    WindowManagerResult result = {false, 0, 0, 0, "", ""};
    
    if (!CheckAccessibilityPermissionsNative()) {
        result.error = "Accessibility permissions are required. Please enable them in System Settings > Privacy & Security > Accessibility.";
        result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        return result;
    }
    
    NSString* nsAppName = [NSString stringWithUTF8String:appName.c_str()];
    NSArray* apps = [[NSWorkspace sharedWorkspace] runningApplications];
    NSMutableArray* matchingApps = [NSMutableArray array];
    
    for (NSRunningApplication* app in apps) {
        if ([[app localizedName] isEqualToString:nsAppName]) {
            [matchingApps addObject:app];
        }
    }
    
    if ([matchingApps count] == 0) {
        result.error = "Application '" + appName + "' not found.";
        result.errorCode = "APP_NOT_FOUND";
        return result;
    }
    
    int successCount = 0;
    int failureCount = 0;
    int totalWindows = 0;
    int permissionErrors = 0;
    
    for (NSRunningApplication* app in matchingApps) {
        @try {
            std::vector<AXUIElementRef> windows = GetAllWindowElements(app);
            totalWindows += (int)windows.size();
            
            for (AXUIElementRef window : windows) {
                CFTypeRef minimizedValue = nil;
                AXError checkResult = AXUIElementCopyAttributeValue(window, kAXMinimizedAttribute, &minimizedValue);
                
                if (checkResult == kAXErrorSuccess && minimizedValue) {
                    Boolean isMinimized = CFBooleanGetValue((CFBooleanRef)minimizedValue);
                    if (isMinimized) {
                        CFRelease(minimizedValue);
                        CFRelease(window);
                        continue;
                    }
                    CFRelease(minimizedValue);
                }
                
                CFBooleanRef trueValue = kCFBooleanTrue;
                AXError minimizeResult = AXUIElementSetAttributeValue(window, kAXMinimizedAttribute, trueValue);
                
                if (minimizeResult == kAXErrorSuccess) {
                    successCount++;
                } else {
                    failureCount++;
                    if (minimizeResult == kAXErrorAPIDisabled || minimizeResult == kAXErrorNoValue) {
                        permissionErrors++;
                    }
                }
                
                CFRelease(window);
            }
        } @catch (NSException* exception) {
            failureCount++;
        }
    }
    
    result.total = totalWindows;
    result.minimized = successCount;
    
    if (totalWindows == 0) {
        if (permissionErrors > 0) {
            result.error = "Accessibility permissions are required.";
            result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        } else {
            result.error = "No windows found to perform the operation.";
            result.errorCode = "NO_WINDOWS_FOUND";
        }
        return result;
    }
    
    if (failureCount > 0) {
        if (failureCount == totalWindows || permissionErrors > 0) {
            result.error = "Accessibility permissions are required.";
            result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        } else {
            result.error = "Failed to minimize " + std::to_string(failureCount) + "/" + std::to_string(totalWindows) + " windows in " + appName + ".";
            result.errorCode = "OPERATION_FAILED";
        }
        return result;
    }
    
    result.success = true;
    return result;
}

// Minimize all windows except specified app
WindowManagerResult MinimizeAllWindowsExcludingNative(const std::string& excludeAppName) {
    WindowManagerResult result = {false, 0, 0, 0, "", ""};
    
    if (!CheckAccessibilityPermissionsNative()) {
        result.error = "Accessibility permissions are required. Please enable them in System Settings > Privacy & Security > Accessibility.";
        result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        return result;
    }
    
    NSString* nsExcludeAppName = [NSString stringWithUTF8String:excludeAppName.c_str()];
    NSArray* apps = [[NSWorkspace sharedWorkspace] runningApplications];
    NSMutableArray* regularApps = [NSMutableArray array];
    
    for (NSRunningApplication* app in apps) {
        if ([app activationPolicy] == NSApplicationActivationPolicyRegular &&
            ![[app localizedName] isEqualToString:nsExcludeAppName]) {
            [regularApps addObject:app];
        }
    }
    
    if ([regularApps count] == 0) {
        result.error = "No windows found to perform the operation.";
        result.errorCode = "NO_WINDOWS_FOUND";
        return result;
    }
    
    int successCount = 0;
    int failureCount = 0;
    int totalWindows = 0;
    int permissionErrors = 0;
    
    for (NSRunningApplication* app in regularApps) {
        @try {
            std::vector<AXUIElementRef> windows = GetAllWindowElements(app);
            totalWindows += (int)windows.size();
            
            for (AXUIElementRef window : windows) {
                CFTypeRef minimizedValue = nil;
                AXError checkResult = AXUIElementCopyAttributeValue(window, kAXMinimizedAttribute, &minimizedValue);
                
                if (checkResult == kAXErrorSuccess && minimizedValue) {
                    Boolean isMinimized = CFBooleanGetValue((CFBooleanRef)minimizedValue);
                    if (isMinimized) {
                        CFRelease(minimizedValue);
                        CFRelease(window);
                        continue;
                    }
                    CFRelease(minimizedValue);
                }
                
                CFBooleanRef trueValue = kCFBooleanTrue;
                AXError minimizeResult = AXUIElementSetAttributeValue(window, kAXMinimizedAttribute, trueValue);
                
                if (minimizeResult == kAXErrorSuccess) {
                    successCount++;
                } else {
                    failureCount++;
                    if (minimizeResult == kAXErrorAPIDisabled || minimizeResult == kAXErrorNoValue) {
                        permissionErrors++;
                    }
                }
                
                CFRelease(window);
            }
        } @catch (NSException* exception) {
            failureCount++;
        }
    }
    
    result.total = totalWindows;
    result.minimized = successCount;
    
    if (totalWindows == 0) {
        if (permissionErrors > 0) {
            result.error = "Accessibility permissions are required.";
            result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        } else {
            result.error = "No windows found to perform the operation.";
            result.errorCode = "NO_WINDOWS_FOUND";
        }
        return result;
    }
    
    if (failureCount > 0) {
        if (failureCount == totalWindows || permissionErrors > 0) {
            result.error = "Accessibility permissions are required.";
            result.errorCode = "ACCESSIBILITY_PERMISSION_DENIED";
        } else {
            result.error = "Failed to minimize " + std::to_string(failureCount) + "/" + std::to_string(totalWindows) + " windows.";
            result.errorCode = "OPERATION_FAILED";
        }
        return result;
    }
    
    result.success = true;
    return result;
}

