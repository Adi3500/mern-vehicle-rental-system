const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const uploadsRoot = path.join(process.cwd(), 'uploads');
const vehicleUploadsDir = path.join(uploadsRoot, 'vehicles');
const avatarUploadsDir = path.join(uploadsRoot, 'avatars');
const verificationUploadsDir = path.join(uploadsRoot, 'verification');

[uploadsRoot, vehicleUploadsDir, avatarUploadsDir, verificationUploadsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const hasCloudinaryCredentials = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

const isCloudinaryEnabled = process.env.USE_CLOUDINARY === 'true' && hasCloudinaryCredentials;

if (hasCloudinaryCredentials) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

const getServerBaseUrl = () =>
    (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

const buildDiskStorage = (targetDir) =>
    multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, targetDir),
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname || '').toLowerCase();
            const safeExtension = extension || '.jpg';
            cb(null, `${Date.now()}-${crypto.randomUUID()}${safeExtension}`);
        },
    });

const buildDiskStorageByField = (fieldDirectoryMap, fallbackDir) =>
    multer.diskStorage({
        destination: (_req, file, cb) => cb(null, fieldDirectoryMap[file.fieldname] || fallbackDir),
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname || '').toLowerCase();
            const safeExtension = extension || '.jpg';
            cb(null, `${Date.now()}-${crypto.randomUUID()}${safeExtension}`);
        },
    });

const vehicleStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'vehicle-rental/vehicles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
    },
});

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'vehicle-rental/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    },
});

const verificationStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'vehicle-rental/verification',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
        resource_type: 'auto',
    },
});

const vehicleAssetStorage = new CloudinaryStorage({
    cloudinary,
    params: async(_req, file) => {
        if (file.fieldname === 'licenseDocument') {
            return {
                folder: 'vehicle-rental/verification',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                resource_type: 'image',
            };
        }

        return {
            folder: 'vehicle-rental/vehicles',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
        };
    },
});

const profileAssetStorage = new CloudinaryStorage({
    cloudinary,
    params: async(_req, file) => {
        if (file.fieldname === 'licenseDocument') {
            return {
                folder: 'vehicle-rental/verification',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                resource_type: 'image',
            };
        }

        return {
            folder: 'vehicle-rental/avatars',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
        };
    },
});

const createUploader = (storage, allowedMimePatterns = [/^image\//]) => multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (allowedMimePatterns.some((pattern) => pattern.test(file.mimetype))) {
            return cb(null, true);
        }
        cb(new Error('Only supported verification files are allowed'), false);
    },
});

const uploadVehicleImages = createUploader(
    isCloudinaryEnabled ? vehicleStorage : buildDiskStorage(vehicleUploadsDir)
);

const uploadVehicleAssets = createUploader(
    isCloudinaryEnabled ?
        vehicleAssetStorage :
        buildDiskStorageByField({ licenseDocument: verificationUploadsDir }, vehicleUploadsDir)
);

const uploadAvatar = multer({
    storage: isCloudinaryEnabled ? avatarStorage : buildDiskStorage(avatarUploadsDir),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) return cb(null, true);
        cb(new Error('Only image files are allowed'), false);
    },
});

const uploadProfileAssets = createUploader(
    isCloudinaryEnabled ?
        profileAssetStorage :
        buildDiskStorageByField({ avatar: avatarUploadsDir, licenseDocument: verificationUploadsDir }, avatarUploadsDir)
);

const uploadVerificationDocument = createUploader(
    isCloudinaryEnabled ? verificationStorage : buildDiskStorage(verificationUploadsDir),
    [/^image\//, /^application\/pdf$/]
);

const buildUploadedFileMeta = (file, folder) => {
    if (isCloudinaryEnabled) {
        return {
            url: file.path,
            publicId: file.filename,
        };
    }

    return {
        url: `${getServerBaseUrl()}/uploads/${folder}/${encodeURIComponent(file.filename)}`,
        publicId: `local:${folder}/${file.filename}`,
    };
};

const destroyUploadedFile = async(publicId) => {
    if (!publicId) {
        return;
    }

    if (publicId.startsWith('local:')) {
        const relativePath = publicId.replace(/^local:/, '');
        const absolutePath = path.join(uploadsRoot, ...relativePath.split('/'));

        try {
            await fs.promises.unlink(absolutePath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        return;
    }

    if (hasCloudinaryCredentials) {
        await cloudinary.uploader.destroy(publicId);
    }
};

module.exports = {
    cloudinary,
    uploadVehicleImages,
    uploadVehicleAssets,
    uploadAvatar,
    uploadProfileAssets,
    uploadVerificationDocument,
    uploadsRoot,
    isCloudinaryEnabled,
    buildUploadedFileMeta,
    destroyUploadedFile,
};
