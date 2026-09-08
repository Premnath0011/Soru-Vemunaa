import axios from 'axios';import{API_URL}from'../environment/apiurl';
export const api=axios.create({baseURL:API_URL,timeout:15000,headers:{'Content-Type':'application/json'}});
api.interceptors.request.use(c=>{const t=localStorage.getItem('soru_token');if(t)c.headers.Authorization=`Bearer ${t}`;return c});
api.interceptors.response.use(r=>r,e=>{if(e.response?.status===401&&localStorage.getItem('soru_token')){localStorage.removeItem('soru_token');localStorage.removeItem('soru_user');window.location.href='/login'}return Promise.reject(e)});
