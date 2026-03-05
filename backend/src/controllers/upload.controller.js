const { uploadImageAsWebp, deleteImage: deleteImageFromR2 } = require('../utils/r2.util');

/**
 * Upload an image to R2
 * POST /api/upload/image
 */
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const folder = req.body.folder || 'uploads';

        const result = await uploadImageAsWebp(req.file.buffer, folder);

        return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteImage = async (req, res, next) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, message: 'Image URL is required' });
        }

        const publicUrl = process.env.R2_PUBLIC_URL;

        if (!url.startsWith(publicUrl)) {
            return res.status(400).json({ success: false, message: 'Invalid image URL domain' });
        }

        // Slice the key from the url
        // e.g. https://pub-xxxx.r2.dev/uploads/uuid.webp -> uploads/uuid.webp
        const fileKey = url.replace(`${publicUrl}/`, '');

        await deleteImageFromR2(fileKey);

        return res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadImage,
    deleteImage
};
