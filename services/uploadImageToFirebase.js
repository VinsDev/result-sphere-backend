const { bucket } = require('../config/firebaseConfig');

/**
 * Uploads an image to Firebase Storage.
 * @param {Object} imageFile - The image file buffer and metadata.
 * @param {string} folder - The folder in Firebase Storage to upload the image to.
 * @returns {Promise<string>} - Returns the public URL of the uploaded image.
 */

async function uploadImageToFirebase(imageFile, folder) {
    if (!imageFile) {
      return null; // Return null if no image file is provided
    }
  
    try {
      const fileName = `${folder}/${Date.now()}-${imageFile.originalname}`; // Create a unique filename
      const fileUpload = bucket.file(fileName);
  
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: imageFile.mimetype,
        },
      });
  
      // Return a promise that resolves with the public URL
      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('Error uploading to Firebase:', error);
          reject('Error uploading file.');
        });
  
        stream.on('finish', async () => {
          await fileUpload.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
          resolve(publicUrl);
        });
  
        stream.end(imageFile.buffer);
      });
    } catch (error) {
      console.error('Error handling upload:', error);
      throw new Error('Internal server error.');
    }
  }
  
  module.exports = { uploadImageToFirebase };