// taskRoutes.js
const express = require('express');
const taskdb = require('../models/taskSchema');
const router = express.Router();

router.post('/addTask', async (req, res) => {
    try {
        // Extract task details from the request body
        const { title, description, status, priority, team, assignee, startDate } = req.body;

        // Create a new task object
        const newTask = new taskdb({
            userEmail: req.user.email,
            title,
            description,
            team,
            priority,
            assignee,
            status,
            startDate,
        });

        // Save the new task to the database
        await newTask.save();

        res.status(201).json({ message: 'Task added successfully', task: newTask });
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/getTasks', async (req, res) => {
    try {
        const user = req.user;
        console.log(user);
        const tasks = await taskdb.find({ userEmail: user.email });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/updateTask/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status, priority } = req.body;

        // Create an object to hold the updates
        const updates = { status, priority };

        // If status is 'Completed', update endDate to current date
        if (status === 'Completed') {
            updates.endDate = new Date();
        }

        // Find the task by ID and update it
        const updatedTask = await taskdb.findByIdAndUpdate(taskId, updates, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


router.delete('/deleteTask/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        // Delete the task by its ID
        const deletedTask = await taskdb.findByIdAndDelete(taskId);
        if (deletedTask) {
            res.json({ message: 'Task deleted successfully' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
