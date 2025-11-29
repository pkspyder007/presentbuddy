#!/bin/bash
set -e

# Generate platform-specific icons from SVG
# Requires: ImageMagick or Inkscape

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

SVG_ICON="$SCRIPT_DIR/icon.svg"
TRAY_SVG="$SCRIPT_DIR/trayTemplate.svg"

echo "Generating icons for PresentBuddy..."

# Check for required tools
if command -v convert &> /dev/null; then
    CONVERTER="imagemagick"
elif command -v inkscape &> /dev/null; then
    CONVERTER="inkscape"
else
    echo "Error: Neither ImageMagick nor Inkscape found."
    echo "Please install one of them:"
    echo "  macOS: brew install imagemagick"
    echo "  macOS: brew install inkscape"
    echo "  Linux: sudo apt-get install imagemagick"
    echo "  Linux: sudo apt-get install inkscape"
    exit 1
fi

# Generate Linux PNG (512x512)
echo "Generating Linux icon (icon.png)..."
if [ "$CONVERTER" = "imagemagick" ]; then
    convert -background none -resize 512x512 "$SVG_ICON" "$SCRIPT_DIR/icon.png"
elif [ "$CONVERTER" = "inkscape" ]; then
    inkscape --export-type=png --export-filename="$SCRIPT_DIR/icon.png" --export-width=512 --export-height=512 "$SVG_ICON"
fi

# Generate macOS ICNS (requires iconutil or multiple sizes)
echo "Generating macOS icon (icon.icns)..."
if [ "$CONVERTER" = "imagemagick" ]; then
    # Create iconset directory
    ICONSET_DIR="$SCRIPT_DIR/icon.iconset"
    rm -rf "$ICONSET_DIR"
    mkdir -p "$ICONSET_DIR"
    
    # Generate all required sizes for macOS
    sizes=(16 32 64 128 256 512 1024)
    for size in "${sizes[@]}"; do
        convert -background none -resize "${size}x${size}" "$SVG_ICON" "$ICONSET_DIR/icon_${size}x${size}.png"
        # Also generate @2x versions
        convert -background none -resize "$((size * 2))x$((size * 2))" "$SVG_ICON" "$ICONSET_DIR/icon_${size}x${size}@2x.png"
    done
    
    # Convert to ICNS
    iconutil -c icns "$ICONSET_DIR" -o "$SCRIPT_DIR/icon.icns"
    rm -rf "$ICONSET_DIR"
elif [ "$CONVERTER" = "inkscape" ]; then
    ICONSET_DIR="$SCRIPT_DIR/icon.iconset"
    rm -rf "$ICONSET_DIR"
    mkdir -p "$ICONSET_DIR"
    
    sizes=(16 32 64 128 256 512 1024)
    for size in "${sizes[@]}"; do
        inkscape --export-type=png --export-filename="$ICONSET_DIR/icon_${size}x${size}.png" --export-width="$size" --export-height="$size" "$SVG_ICON"
        inkscape --export-type=png --export-filename="$ICONSET_DIR/icon_${size}x${size}@2x.png" --export-width="$((size * 2))" --export-height="$((size * 2))" "$SVG_ICON"
    done
    
    iconutil -c icns "$ICONSET_DIR" -o "$SCRIPT_DIR/icon.icns"
    rm -rf "$ICONSET_DIR"
fi

# Generate Windows ICO (requires multiple sizes)
echo "Generating Windows icon (icon.ico)..."
if [ "$CONVERTER" = "imagemagick" ]; then
    # Generate multiple sizes for ICO
    convert -background none "$SVG_ICON" \
        \( -clone 0 -resize 16x16 \) \
        \( -clone 0 -resize 32x32 \) \
        \( -clone 0 -resize 48x48 \) \
        \( -clone 0 -resize 64x64 \) \
        \( -clone 0 -resize 128x128 \) \
        \( -clone 0 -resize 256x256 \) \
        -delete 0 "$SCRIPT_DIR/icon.ico"
elif [ "$CONVERTER" = "inkscape" ]; then
    # Inkscape doesn't directly create ICO, so we'll create PNG and convert
    inkscape --export-type=png --export-filename="$SCRIPT_DIR/icon_temp.png" --export-width=256 --export-height=256 "$SVG_ICON"
    convert "$SCRIPT_DIR/icon_temp.png" \
        \( -clone 0 -resize 16x16 \) \
        \( -clone 0 -resize 32x32 \) \
        \( -clone 0 -resize 48x48 \) \
        \( -clone 0 -resize 64x64 \) \
        \( -clone 0 -resize 128x128 \) \
        -delete 0 "$SCRIPT_DIR/icon.ico"
    rm -f "$SCRIPT_DIR/icon_temp.png"
fi

# Generate tray template PNG (22x22 for macOS, 16x16 for others)
echo "Generating tray icon (trayTemplate.png)..."
if [ "$CONVERTER" = "imagemagick" ]; then
    convert -background none -resize 22x22 "$TRAY_SVG" "$SCRIPT_DIR/trayTemplate.png"
elif [ "$CONVERTER" = "inkscape" ]; then
    inkscape --export-type=png --export-filename="$SCRIPT_DIR/trayTemplate.png" --export-width=22 --export-height=22 "$TRAY_SVG"
fi

# Also create a 16x16 version for Windows/Linux
if [ "$CONVERTER" = "imagemagick" ]; then
    convert -background none -resize 16x16 "$TRAY_SVG" "$SCRIPT_DIR/trayIcon16.png"
elif [ "$CONVERTER" = "inkscape" ]; then
    inkscape --export-type=png --export-filename="$SCRIPT_DIR/trayIcon16.png" --export-width=16 --export-height=16 "$TRAY_SVG"
fi

echo "✓ Icons generated successfully!"
echo ""
echo "Generated files:"
echo "  - icon.png (Linux)"
echo "  - icon.icns (macOS)"
echo "  - icon.ico (Windows)"
echo "  - trayTemplate.png (macOS tray)"
echo "  - trayIcon16.png (Windows/Linux tray)"

