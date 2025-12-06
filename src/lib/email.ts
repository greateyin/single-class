import { Resend } from 'resend';

// Use a dummy key for build time if the environment variable is missing.
// This prevents the build from failing during static generation.
// In production, the environment variable MUST be present.
const apiKey = process.env.RESEND_API_KEY || 're_123456789';

export const resend = new Resend(apiKey);
