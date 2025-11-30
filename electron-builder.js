const { existsSync, statSync } = require('fs');
const path = require('path');

/**
 * Electron Builder Configuration
 * 
 * This script configures how the Electron app is packaged for distribution.
 * It bundles the React output, native helpers, and assets for all platforms.
 */

// Logging helpers
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  section: (msg) => console.log(`\n📦 ${msg}`),
};

// Get file size in human-readable format
function getFileSize(filePath) {
  try {
    const stats = statSync(filePath);
    const bytes = stats.size;
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  } catch {
    return 'unknown';
  }
}

// Log build configuration
function logBuildConfig() {
  log.section('Electron Builder Configuration');
  log.info(`App ID: com.presentbuddy`);
  log.info(`Product Name: PresentBuddy`);
  log.info(`Output Directory: dist/`);
  
  // Check build outputs
  log.section('Checking Build Outputs');
  const distElectron = existsSync('dist-electron');
  const dist = existsSync('dist');
  
  if (distElectron) {
    log.success('dist-electron/ exists');
  } else {
    log.warn('dist-electron/ not found - make sure to run tsc first');
  }
  
  if (dist) {
    log.success('dist/ exists');
    // Check for index.html
    if (existsSync('dist/index.html')) {
      log.success('dist/index.html found');
    } else {
      log.warn('dist/index.html not found - make sure to run vite build first');
    }
  } else {
    log.warn('dist/ not found - make sure to run vite build first');
  }
  
  // Check native helpers
  log.section('Checking Native Helpers');
  const macHelper = existsSync('native/window-helper/bin/MacWindowHelper');
  const winHelper = existsSync('native/window-helper/bin/WindowHelper');
  const macAddon = existsSync('native/window-helper-addon/build/Release/window_helper.node');
  
  if (macHelper) {
    const size = getFileSize('native/window-helper/bin/MacWindowHelper');
    log.success(`MacWindowHelper found (${size})`);
  } else {
    log.warn('MacWindowHelper not found - will be skipped for macOS builds');
  }
  
  if (macAddon) {
    const size = getFileSize('native/window-helper-addon/build/Release/window_helper.node');
    log.success(`Window Helper Addon found (${size})`);
  } else {
    log.warn('Window Helper Addon not found - run npm run build:window-helper-addon first');
  }
  
  if (winHelper) {
    const size = getFileSize('native/window-helper/bin/WindowHelper');
    log.success(`WindowHelper found (${size})`);
  } else {
    log.warn('WindowHelper not found - will be skipped for Windows/Linux builds');
  }
  
  // Check assets
  log.section('Checking Assets');
  const assets = [
    { path: 'assets/icons/icon.icns', platform: 'macOS' },
    { path: 'assets/icons/icon.ico', platform: 'Windows' },
    { path: 'assets/icons/icon.png', platform: 'Linux' },
    { path: 'assets/wallpapers/default.jpg', platform: 'All' },
  ];
  
  assets.forEach(({ path: assetPath, platform }) => {
    if (existsSync(assetPath)) {
      const size = getFileSize(assetPath);
      log.success(`${path.basename(assetPath)} found (${size}) - ${platform}`);
    } else {
      log.warn(`${path.basename(assetPath)} not found - ${platform}`);
    }
  });
  
  console.log('');
}

// Only log during build time (when electron-builder is running)
// Check if we're being run by electron-builder (not in the packaged app)
const isBuildTime = process.argv.some(arg => 
  arg.includes('electron-builder') || 
  arg.includes('electron') ||
  process.env.npm_lifecycle_event?.includes('build')
);

if (isBuildTime) {
  logBuildConfig();
}

