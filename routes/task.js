const express = require('express');

const router = express.Router();
const { ensureLoggedIn } = require('connect-ensure-login');
const task = require('../models/tasks');

router.get('/:taskId', ensureLoggedIn(), (req, res, next) => {
  const { taskId } = req.params;
  console.log(taskId);
  task
    .findById(taskId)
    // .populate('title')
    .then((tasks) => {
      console.log(tasks);
      res.render('task', { tasks });
    })
    .catch((error) => next(error));
});

router.get('/:taskId/delete', ensureLoggedIn(), (req, res, next) => {
  const { taskId } = req.params;
  task.findByIdAndDelete(taskId)
    .then(del => { res.redirect('/perfil') })
    .catch(error => next(error));
});

router.post('/:taskId', ensureLoggedIn(), (req, res, next) => {
  const { taskId } = req.params; 
  const { title, description, types, states, priority } = req.body;
  const newTask = { title, description, types, states, priority };
  task.findByIdAndUpdate(taskId, newTask)
    .then(_ => res.redirect('/perfil'))
    .catch((error) => next(error));
});

module.exports = router;
