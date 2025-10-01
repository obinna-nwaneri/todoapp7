import api from './client';
export const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    return data;
};
export const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
};
export const logout = async () => {
    await api.post('/auth/logout');
};
export const fetchProfile = async () => {
    const { data } = await api.get('/profile');
    return data;
};
export const updateProfile = async (payload) => {
    const { data } = await api.patch('/profile', payload);
    return data;
};
