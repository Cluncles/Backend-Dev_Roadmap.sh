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

    function saveTasks(tasks) {
        try {
            fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2), 'utf8');
        } catch (error) {
            console.error("Error saving tasks:", error.message);
        }
    }

    function addTask(description) {
        if (!description) {
            console.error("Error: Please provide a task description.");
            return;
        }
        const tasks = readTasks();
        const id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        const now = new Date().toISOString();

        const newTask = {
            id,
            description,
            status: 'todo',
            createdAt: now,
            updatedAt: now
        };
        tasks.push(newTask);
        saveTasks(tasks);
        console.log(`Task added successfully (ID: ${id})`);
    }

    addTask("Finish the project documentation");
