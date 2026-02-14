# PWA Icons Setup

To complete the PWA setup, you need to create the following icon files:

## Required Icons

1. **icon-192.png** (192x192 pixels)
   - Used for Android home screen
   - Should be a PNG file with transparent or colored background

2. **icon-512.png** (512x512 pixels)
   - Used for splash screens and high-resolution displays
   - Should be a PNG file with transparent or colored background

## Quick Setup Options

### Option 1: Use Online Tool
1. Go to https://realfavicongenerator.net/ or https://www.pwa-icon-generator.com/
2. Upload your logo or icon design (use the icon.svg in this folder as reference)
3. Download the generated icons
4. Rename them to `icon-192.png` and `icon-512.png`
5. Place them in the `/public` folder

### Option 2: Use ImageMagick (Command Line)
```bash
# If you have a high-res logo.png file:
convert logo.png -resize 192x192 icon-192.png
convert logo.png -resize 512x512 icon-512.png
```

### Option 3: Use Design Tool
1. Open Figma/Sketch/Photoshop
2. Create artboards of 192x192 and 512x512
3. Design your app icon based on the icon.svg reference
4. Export as PNG files

## Design Guidelines

- Use a solid background color (#0b0f19 to match the app theme)
- Keep important content within 80% of the icon area (safe zone)
- Ensure the icon looks good at small sizes
- Use high contrast colors for visibility
- Test on both light and dark wallpapers

## Color Palette (from app)
- Background: #0b0f19 (dark blue)
- Primary gradient: #8B5CF6 (purple) to #06B6D4 (cyan)
- Accent: #7afdff (cyan), #e8a8ff (purple)

## Testing
After adding the icons, test the PWA by:
1. Opening the app in Chrome/Safari mobile
2. Selecting "Add to Home Screen"
3. Verifying the icon appears correctly on your home screen
