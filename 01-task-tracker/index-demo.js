const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'tasks.json');

// Helper to read tasks from the JSON file
function readTasks() {
    if (!fs.existsSync(FILE_PATH)) {
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

// Helper to save tasks to the JSON file
function saveTasks(tasks) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving tasks:", error.message);
    }
}

// Command: Add a task
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

// Command: Update a task description
function updateTask(id, description) {
    if (!id || !description) {
        console.error("Error: Please provide both task ID and new description.");
        return;
    }
    const tasks = readTasks();
    const task = tasks.find(t => t.id === parseInt(id));
    
    if (!task) {
        console.error(`Error: Task with ID ${id} not found.`);
        return;
    }
    
    task.description = description;
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);
    console.log(`Task ${id} updated successfully.`);
}

// Command: Delete a task
function deleteTask(id) {
    if (!id) {
        console.error("Error: Please provide a task ID.");
        return;
    }
    let tasks = readTasks();
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== parseInt(id));
    
    if (tasks.length === initialLength) {
        console.error(`Error: Task with ID ${id} not found.`);
        return;
    }
    
    saveTasks(tasks);
    console.log(`Task ${id} deleted successfully.`);
}

// Command: Update status (in-progress / done)
function updateStatus(id, status) {
    if (!id) {
        console.error("Error: Please provide a task ID.");
        return;
    }
    const tasks = readTasks();
    const task = tasks.find(t => t.id === parseInt(id));
    
    if (!task) {
        console.error(`Error: Task with ID ${id} not found.`);
        return;
    }
    
    task.status = status;
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);
    console.log(`Task ${id} marked as ${status}.`);
}

// Command: List tasks (optional filter)
function listTasks(statusFilter) {
    const tasks = readTasks();
    const filteredTasks = statusFilter 
        ? tasks.filter(t => t.status === statusFilter) 
        : tasks;
        
    if (filteredTasks.length === 0) {
        console.log(statusFilter ? `No tasks found with status: ${statusFilter}` : "No tasks found.");
        return;
    }
    
    console.log(`\n--- Tasks List (${statusFilter || 'all'}) ---`);
    filteredTasks.forEach(t => {
        console.log(`[ID: ${t.id}] ${t.description} | Status: ${t.status} | Created: ${t.createdAt.split('T')[0]}`);
    });
}

// CLI Argument Routing
const [,, command, arg1, arg2] = process.argv;

switch (command) {
    case 'add':
        addTask(arg1);
        break;
    case 'update':
        updateTask(arg1, arg2);
        break;
    case 'delete':
        deleteTask(arg1);
        break;
    case 'mark-in-progress':
        updateStatus(arg1, 'in-progress');
        break;
    case 'mark-done':
        updateStatus(arg1, 'done');
        break;
    case 'list':
        if (arg1 && !['done', 'todo', 'in-progress'].includes(arg1)) {
            console.error("Error: Invalid list filter. Use 'done', 'todo', or 'in-progress'.");
        } else {
            listTasks(arg1);
        }
        break;
    default:
        console.log(`
Usage:
  node task.js add "Task description"
  node task.js update <id> "New description"
  node task.js delete <id>
  node task.js mark-in-progress <id>
  node task.js mark-done <id>
  node task.js list [todo|in-progress|done]
        `);
}
