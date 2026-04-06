import cloudinaryService from '../services/cloudinary';

const uploadImageToCloudinary = async (
  file: Express.Multer.File,
): Promise<string | null> => {
  try {
    const response = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinaryService.uploader
          .upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          })
          .end(file.buffer);
      },
    );

    return response.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return null;
  }
};

export default uploadImageToCloudinary;
