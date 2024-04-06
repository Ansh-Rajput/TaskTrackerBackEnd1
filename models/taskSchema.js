const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["Pending", "In Progress", "Completed", "Deployed", "Deferred"], required: true },
    priority: { type: String, required: true },
    team: { type: String, required: true },
    assignee: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }
}, { timestamps: true });


const taskdb = new mongoose.model("tasks", taskSchema);

module.exports = taskdb;