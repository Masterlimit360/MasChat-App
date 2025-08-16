# Cloudinary Integration Setup

## Overview
This app now uses Cloudinary for storing images and videos in the cloud. All media uploads (profile pictures, post images, chat images, videos) are now stored in your Cloudinary account.

## Your Cloudinary Credentials
- **Cloud Name**: dqaocubzz
- **API Key**: 291534954615135
- **Secret Key**: mwGjhX1K6G_svSdM-EbzxfL0hJs

## Installation Steps

### 1. Install Dependencies
Run this command in your project root directory:

```bash
npm install
```

### 2. Cloudinary Configuration
The Cloudinary service is already configured with your credentials in:
`app/lib/services/cloudinaryService.ts`

### 3. Upload Preset Setup (IMPORTANT)
You need to create an upload preset in your Cloudinary dashboard:

1. Go to your Cloudinary Dashboard: https://cloudinary.com/console
2. Navigate to Settings > Upload
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. Set the following:
   - **Preset name**: `ml_default` (or change it in the code)
   - **Signing Mode**: `Unsigned`
   - **Folder**: `maschat` (optional)
6. Click "Save"

### 4. Troubleshooting 400 Errors
If you get a 400 error, try these steps:

1. **Check Upload Preset**: Make sure the preset exists and is set to "Unsigned"
2. **Test Connection**: Use the test function in your app:
   ```typescript
   import { testCloudinaryConnection } from '../lib/services/cloudinaryService';
   
   // Test the connection
   const isWorking = await testCloudinaryConnection();
   console.log('Cloudinary working:', isWorking);
   ```

3. **Check Console Logs**: Look for detailed error messages in the console
4. **Verify Credentials**: Double-check your cloud name, API key, and secret

## Features Implemented

### Image Uploads
- **Profile Pictures**: Stored in `maschat/profilePicture/`
- **Cover Photos**: Stored in `maschat/coverPhoto/`
- **Avatars**: Stored in `maschat/avatar/`
- **Post Images**: Stored in `maschat/posts/`
- **Chat Images**: Stored in `maschat/general/`

### Video Uploads
- **Post Videos**: Stored in `maschat/posts/videos/`

### Functions Available
- `uploadImageToCloudinary(imageUri, folder)` - Upload images
- `uploadVideoToCloudinary(videoUri, folder)` - Upload videos
- `deleteFromCloudinary(publicId, resourceType)` - Delete files
- `getOptimizedImageUrl(url, transformations)` - Get optimized URLs

## Usage Examples

### Upload Profile Picture
```typescript
import { uploadImage } from '../lib/services/userService';

const imageUrl = await uploadImage(imageUri, 'profilePicture', userId);
```

### Upload Post Image
```typescript
import { uploadImageToCloudinary } from '../lib/services/cloudinaryService';

const imageUrl = await uploadImageToCloudinary(imageUri, 'maschat/posts');
```

### Upload Chat Image
```typescript
import { uploadImageSimple } from '../lib/services/userService';

const imageUrl = await uploadImageSimple(imageUri);
```

## Security Notes
- The API secret is included in the client-side code for demonstration
- In production, upload signatures should be generated server-side
- Consider using signed uploads for better security

## File Organization in Cloudinary
```
maschat/
├── profilePicture/
├── coverPhoto/
├── avatar/
├── posts/
│   └── videos/
└── general/
```

## Error Handling
The service includes comprehensive error handling for:
- Network failures
- Invalid file formats
- File size limits
- Upload failures

## Performance Optimizations
- Images are automatically optimized by Cloudinary
- Use `getOptimizedImageUrl()` for responsive images
- Videos are automatically transcoded for web delivery 