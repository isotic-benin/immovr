/**
 * Compresse une image côté client avant l'upload.
 * @param file Le fichier original
 * @param maxWidth La largeur maximale souhaitée
 * @param quality La qualité JPEG (0.1 à 1.0)
 * @returns Un nouveau File compressé (JPEG)
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        // Si ce n'est pas une image, on retourne le fichier original
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Calculer les nouvelles dimensions tout en gardant le ratio
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve(file); // Fallback if canvas context is not supported
                    return;
                }
                
                // Forcer un fond blanc pour les PNG avec transparence si converti en JPEG
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Créer un nouveau fichier à partir du blob
                            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { 
                                type: "image/jpeg",
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file); // Fallback
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
