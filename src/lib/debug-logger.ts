import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'debug-action.log');

export function logDebug(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data, null, 2) : ''}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
}
