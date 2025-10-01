const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

router.get('/', todoController.list);
router.post('/', todoController.create);
router.get('/:id', todoController.getById);
router.put('/:id', todoController.update);
router.delete('/:id', todoController.remove);

module.exports = router;
