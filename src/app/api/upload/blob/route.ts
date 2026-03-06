import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (
                pathname,
                /* clientPayload */
            ) => {
                // Vérifier l'authentification de l'admin
                const session = await getServerSession(authOptions);
                if (!session) {
                    throw new Error('Non autorisé');
                }

                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    tokenPayload: JSON.stringify({
                        userId: session.user?.id,
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Cette fonction est appelée une fois l'upload terminé
                console.log('Upload terminé avec succès:', blob.url, tokenPayload);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}
