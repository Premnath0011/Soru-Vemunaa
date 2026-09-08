export const money=(n)=>`₹${Number(n||0).toLocaleString('en-IN')}`;
export const dateText=(d)=>d?new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';
