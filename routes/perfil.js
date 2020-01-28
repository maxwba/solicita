const express = require('express');

const router = express.Router();
const { ensureLoggedIn } = require('connect-ensure-login');
const task = require('../models/tasks');

router.post('/', ensureLoggedIn(), (req, res, next) => {
  const {
    title,
    description,
    username,
    types,
    states,
    priority,
    userId,
  } = req.body;

  task.create(
    {
      title,
      description,
      username,
      types,
      states,
      priority,
      userId,
    },
    (err, tasks) => {
      if (err) {
        console.log('An error happened:', err);
      } else {
        console.log('The Task is saved and its value is: ', tasks);
        res.redirect('/perfil');
      }
    }
  );
});

// Task-list table

router.get('/', ensureLoggedIn(), (req, res, next) => {
  task.find(null, (err, tasks) => {
    if (err) {
      throw err;
    }
    tasks.sort((a, b) => {
      if (a.priority > b.priority) {
        return 1;
      }
      if (a.priority < b.priority) {
        return -1;
      }
      return 0;
    });

    const taskFilter = tasks.filter((taskFill) => {
      return taskFill.userId.toString() === req.user._id.toString();
    });

    const taskColor = taskFilter.map((taskBg) => {
      if (taskBg.priority === 'Alta prioridade') {
        taskBg.isHp = true;
      }
      return taskBg;
    });

    res.render('perfil', { user: req.user, tasks: taskColor });
  });
});

module.exports = router;
