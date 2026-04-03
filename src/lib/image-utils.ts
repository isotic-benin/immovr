/**
 * Compresse une image côté client avant l'upload.
 * @param file Le fichier original
 * @param maxWidth La largeur maximale souhaitée
 * @param quality La qualité JPEG (0.1 à 1.0)
 * @param maxSizeBytes Taille maximale en bytes avant compression obligatoire (défaut: 2MB)
 * @returns Un objet contenant le fichier (compressé ou original) et les infos de compression
 */
export async function compressImage(
    file: File, 
    maxWidth = 1200, 
    quality = 0.8,
    maxSizeBytes = 2 * 1024 * 1024 // 2MB par défaut
): Promise<{ file: File; wasCompressed: boolean; originalSize: number; finalSize: number }> {
    const originalSize = file.size;
    const originalSizeKB = (originalSize / 1024).toFixed(2);
    
    // Si ce n'est pas une image, on retourne le fichier original
    if (!file.type.startsWith('image/')) {
        console.log(`[Upload] Fichier non-image: ${file.name} (${originalSizeKB}KB)`);
        return { 
            file, 
            wasCompressed: false, 
            originalSize, 
            finalSize: originalSize 
        };
    }

    // Si le fichier est déjà petit, ne pas compresser
    if (originalSize < maxSizeBytes) {
        console.log(`[Upload] Fichier léger: ${file.name} (${originalSizeKB}KB) - Pas de compression`);
        return { 
            file, 
            wasCompressed: false, 
            originalSize, 
            finalSize: originalSize 
        };
    }

    console.log(`[Upload] Fichier lourd détecté: ${file.name} (${originalSizeKB}KB) - Compression en cours...`);

    return new Promise((resolve, reject) => {
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
                    console.log(`[Upload] Erreur Canvas - Fichier original renvoyé`);
                    resolve({ 
                        file, 
                        wasCompressed: false, 
                        originalSize, 
                        finalSize: originalSize 
                    });
                    return;
                }
                
                // Forcer un fond blanc pour les PNG avec transparence si converti en JPEG
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File(
                                [blob], 
                                file.name.replace(/\.[^/.]+$/, "") + ".jpg", 
                                { 
                                    type: "image/jpeg",
                                    lastModified: Date.now()
                                }
                            );
                            const finalSize = blob.size;
                            const finalSizeKB = (finalSize / 1024).toFixed(2);
                            const reductionPercent = (((originalSize - finalSize) / originalSize) * 100).toFixed(1);
                            
                            console.log(
                                `[Upload] ✅ Compression réussie: ${file.name}\n` +
                                `   Avant: ${originalSizeKB}KB\n` +
                                `   Après: ${finalSizeKB}KB\n` +
                                `   Réduction: ${reductionPercent}%`
                            );
                            
                            resolve({ 
                                file: compressedFile, 
                                wasCompressed: true, 
                                originalSize, 
                                finalSize 
                            });
                        } else {
                            console.log(`[Upload] Erreur Blob - Fichier original renvoyé`);
                            resolve({ 
                                file, 
                                wasCompressed: false, 
                                originalSize, 
                                finalSize: originalSize 
                            });
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };
            img.onerror = (err) => {
                console.error(`[Upload] Erreur chargement image`, err);
                reject(err);
            };
        };
        reader.onerror = (err) => {
            console.error(`[Upload] Erreur FileReader`, err);
            reject(err);
        };
    });
}
