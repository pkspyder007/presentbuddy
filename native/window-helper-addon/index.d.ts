export interface WindowManagerResult {
  success: boolean;
  minimized?: number;
  restored?: number;
  total?: number;
  error: string;
  errorCode: string;
}

export interface WindowHelper {
  requestPermission(): boolean;
  minimizeAllWindows(): WindowManagerResult;
  restoreAllWindows(): WindowManagerResult;
  hideAllApps(): WindowManagerResult;
  minimizeApp(appName: string): WindowManagerResult;
  minimizeAllWindowsExcluding(excludeAppName: string): WindowManagerResult;
  checkAccessibilityPermissions(): boolean;
}

declare const windowHelper: WindowHelper;
export default windowHelper;

