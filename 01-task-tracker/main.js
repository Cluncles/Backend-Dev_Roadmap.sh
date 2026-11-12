#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const tasksFilePath = path.join(__dirname, "tasks.json");

    function readTasks() {
      try {
        const data = fs.readFileSync(tasksFilePath, "utf-8");
        const tasks = JSON.parse(data);
        return tasks;
      } catch (error) {
        if (error.code === "ENOENT") {
          return [];
        } else {
          throw error;
        }
      }
    }

    function saveTasks(tasks) {
      try {
        fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2), "utf-8");
      } catch (error) {
        console.error("Error saving tasks:", error);
      }
    }

    function addTask(description) {
      if (!description) {
        console.error("Error: Please provide a task description.");
        return;
      }
      const tasks = readTasks();
      const id = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
      const now = new Date().toISOString();

      const newTask = {
        id,
        description,
        status: "todo",
        createdAt: now,
        updatedAt: now,
      };

      tasks.push(newTask);
      saveTasks(tasks);
      console.log(`Task added successfully.${id ? ` (ID: ${id})` : ""}`);
    }

    function normalizeTaskId(id) {
      if (id === undefined || id === null || id === "") {
        return null;
      }
      const numericId = Number.parseInt(id, 10);
      return Number.isNaN(numericId) ? null : numericId;
    }

    function updateTask(id, description) {
      const taskId = normalizeTaskId(id);
      if (!taskId || !description) {
        console.error("Error: Please provide both task ID and new description.");
        return;
      }
      const tasks = readTasks();
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) {
        console.error(`Error: Task with ID ${taskId} not found.`);
        return;
      }

      tasks[taskIndex].description = description;
      tasks[taskIndex].updatedAt = new Date().toISOString();
      saveTasks(tasks);
      console.log(`Task with ID ${taskId} updated successfully.`);
    }

    function deleteTask(id) {
      const taskId = normalizeTaskId(id);
      if (!taskId) {
        console.error("Error: Please provide a task ID.");
        return;
      }
      const tasks = readTasks();
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) {
        console.error(`Error: Task with ID ${taskId} not found.`);
        return;
      }
      
      tasks.splice(taskIndex, 1);
      saveTasks(tasks);
      console.log(`Task with ID ${taskId} deleted successfully.`);
    }
    
    function updateStatus(id, status) {
    const taskId = normalizeTaskId(id);
    if (!taskId) {
        console.error("Error: Please provide a task ID.");
        return;
    }
    const tasks = readTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        console.error(`Error: Task with ID ${taskId} not found.`);
        return;
    }
    
    task.status = status;
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);
    console.log(`Task ${taskId} marked as ${status}.`);
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
  node main.js add "Task description"
  node main.js update <id> "New description"
  node main.js delete <id>
  node main.js mark-in-progress <id>
  node main.js mark-done <id>
  node main.js list [todo|in-progress|done]
        `);
}
