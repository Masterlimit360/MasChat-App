# MasChat Loading Screen Setup

This guide explains how the loading screen is configured to show your app logo during Expo bundling and downloading.

## What is the Loading Screen?

The loading screen appears when:
1. **First app launch**: When Expo is downloading the JavaScript bundle
2. **Development**: When the Metro bundler is compiling your code
3. **Hot reloading**: When changes are being applied

## Current Configuration

### 1. Loading Screen Configuration
The loading screen is configured in both `app.json` and `App.config.js`:

```json
{
  "loading": {
    "icon": "./assets/GROUP 88-MasChat.png",
    "backgroundColor": "#1A1A2E"
  }
}
```

### 2. Splash Screen Configuration
The splash screen (which appears after loading) is also configured:

```json
{
  "splash": {
    "image": "./assets/GROUP 88-MasChat.png",
    "resizeMode": "contain",
    "backgroundColor": "#4361EE"
  }
}
```

## How It Works

### Development Flow:
1. **App Launch** → Loading screen with your logo (while bundling)
2. **Bundle Ready** → Splash screen with your logo
3. **App Ready** → Your app's main screen

### Production Flow:
1. **App Launch** → Native splash screen with your logo
2. **App Ready** → Your app's main screen

## Files Modified

- `app.json` - Added loading screen configuration
- `App.config.js` - Added loading screen configuration
- `metro.config.js` - Ensures proper asset handling
- `expo-env.d.ts` - TypeScript declarations for assets

## Testing the Loading Screen

### Development Testing:
1. Run `npx expo start --clear`
2. Close the app completely
3. Reopen the app
4. You should see your logo during the loading phase

### Production Testing:
1. Build the app: `eas build --platform all`
2. Install on device
3. The loading screen should show your logo

## Customization

### Change Loading Icon:
Update the `icon` path in the loading configuration:
```json
{
  "loading": {
    "icon": "./assets/your-logo.png",
    "backgroundColor": "#your-color"
  }
}
```

### Change Background Color:
Update the `backgroundColor` in the loading configuration:
```json
{
  "loading": {
    "icon": "./assets/GROUP 88-MasChat.png",
    "backgroundColor": "#your-background-color"
  }
}
```

### Supported Image Formats:
- PNG (recommended)
- JPG/JPEG
- GIF
- SVG (with proper configuration)

## Troubleshooting

### Loading Screen Not Showing:
1. Clear cache: `npx expo start --clear`
2. Check asset path is correct
3. Ensure image file exists
4. Restart Expo development server

### Wrong Image:
1. Verify the image path in `app.json` and `App.config.js`
2. Check that the image file exists
3. Ensure the image is properly formatted

### Performance Issues:
1. Use optimized PNG images
2. Keep image size reasonable (under 1MB)
3. Use appropriate image dimensions

## Best Practices

### Image Requirements:
- **Format**: PNG (recommended for best quality)
- **Size**: 1024x1024px or larger
- **Background**: Transparent or matching your app theme
- **File Size**: Under 1MB for optimal performance

### Design Guidelines:
- Use your app logo prominently
- Ensure good contrast with background
- Keep it simple and recognizable
- Test on different device sizes

## Next Steps

1. **Test the loading screen** on different devices
2. **Optimize the image** if needed
3. **Test in production** builds
4. **Consider dark mode** variants if needed

## Support

If you encounter issues:
1. Check the Expo documentation on loading screens
2. Verify asset paths and formats
3. Test on different devices
4. Check console logs for errors 