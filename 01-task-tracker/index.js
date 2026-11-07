    import fs from 'node:fs';
    import path from 'node:path';
    import { fileURLToPath } from 'node:url';

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const FILE_PATH = path.join(__dirname, 'tasks.json');

    function readTasks() {
        if (fs.existsSync(FILE_PATH)) {
            return [];
        }
        try {
            const data = fs.readFileSync(FILE_PATH, 'utf8');
            return JSON.parse(data || '[]');
        } catch (error) {
            console.error("Error reading tasks file:", error.message);
            return [];
        }
    }

    readTasks();