import api from './client';
export const fetchUsers = async () => {
    const { data } = await api.get('/users');
    return data;
};
export const updateUser = async (id, payload) => {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data.user;
};
