#!/bin/bash
set -e

# Code sign the MacWindowHelper binary for macOS
# 
# This script requires the MAC_CERT_NAME environment variable to be set
# to the name of your code signing certificate.
#
# To set the certificate name:
#   export MAC_CERT_NAME="Developer ID Application: Your Name (TEAM_ID)"
#
# Or add it to your shell profile (~/.zshrc or ~/.bash_profile):
#   export MAC_CERT_NAME="Developer ID Application: Your Name (TEAM_ID)"
#
# To list available certificates:
#   security find-identity -v -p codesigning

# Navigate to the script's directory
cd "$(dirname "$0")"

# Check if binary exists
if [ ! -f "./bin/MacWindowHelper" ]; then
    echo "Error: MacWindowHelper binary not found at ./bin/MacWindowHelper"
    echo "Please run build-macos.sh first to build the binary."
    exit 1
fi

# Check if certificate name is set
if [ -z "$MAC_CERT_NAME" ]; then
    echo "Error: MAC_CERT_NAME environment variable is not set."
    echo ""
    echo "Please set it to your code signing certificate name:"
    echo "  export MAC_CERT_NAME=\"Developer ID Application: Your Name (TEAM_ID)\""
    echo ""
    echo "To list available certificates, run:"
    echo "  security find-identity -v -p codesigning"
    exit 1
fi

# Check if entitlements file exists
ENTITLEMENTS_FILE="$(dirname "$0")/entitlements.plist"
if [ ! -f "$ENTITLEMENTS_FILE" ]; then
    echo "Error: Entitlements file not found at $ENTITLEMENTS_FILE"
    exit 1
fi

echo "Code signing MacWindowHelper with certificate: $MAC_CERT_NAME"

# Sign the binary with entitlements
codesign --force \
         --deep \
         --sign "$MAC_CERT_NAME" \
         --entitlements "$ENTITLEMENTS_FILE" \
         --options runtime \
         ./bin/MacWindowHelper

# Verify the signature
echo "Verifying signature..."
codesign --verify --verbose ./bin/MacWindowHelper

echo "MacWindowHelper signed successfully!"

