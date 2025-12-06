'use server';

import { db } from '@/db';
import { systemSettings } from '@/db/schema';
import { enforceAdminRole } from '@/lib/auth-guards';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getSystemSettings() {
    // Public read is simplified for now, or might need protection depending on data
    // For payments on/off, public read is essentially implied by the enroll page behavior,
    // but better to fetch server-side cleanly.

    // Ensure singleton exists
    let settings = await db.query.systemSettings.findFirst();

    if (!settings) {
        // Create default if missing
        await db.insert(systemSettings).values({
            id: true,
            stripeEnabled: true,
            paypalEnabled: true,
        }).onConflictDoNothing();
        settings = await db.query.systemSettings.findFirst();
    }

    return settings;
}

export async function updateSystemSettings(data: { stripeEnabled: boolean; paypalEnabled: boolean }) {
    await enforceAdminRole();

    await db.update(systemSettings)
        .set(data)
        .where(eq(systemSettings.id, true));

    revalidatePath('/admin/settings');
    revalidatePath('/enroll'); // Essential to update enroll page immediately
}
