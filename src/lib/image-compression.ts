/**
 * Compresses an image file by resizing and reducing quality using HTML Canvas.
 * Returns a Promise that resolves to a Base64 string.
 * 
 * @param file The original File object
 * @param maxWidth Maximum width of the output image (default 1200px)
 * @param quality Quality from 0 to 1 (default 0.7)
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                // Draw and compress
                ctx.fillStyle = 'white'; // Handle transparent PNGs turning black
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // Export as JPEG for maximum compression (even if source was PNG, unless transparency is critical key requirement, but generally for "photos" jpeg is safer for size)
                // If we want to preserve transparency, we'd need to check file type, but PNG compression is worse.
                // Meeting notes usually don't need transparency. Let's default to JPEG.
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };

            img.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
    });
}

/**
 * Compresses an image file and returns a Blob suitable for uploading to Supabase Storage.
 * Uses the same resize/quality logic as compressImage but avoids base64 encoding overhead.
 */
export async function compressImageToBlob(file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Canvas toBlob returned null"));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
    });
}
