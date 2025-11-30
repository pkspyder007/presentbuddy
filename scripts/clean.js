#!/usr/bin/env node

/**
 * Cleanup script to remove old build outputs
 * Removes dist/ and dist-electron/ directories
 */

const fs = require('fs');
const path = require('path');

const dirsToClean = ['dist', 'dist-electron'];

console.log('🧹 Cleaning build outputs...');

dirsToClean.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir);
  
  if (fs.existsSync(dirPath)) {
    console.log(`  Removing ${dir}/...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`  ✓ Removed ${dir}/`);
  } else {
    console.log(`  ${dir}/ does not exist, skipping...`);
  }
});

console.log('✨ Cleanup complete!');

