import ImageKit from 'imagekit';

if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.warn('ImageKit environment variables are missing. File uploads will fail.');
}

export const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
});

/**
 * Uploads a file to ImageKit
 * @param file Buffer or File
 * @param fileName Name of the file
 * @param folder Folder in ImageKit
 * @returns Upload response
 */
export async function uploadToImageKit(file: Buffer | string, fileName: string, folder: string = '/uploads') {
    return new Promise<any>((resolve, reject) => {
        imagekit.upload({
            file,
            fileName,
            folder
        }, (error, result) => {
            if (error) {
                console.error('ImageKit Upload Error:', error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}
