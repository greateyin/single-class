export const getEmailTemplate = (
    title: string,
    message: string,
    buttonText: string,
    buttonUrl: string
) => {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Single Class";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">${appName}</h1>
            </div>

            <!-- Content Card -->
            <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 20px;">${title}</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
                    ${message}
                </p>

                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${buttonUrl}" style="background-color: #000000; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                        ${buttonText}
                    </a>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin-bottom: 0;">
                    If the button above doesn't work, verify by copying and pasting this link into your browser:
                    <br>
                    <a href="${buttonUrl}" style="color: #000000; text-decoration: underline; word-break: break-all;">${buttonUrl}</a>
                </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};
