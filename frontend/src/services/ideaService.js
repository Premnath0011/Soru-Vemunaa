import { api } from './api';
const arr = (r) => Array.isArray(r.data) ? r.data : [];
export const getIdeas=async()=>arr(await api.get('/ideas'));
export const createIdea=async(d)=>(await api.post('/ideas',d)).data;
export const updateIdea=async(id,d)=>(await api.put(`/ideas/${id}`,d)).data;
export const deleteIdea=async(id)=>(await api.delete(`/ideas/${id}`)).data;
