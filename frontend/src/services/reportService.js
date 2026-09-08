import{api}from'./api';export const getReport=async year=>(await api.get('/reports',{params:{year}})).data;
