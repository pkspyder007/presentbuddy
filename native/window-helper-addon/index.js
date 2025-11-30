const addon = require('./build/Release/window_helper.node');

module.exports = {
  requestPermission: () => addon.requestPermission(),
  minimizeAllWindows: () => addon.minimizeAllWindows(),
  restoreAllWindows: () => addon.restoreAllWindows(),
  hideAllApps: () => addon.hideAllApps(),
  minimizeApp: (appName) => addon.minimizeApp(appName),
  minimizeAllWindowsExcluding: (excludeAppName) => addon.minimizeAllWindowsExcluding(excludeAppName),
  checkAccessibilityPermissions: () => addon.checkAccessibilityPermissions(),
};

