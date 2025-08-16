// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: 'dqaocubzz',
  apiKey: '291534954615135',
  apiSecret: 'mwGjhX1K6G_svSdM-EbzxfL0hJs',
  uploadPreset: 'MasChat', // Your new upload preset name
  cloudinaryUrl: 'cloudinary://291534954615135:mwGjhX1K6G_svSdM-EbzxfL0hJs@dqaocubzz'
};

/**
 * Upload image to Cloudinary
 * @param imageUri - Local URI of the image or remote URL
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise<string> - Cloudinary URL of uploaded image
 */
export const uploadImageToCloudinary = async (
  imageUri: string,
  folder: string = 'maschat'
): Promise<string> => {
  try {
    console.log('Starting Cloudinary upload...');
    console.log('Image URI:', imageUri);
    console.log('Folder:', folder);
    
    // Handle remote URLs (like AI-generated images)
    if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
      console.log('Remote URL detected, using Cloudinary remote URL upload');
      
      // Use Cloudinary's remote URL upload
      const formData = new FormData();
      formData.append('file', imageUri);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', folder);

      console.log('Uploading remote URL to Cloudinary with:', {
        cloudName: CLOUDINARY_CONFIG.cloudName,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        folder: folder,
        imageUri: imageUri
      });

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      console.log('Cloudinary response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary response error:', errorText);
        console.error('Response status:', response.status);
        
        // Try to parse error for better debugging
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Parsed error:', errorJson);
          if (errorJson.error?.message) {
            throw new Error(`Cloudinary upload failed: ${errorJson.error.message}`);
          }
        } catch (parseError) {
          // If we can't parse the error, use the raw text
        }
        
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Cloudinary upload successful:', result.secure_url);
      return result.secure_url;
    }
    
    // Handle local files (existing logic)
    const isValid = await validateFileForUpload(imageUri, 'image');
    if (!isValid) {
      throw new Error('Invalid image file. Please choose a valid image format (JPEG, PNG, GIF, WebP).');
    }
    
    // Determine file type from URI
    const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = fileExtension === 'png' ? 'image/png' : 
                    fileExtension === 'gif' ? 'image/gif' : 
                    fileExtension === 'webp' ? 'image/webp' : 'image/jpeg';
    
    console.log('Detected file type:', mimeType);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: mimeType,
      name: `image.${fileExtension}`,
    } as any);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);

    console.log('Uploading to Cloudinary with:', {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      folder: folder,
      imageUri: imageUri,
      mimeType: mimeType
    });

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    console.log('Cloudinary response status:', response.status);
    console.log('Cloudinary response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary response error:', errorText);
      console.error('Response status:', response.status);
      
      // Try to parse error for better debugging
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error:', errorJson);
        if (errorJson.error?.message) {
          throw new Error(`Cloudinary upload failed: ${errorJson.error.message}`);
        }
      } catch (parseError) {
        // If we can't parse the error, use the raw text
      }
      
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    if (error.message.includes('Invalid image file')) {
      throw new Error('The selected file is not a valid image. Please choose a JPEG, PNG, GIF, or WebP file.');
    } else if (error.message.includes('File too large')) {
      throw new Error('The image file is too large. Please choose a smaller image (max 10MB).');
    } else if (error.message.includes('Invalid upload preset')) {
      throw new Error('Upload configuration error. Please try again later.');
    } else {
      throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
    }
  }
};

/**
 * Upload video to Cloudinary
 * @param videoUri - Local URI of the video
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise<string> - Cloudinary URL of uploaded video
 */
export const uploadVideoToCloudinary = async (
  videoUri: string,
  folder: string = 'maschat/videos'
): Promise<string> => {
  try {
    console.log('Starting Cloudinary video upload...');
    console.log('Video URI:', videoUri);
    console.log('Folder:', folder);
    
    // Validate the file first
    const isValid = await validateFileForUpload(videoUri, 'video');
    if (!isValid) {
      throw new Error('Invalid video file. Please choose a valid video format (MP4, MOV, AVI, WebM).');
    }

    // Determine file type from URI
    const fileExtension = videoUri.split('.').pop()?.toLowerCase() || 'mp4';
    const mimeType = fileExtension === 'mov' ? 'video/quicktime' : 
                    fileExtension === 'avi' ? 'video/x-msvideo' : 
                    fileExtension === 'wmv' ? 'video/x-ms-wmv' : 
                    fileExtension === 'flv' ? 'video/x-flv' : 
                    fileExtension === 'webm' ? 'video/webm' : 'video/mp4';
    
    console.log('Detected video type:', mimeType);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: videoUri,
      type: mimeType,
      name: `video.${fileExtension}`,
    } as any);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);
    formData.append('resource_type', 'video');

    console.log('Uploading video to Cloudinary with:', {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      folder: folder,
      videoUri: videoUri,
      mimeType: mimeType
    });

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    console.log('Cloudinary video response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary video response error:', errorText);
      console.error('Response status:', response.status);
      
      // Try to parse error for better debugging
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed video error:', errorJson);
        if (errorJson.error?.message) {
          throw new Error(`Cloudinary video upload failed: ${errorJson.error.message}`);
        }
      } catch (parseError) {
        // If we can't parse the error, use the raw text
      }
      
      throw new Error(`Video upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Cloudinary video upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error('Error uploading video to Cloudinary:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    if (error.message.includes('Invalid video file')) {
      throw new Error('The selected file is not a valid video. Please choose an MP4, MOV, AVI, or WebM file.');
    } else if (error.message.includes('File too large')) {
      throw new Error('The video file is too large. Please choose a smaller video (max 100MB).');
    } else if (error.message.includes('Invalid upload preset')) {
      throw new Error('Upload configuration error. Please try again later.');
    } else {
      throw new Error(`Failed to upload video: ${error.message || 'Unknown error'}`);
    }
  }
};

/**
 * Delete file from Cloudinary
 * @param publicId - Public ID of the file in Cloudinary
 * @param resourceType - Type of resource ('image' or 'video')
 * @returns Promise<boolean> - Success status
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<boolean> => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = generateSignature(publicId, timestamp);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    console.log('Cloudinary delete successful');
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

/**
 * Generate signature for Cloudinary API calls
 * @param publicId - Public ID of the file
 * @param timestamp - Current timestamp
 * @returns string - Generated signature
 */
const generateSignature = (publicId: string, timestamp: number): string => {
  // Note: In a production app, this should be done server-side for security
  // This is a simplified version for demonstration
  const params = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_CONFIG.apiSecret}`;
  // You would typically use a crypto library here
  return btoa(params); // This is not secure - use proper crypto in production
};

