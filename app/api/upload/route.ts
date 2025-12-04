import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { enforceAdminRole } from '@/lib/auth-guards';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onBeforeGenerateToken: async (_pathname, _clientPayload) => {
                // Ensure user is admin before allowing upload
                await enforceAdminRole();

                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4', 'application/zip'],
                    tokenPayload: JSON.stringify({
                        // optional, sent to your server on upload completion
                        // you could pass user id here
                    }),
                };
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onUploadCompleted: async ({ blob, tokenPayload: _tokenPayload }) => {
                // This is called via webhook after upload completes
                // You can use this to update DB if you want to trust the webhook
                // But for simplicity we will update DB from client action for now
                // or we can just log it here.
                console.log('blob uploaded', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }, // The webhook will retry 5 times automatically
        );
    }
}
