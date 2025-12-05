'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function registerUser(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    };

    const validatedFields = registerSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Invalid input',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, email, password } = validatedFields.data;

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        return {
            success: false,
            message: 'User already exists',
        };
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    try {
        await db.insert(users).values({
            id: crypto.randomUUID(),
            name,
            email,
            hashedPassword,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            role: 'student',
        });

        return {
            success: true,
            message: 'Account created successfully',
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: 'Something went wrong',
        };
    }
}
