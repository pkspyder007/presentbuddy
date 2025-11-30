#ifndef WINDOW_MANAGER_H
#define WINDOW_MANAGER_H

#include <string>

struct WindowManagerResult {
  bool success;
  int minimized;
  int restored;
  int total;
  std::string error;
  std::string errorCode;
};

// Request accessibility permission
bool RequestAccessibilityPermission();

// Check accessibility permissions
bool CheckAccessibilityPermissionsNative();

// Minimize all windows
WindowManagerResult MinimizeAllWindowsNative();

// Restore all windows
WindowManagerResult RestoreAllWindowsNative();

// Hide all apps
WindowManagerResult HideAllAppsNative();

// Minimize specific app
WindowManagerResult MinimizeAppNative(const std::string& appName);

// Minimize all windows except specified app
WindowManagerResult MinimizeAllWindowsExcludingNative(const std::string& excludeAppName);

#endif // WINDOW_MANAGER_H

