import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listTodos, createTodo, updateTodo, deleteTodo } from '../controllers/todoController.js';

const router = Router();

router.use(authenticate);
router.get('/', listTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;
