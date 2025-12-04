import 'dotenv/config';

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
    console.log('❌ STRIPE_SECRET_KEY is missing.');
} else {
    console.log(`✅ STRIPE_SECRET_KEY is present. Length: ${key.length}`);

    if (key.startsWith(' ')) {
        console.log('❌ Error: Key starts with a space.');
    }
    if (key.endsWith(' ')) {
        console.log('❌ Error: Key ends with a space.');
    }
    if (key.includes('\n')) {
        console.log('❌ Error: Key contains a newline character.');
    }
    if (key.includes('\r')) {
        console.log('❌ Error: Key contains a carriage return character.');
    }

    // Check for other invisible characters
    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
        console.log('⚠️ Warning: Key contains non-alphanumeric characters (underscores are okay). This might be normal for test keys (sk_test_...), but check for hidden chars.');
        // Print char codes for debugging (safe as it doesn't show the key)
        const invalidChars = key.split('').map((c, i) => {
            if (!/[a-zA-Z0-9_]/.test(c)) {
                return `Index ${i}: Code ${c.charCodeAt(0)}`;
            }
            return null;
        }).filter(Boolean);
        if (invalidChars.length > 0) {
            console.log('Suspicious characters found:', invalidChars.join(', '));
        }
    } else {
        console.log('✅ Key format looks clean (alphanumeric + underscores).');
    }
}
