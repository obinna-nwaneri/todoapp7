import api from './client';
export const fetchTodos = async (params) => {
    const { data } = await api.get('/todos', { params });
    return data;
};
export const fetchTodo = async (id) => {
    const { data } = await api.get(`/todos/${id}`);
    return data;
};
export const createTodo = async (payload) => {
    const { data } = await api.post('/todos', payload);
    return data.todo;
};
export const updateTodo = async (id, payload) => {
    const { data } = await api.patch(`/todos/${id}`, payload);
    return data.todo;
};
export const deleteTodo = async (id) => {
    await api.delete(`/todos/${id}`);
};
