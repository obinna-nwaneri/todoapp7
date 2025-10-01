const { Todo, User } = require('../../models');

const adminInclude = [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }];
const canAccessTodo = (user, todo) => user.isAdmin || todo.userId === user.id;

exports.list = async (req, res) => {
  try {
    const where = req.user.isAdmin ? {} : { userId: req.user.id };
    const todos = await Todo.findAll({
      where,
      order: [['dueDate', 'ASC']],
      include: req.user.isAdmin ? adminInclude : [],
    });
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch todos', error: error.message });
  }
};

exports.create = async (req, res) => {
  const { title, description, dueDate, priority = 'medium', status = 'pending', userId } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const ownerId = req.user.isAdmin && userId ? userId : req.user.id;
    if (req.user.isAdmin && userId) {
      const userExists = await User.findByPk(userId);
      if (!userExists) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
    }
    const todo = await Todo.create({ title, description, dueDate, priority, status, userId: ownerId });
    const created = await Todo.findByPk(todo.id, {
      include: req.user.isAdmin ? adminInclude : [],
    });
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create todo', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id, {
      include: req.user.isAdmin ? adminInclude : [],
    });
    if (!todo || !canAccessTodo(req.user, todo)) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    return res.json(todo);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch todo', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo || !canAccessTodo(req.user, todo)) {
      return res.status(404).json({ message: 'Todo not found or access denied' });
    }
    const updates = req.body;
    if (req.user.isAdmin && updates.userId && updates.userId !== todo.userId) {
      const userExists = await User.findByPk(updates.userId);
      if (!userExists) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
    } else if (!req.user.isAdmin) {
      delete updates.userId;
    }
    await todo.update(updates);
    const reloaded = await Todo.findByPk(todo.id, {
      include: req.user.isAdmin ? adminInclude : [],
    });
    return res.json(reloaded);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update todo', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo || !canAccessTodo(req.user, todo)) {
      return res.status(404).json({ message: 'Todo not found or access denied' });
    }
    await todo.destroy();
    return res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete todo', error: error.message });
  }
};
