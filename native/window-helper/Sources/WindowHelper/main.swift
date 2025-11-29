import Foundation

// MARK: - CLI

func printUsage() {
    print("""
    MacWindowHelper – macOS window manager

    Commands:
      minimize-all                    Minimizes all windows across all apps
      minimize-all-except <name>      Minimizes all windows except the specified app
      restore-all                     Restores all minimized windows across all apps
      hide-all                        Hides all applications
      minimize-app <name>              Minimizes windows of a specific app
    """)
}

let args = CommandLine.arguments

guard args.count >= 2 else {
    printUsage()
    exit(0)
}

switch args[1] {
case "minimize-all":
    WindowManager.minimizeAllWindows()
case "minimize-all-except":
    if args.count >= 3 {
        WindowManager.minimizeAllWindowsExcluding(excludeAppName: args[2])
    } else {
        print("Usage: minimize-all-except <AppName>")
        exit(1)
    }
case "restore-all":
    WindowManager.restoreAllWindows()
case "hide-all":
    WindowManager.hideAllApps()
case "minimize-app":
    if args.count >= 3 {
        WindowManager.minimizeApp(named: args[2])
    } else {
        print("Usage: minimize-app <AppName>")
        exit(1)
    }
default:
    printUsage()
    exit(1)
}

