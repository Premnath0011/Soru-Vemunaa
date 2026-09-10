import{api}from'./api';
const arr=r=>Array.isArray(r.data)?r.data:[];
export const getClients=async()=>arr(await api.get('/clients'));
export const createClient=async d=>(await api.post('/clients',d)).data;
export const updateClient=async(id,d)=>(await api.put(`/clients/${id}`,d)).data;
export const deleteClient=async id=>(await api.delete(`/clients/${id}`)).data;
export const getClientDetails=async id=>(await api.get(`/clients/${id}/details`)).data;
