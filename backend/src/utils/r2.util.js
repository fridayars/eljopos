const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const AppError = require('./app.error');
const logger = require('./logger.util');

const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ACCOUNT_URL,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

/**
 * Upload an image buffer to R2, converting to WebP first
 * @param {Buffer} fileBuffer
 * @param {string} folder - Folder name in bucket (e.g., 'products', 'users')
 * @returns {Promise<{url: string, key: string}>}
 */
const uploadImageAsWebp = async (fileBuffer, folder = 'images') => {
    try {
        // Convert the image to webp
        const webpBuffer = await sharp(fileBuffer)
            .webp({ quality: 80 })
            .toBuffer();

        const fileName = `${uuidv4()}.webp`;
        const fileKey = `${folder}/${fileName}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: fileKey,
            Body: webpBuffer,
            ContentType: 'image/webp',
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        const url = `${PUBLIC_URL}/${fileKey}`; // typically PUBLIC_URL doesn't end with slash

        return {
            url,
            key: fileKey
        };
    } catch (error) {
        logger.error({ type: 'r2_upload_error', message: error.message, stack: error.stack });
        throw new AppError('Failed to upload image', 500);
    }
};

/**
 * Delete an object from R2 by key
 * @param {string} fileKey
 */
const deleteImage = async (fileKey) => {
    try {
        if (!fileKey) return;

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: fileKey,
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
    } catch (error) {
        logger.error({ type: 'r2_delete_error', message: error.message, stack: error.stack });
    }
};

module.exports = {
    s3Client,
    uploadImageAsWebp,
    deleteImage
};
