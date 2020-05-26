const express = require('express');
const authMiddleware = require('../middleware/auth');

const Project = require('../models/Project');
const Task = require('../models/Task');

const routes = express.Router();

routes.use(authMiddleware);

routes.get('/', async (req, res) => {
    try {
        const projects = await Project.find().populate(['user', 'tasks']);

        return res.send({ projects });

    } catch (err) {
        return res.status(400).send({ error: 'Internal error, contact to support!'});
    }
});

routes.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate('user');

        return res.send({ project });

    } catch (err) {
        return res.status(400).send({ error: 'Internal error, contact to support!'});
    }
});

routes.post('/', async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.create({ title, description, user: req.userId });

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });
            
            await projectTask.save();
            
            project.tasks.push(projectTask);
            console.log(tasks)
        }));

        await project.save();

        return res.send({ project });
        
    } catch (err) {
        return res.status(400).send({ error: 'Internal error to create a new project, contact to support!'});
    }
});

routes.put('/:projectId', async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectId, {
            title,
            description,
        }, { new: true });

        project.tasks = [];
        
        await Task.remove({ project: project._id });

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });
            
            await projectTask.save();
            
            project.tasks.push(projectTask);
            console.log(tasks)
        }));

        await project.save();

        return res.send({ project });
        
    } catch (err) {
        return res.status(400).send({ error: 'Internal error to update a project, contact to support!'});
    }
});

routes.delete('/:projectId', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.projectId).populate('user');

        return res.send();

    } catch (err) {
        return res.status(400).send({ error: 'Internal error to delete project, contact to support!'});
    }
});

module.exports = app => app.use('/projects', routes);