module.exports = {
  appId: 'com.presentbuddy',
  productName: 'PresentBuddy',
  copyright: 'Copyright © 2025',

  directories: {
    buildResources: 'build',
    output: 'dist',
  },

  // Include all necessary files in the app package
  files: [
    // Electron main and preload processes
    'dist-electron/**/*',
    // React renderer output (HTML, JS, CSS)
    'dist/**/*',
    // Package metadata
    'package.json',
    // Exclude source files and dev dependencies
    '!src/**/*',
    '!node_modules/**/*',
    '!native/**/*',
    '!assets/**/*',
    '!*.md',
    '!*.config.*',
    '!electron-builder.js',
    '!scripts/**/*',
    '!.git/**/*',
    '!.vscode/**/*',
    '!.idea/**/*',
  ],

  // Platform-specific configurations
  win: {
    target: ['nsis', 'portable'],
    icon: 'assets/icons/icon.ico',
    // Windows-specific resources
    extraResources: [
      // Bundle assets so they're accessible at runtime
      {
        from: 'assets',
        to: 'assets',
      },
      // Include Windows helper if it exists (electron-builder will skip if file doesn't exist)
      ...(existsSync('native/window-helper/bin/WindowHelper')
        ? [
            {
              from: 'native/window-helper/bin/WindowHelper',
              to: 'WindowHelper',
            },
          ]
        : []),
    ],
  },

  mac: {
    target: ['dmg'],
    icon: 'assets/icons/icon.icns',
    category: 'public.app-category.utilities',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    // macOS-specific resources
    extraResources: [
      // Bundle assets so they're accessible at runtime via process.resourcesPath
      {
        from: 'assets',
        to: 'assets',
      },
      // Include macOS window helper addon
      ...(existsSync('native/window-helper-addon/build/Release/window_helper.node')
        ? [
            {
              from: 'native/window-helper-addon',
              to: 'native/window-helper-addon',
              filter: ['**/*.node', '**/*.js', '**/*.d.ts', 'package.json'],
            },
          ]
        : []),
      // Include macOS window helper binary (legacy, can be removed later)
      ...(existsSync('native/window-helper/bin/MacWindowHelper')
        ? [
            {
              from: 'native/window-helper/bin/MacWindowHelper',
              to: 'MacWindowHelper',
            },
          ]
        : []),
    ],
  },

  linux: {
    target: ['AppImage', 'deb', 'rpm'],
    icon: 'assets/icons/icon.png',
    category: 'Utility',
    // Linux-specific resources
    extraResources: [
      // Bundle assets so they're accessible at runtime
      {
        from: 'assets',
        to: 'assets',
      },
      // Include Linux helper if it exists (electron-builder will skip if file doesn't exist)
      ...(existsSync('native/window-helper/bin/WindowHelper')
        ? [
            {
              from: 'native/window-helper/bin/WindowHelper',
              to: 'WindowHelper',
            },
          ]
        : []),
    ],
  },

  // NSIS installer configuration (Windows)
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },

  // DMG configuration (macOS)
  dmg: {
    contents: [
      {
        x: 130,
        y: 220,
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications',
      },
    ],
    background: null,
    iconSize: 128,
    window: {
      width: 540,
      height: 380,
    },
  },

  // Hooks for logging during build
  afterPack: async (context) => {
    try {
      log.section('Packaging Complete');
      if (context.packager) {
        const platform = context.packager.platform?.name || context.packager.platform || 'unknown';
        const arch = context.arch || 'unknown';
        log.info(`Platform: ${platform}`);
        log.info(`Arch: ${arch}`);
      }
      if (context.appOutDir) {
        log.info(`App Directory: ${context.appOutDir}`);
      }
      if (context.appOutDir && context.packager?.appInfo?.productFilename) {
        const appPath = path.join(context.appOutDir, context.packager.appInfo.productFilename);
        if (existsSync(appPath)) {
          const size = getFileSize(appPath);
          log.success(`App packaged: ${size}`);
        }
      }
    } catch (error) {
      // Silently fail if logging causes issues
      console.error('Error in afterPack hook:', error.message);
    }
  },

  afterSign: async (context) => {
    try {
      if (context?.path) {
        log.section('Code Signing Complete');
        log.info(`Signed: ${context.path}`);
      }
    } catch (error) {
      // Silently fail if logging causes issues
    }
  },

  afterAllArtifactBuild: async (context) => {
    try {
      log.section('All Artifacts Built');
      if (context?.artifacts && Array.isArray(context.artifacts)) {
        context.artifacts.forEach((artifact) => {
          if (artifact && existsSync(artifact)) {
            const size = getFileSize(artifact);
            const fileName = path.basename(artifact);
            log.success(`${fileName} (${size})`);
          }
        });
      }
      console.log('');
    } catch (error) {
      // Silently fail if logging causes issues
      console.error('Error in afterAllArtifactBuild hook:', error.message);
    }
  },
};

