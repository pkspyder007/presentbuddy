# Icons

This directory contains app icons for all platforms.

## Icon Files

- `icon.svg` - Source SVG icon (512x512) - **Edit this to change the icon design**
- `trayTemplate.svg` - Source SVG for macOS tray icon (monochrome template)
- `icon.png` - Linux icon (512x512 PNG) - Generated from SVG
- `icon.icns` - macOS icon (multi-resolution ICNS) - Generated from SVG
- `icon.ico` - Windows icon (multi-resolution ICO) - Generated from SVG
- `trayTemplate.png` - macOS tray icon (22x22, monochrome template)
- `trayIcon16.png` - Windows/Linux tray icon (16x16)

## Generating Icons

To generate all platform-specific icons from the SVG source:

```bash
cd assets/icons
./generate-icons.sh
```

### Requirements

The script requires either:
- **ImageMagick** (`brew install imagemagick` on macOS, `sudo apt-get install imagemagick` on Linux)
- **Inkscape** (`brew install inkscape` on macOS, `sudo apt-get install inkscape` on Linux)

### What It Does

The script generates:
1. `icon.png` - 512x512 PNG for Linux
2. `icon.icns` - Multi-resolution ICNS for macOS (includes all required sizes)
3. `icon.ico` - Multi-resolution ICO for Windows (includes 16, 32, 48, 64, 128, 256px)
4. `trayTemplate.png` - 22x22 template icon for macOS tray
5. `trayIcon16.png` - 16x16 icon for Windows/Linux tray

## Customizing the Icon

1. Edit `icon.svg` in a vector graphics editor (Inkscape, Adobe Illustrator, Figma, etc.)
2. The design should work well at small sizes (16x16 for tray)
3. For macOS tray, edit `trayTemplate.svg` - it should be monochrome and will be tinted by the system
4. Run `./generate-icons.sh` to regenerate all formats

## Icon Design

The current icon features:
- A monitor/screen representing presentation display
- Clean presentation slide lines
- Professional gradient background (indigo to purple)
- Sparkle accent representing polish/preparation

## Manual Generation (Alternative)

If you prefer to use online tools:

1. **For PNG/ICO**: Use [CloudConvert](https://cloudconvert.com/svg-to-png) or [Convertio](https://convertio.co/svg-png/)
2. **For ICNS**: Use [CloudConvert](https://cloudconvert.com/svg-to-icns) or [iConvert Icons](https://iconverticons.com/)
3. **For ICO**: Use [CloudConvert](https://cloudconvert.com/svg-to-ico) or [ICO Convert](https://icoconvert.com/)

Make sure to generate multiple sizes:
- **PNG**: 512x512 (Linux), 16x16, 22x22 (tray)
- **ICNS**: Include sizes 16, 32, 64, 128, 256, 512, 1024 (with @2x versions)
- **ICO**: Include sizes 16, 32, 48, 64, 128, 256
