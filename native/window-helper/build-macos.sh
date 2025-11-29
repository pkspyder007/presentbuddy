#!/bin/bash
set -e

# Build the Swift helper for macOS
echo "Building MacWindowHelper..."

# Get the script directory and navigate to it
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Verify we're in the right directory
if [ ! -f "Package.swift" ]; then
    echo "Error: Package.swift not found. Please run this script from native/window-helper directory."
    exit 1
fi

# Build in release mode
echo "Compiling Swift code..."
swift build -c release

# Verify the build output exists
if [ ! -f ".build/release/MacWindowHelper" ]; then
    echo "Error: Build failed. MacWindowHelper binary not found in .build/release/"
    exit 1
fi

# Create bin directory if it doesn't exist
mkdir -p ./bin

# Copy the binary to bin directory
echo "Copying binary to bin/MacWindowHelper..."
cp .build/release/MacWindowHelper ./bin/MacWindowHelper

# Make sure it's executable
chmod +x ./bin/MacWindowHelper

# Verify the copy was successful
if [ -f "./bin/MacWindowHelper" ]; then
    echo "✓ MacWindowHelper built successfully at: $SCRIPT_DIR/bin/MacWindowHelper"
    echo "  Binary size: $(ls -lh ./bin/MacWindowHelper | awk '{print $5}')"
else
    echo "Error: Failed to copy binary to bin/MacWindowHelper"
    exit 1
fi

