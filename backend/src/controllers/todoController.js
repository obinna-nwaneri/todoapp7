import db from '../models/index.js';

const { Todo, User } = db;

const sanitizeTodoPayload = ({ title, description, dueDate, priority, status, userId }) => ({
  title,
  description,
  dueDate: dueDate ? new Date(dueDate) : null,
  priority,
  status,
  userId
});

export const listTodos = async (req, res) => {
  try {
    const whereClause = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const todos = await Todo.findAll({
      where: whereClause,
      order: [['dueDate', 'ASC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    return res.json(todos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load todos' });
  }
};

export const createTodo = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, userId } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let ownerId = req.user.id;
    if (req.user.role === 'admin' && userId) {
      ownerId = userId;
    }

    const payload = sanitizeTodoPayload({ title, description, dueDate, priority, status, userId: ownerId });
    const todo = await Todo.create(payload);

    return res.status(201).json(todo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create todo' });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByPk(id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (req.user.role !== 'admin' && todo.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this todo' });
    }

    const { title, description, dueDate, priority, status } = req.body;
    const payload = sanitizeTodoPayload({ title, description, dueDate, priority, status, userId: todo.userId });
    await todo.update(payload);
    return res.json(todo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update todo' });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByPk(id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (req.user.role !== 'admin' && todo.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this todo' });
    }

    await todo.destroy();
    return res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete todo' });
  }
};