/**
 * Get optimized image URL with transformations
 * @param originalUrl - Original Cloudinary URL
 * @param transformations - Cloudinary transformations
 * @returns string - Optimized URL
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  transformations: string = 'f_auto,q_auto,w_800'
): string => {
  if (!originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  // Insert transformations into the URL
  const urlParts = originalUrl.split('/upload/');
  if (urlParts.length === 2) {
    return `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`;
  }

  return originalUrl;
};

/**
 * Validate file before uploading to Cloudinary
 * @param fileUri - Local URI of the file
 * @param fileType - Type of file ('image' or 'video')
 * @returns Promise<boolean> - Whether the file is valid
 */
export const validateFileForUpload = async (
  fileUri: string,
  fileType: 'image' | 'video'
): Promise<boolean> => {
  try {
    console.log(`Validating ${fileType} file:`, fileUri);
    
    // Check if file exists
    if (!fileUri || fileUri.trim() === '') {
      console.error('File URI is empty');
      return false;
    }
    
    // Handle remote URLs (like AI-generated images)
    if (fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
      console.log('Remote URL detected, skipping local file validation');
      return true; // Remote URLs are assumed to be valid
    }
    
    // Check file extension for local files
    const fileExtension = fileUri.split('.').pop()?.toLowerCase();
    if (!fileExtension) {
      console.error('No file extension found for local file');
      return false;
    }
    
    // Validate file extensions
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const validVideoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'];
    
    if (fileType === 'image' && !validImageExtensions.includes(fileExtension)) {
      console.error(`Invalid image extension: ${fileExtension}`);
      return false;
    }
    
    if (fileType === 'video' && !validVideoExtensions.includes(fileExtension)) {
      console.error(`Invalid video extension: ${fileExtension}`);
      return false;
    }
    
    console.log(`File validation passed for ${fileType}:`, fileUri);
    return true;
  } catch (error) {
    console.error('File validation error:', error);
    return false;
  }
};

/**
 * Test Cloudinary connection and upload preset
 */
export const testCloudinaryConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Cloud Name:', CLOUDINARY_CONFIG.cloudName);
    console.log('Upload Preset:', CLOUDINARY_CONFIG.uploadPreset);
    
    // Test with a simple text file
    const formData = new FormData();
    formData.append('file', {
      uri: 'data:text/plain;base64,SGVsbG8gV29ybGQ=', // "Hello World" in base64
      type: 'text/plain',
      name: 'test.txt',
    } as any);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'test');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/raw/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary test failed:', errorText);
      console.error('Response status:', response.status);
      return false;
    }

    const result = await response.json();
    console.log('Cloudinary test successful:', result);
    return true;
  } catch (error: any) {
    console.error('Cloudinary test error:', error);
    console.error('Error message:', error.message);
    return false;
  }
};

/**
 * Test Cloudinary upload preset specifically
 */
export const testCloudinaryUploadPreset = async (): Promise<boolean> => {
  try {
    console.log('Testing Cloudinary upload preset...');
    console.log('Upload Preset:', CLOUDINARY_CONFIG.uploadPreset);
    
    // Test with a minimal image upload
    const formData = new FormData();
    formData.append('file', {
      uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      type: 'image/jpeg',
      name: 'test.jpg',
    } as any);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload preset test failed:', errorText);
      console.error('Response status:', response.status);
      
      // Check if it's an upload preset issue
      if (errorText.includes('Invalid upload preset') || errorText.includes('upload_preset')) {
        console.error('Upload preset configuration issue detected');
        return false;
      }
      return false;
    }

    const result = await response.json();
    console.log('Upload preset test successful:', result.secure_url);
    return true;
  } catch (error: any) {
    console.error('Upload preset test error:', error);
    console.error('Error message:', error.message);
    return false;
  }
};

export default {
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  testCloudinaryConnection,
  validateFileForUpload,
}; 