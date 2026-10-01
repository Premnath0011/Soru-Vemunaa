import React,{useEffect,useMemo,useState}from'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {FiSearch,FiTrash2,FiDollarSign,FiEye,FiCheckCircle,FiPlus,FiX,FiArrowRight,FiEdit3}from'react-icons/fi';
import Header from'../../components/Header';import Modal from'../../components/Modal';
import{getProjects,createProject,updateProject,deleteProject,getProjectAnalytics}from'../../services/projectService';
import{getClients}from'../../services/clientService';import{dateText,money}from'../../utils/format';

const STATUSES=['On Hold','Confirmed','Shoot Scheduled','Shooted','Editing','Ready to Post','Posted','Completed','Cancelled'];
const FLOW={ 'On Hold':'Confirmed','Confirmed':'Shoot Scheduled','Shoot Scheduled':'Shooted','Shooted':'Editing','Editing':'Ready to Post','Ready to Post':'Posted','Posted':'Completed' };
const today=()=>new Date().toISOString().slice(0,10);
const fresh=()=>({title:'',description:'',promotionType:'Content',platform:'Instagram',projectAddDate:today(),shootDate:'',status:'On Hold',notes:'',clientId:'',agreedAmount:'',payments:[]});

function PaymentEditor({form,setForm}){
  const received=(form.payments||[]).filter(p=>p.status==='Paid').reduce((s,p)=>s+Number(p.amount||0),0);
  const planned=(form.payments||[]).filter(p=>p.status==='Pending').reduce((s,p)=>s+Number(p.amount||0),0);
  const due=Math.max(0,Number(form.agreedAmount||0)-received);
  const add=()=>setForm({...form,payments:[...(form.payments||[]),{amount:'',status:'Pending',date:today(),dueDate:'',method:'UPI',notes:''}]});
  const update=(i,k,v)=>setForm({...form,payments:form.payments.map((p,n)=>n===i?{...p,[k]:v}:p)});
  return <div className="payment-box">
    <div className="payment-summary">
      <div><small>Agreed</small><strong>{money(form.agreedAmount||0)}</strong></div>
      <div><small>Received</small><strong className="income">{money(received)}</strong></div>
      <div><small>Remaining</small><strong className={due?'expense':'income'}>{money(due)}</strong></div>
    </div>
    {planned>0&&<div className="payment-plan-note">{money(planned)} scheduled in pending installments.</div>}
    {(form.payments||[]).map((p,i)=><div className="payment-entry" key={p._id||i}>
      <div className="payment-entry-head"><strong>Payment {i+1}</strong><button type="button" className="plain-icon" onClick={()=>setForm({...form,payments:form.payments.filter((_,n)=>n!==i)})}><FiX/></button></div>
      <div className="two"><div className="field"><label>Amount</label><input type="number" min="0" value={p.amount} onChange={e=>update(i,'amount',e.target.value)}/></div><div className="field"><label>Status</label><select value={p.status||'Pending'} onChange={e=>update(i,'status',e.target.value)}><option>Pending</option><option>Paid</option></select></div></div>
      <div className="two"><div className="field"><label>{p.status==='Paid'?'Received Date':'Planned Date'}</label><input type="date" value={p.date?.slice(0,10)||today()} onChange={e=>update(i,'date',e.target.value)}/></div><div className="field"><label>Due Date</label><input type="date" value={p.dueDate?.slice(0,10)||''} onChange={e=>update(i,'dueDate',e.target.value)}/></div></div>
      <div className="two"><div className="field"><label>Method</label><select value={p.method||'UPI'} onChange={e=>update(i,'method',e.target.value)}>{['Cash','UPI','Bank Transfer','Card','Other'].map(x=><option key={x}>{x}</option>)}</select></div><div className="field"><label>Reference / Notes</label><input value={p.notes||''} onChange={e=>update(i,'notes',e.target.value)} placeholder="Optional"/></div></div>
    </div>)}
    <button type="button" className="secondary-btn full" onClick={add}><FiPlus/> Add payment installment</button>
    {due>0&&<small className="payment-hint">{received>0?'Partial payment':'No payment received'} • {money(due)} still receivable.</small>}
  </div>;
}

export function ProjectForm({form,setForm,clients,editing,onSubmit}){
  const next=FLOW[form.status];
  const setNext=()=>next&&setForm({...form,status:next});
  return <form onSubmit={onSubmit}>
    <div className="form-section"><div className="form-section-title"><span>01</span><div><strong>Project details</strong><small>Basic information about the collaboration</small></div></div>
      <div className="field"><label>Project Title *</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Kumar Mess Review"/></div>
      <div className="two"><div className="field"><label>Client / Brand</label><select value={form.clientId||''} onChange={e=>setForm({...form,clientId:e.target.value})}><option value="">No client</option>{clients.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></div><div className="field"><label>Promotion</label><select value={form.promotionType} onChange={e=>setForm({...form,promotionType:e.target.value})}><option>Paid</option><option>Collaboration</option><option>Content</option></select></div></div>
      <div className="two"><div className="field"><label>Platform</label><select value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}><option>Instagram</option><option>YouTube</option><option>Both</option></select></div><div className="field"><label>Project Date</label><input type="date" value={form.projectAddDate} onChange={e=>setForm({...form,projectAddDate:e.target.value})}/></div></div>
    </div>
    <div className="form-section"><div className="form-section-title"><span>02</span><div><strong>Workflow</strong><small>Keep the project moving one stage at a time</small></div></div>
      <div className="field"><label>Current Stage</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.map(x=><option key={x}>{x}</option>)}</select></div>
      {next&&<button type="button" className="workflow-next" onClick={setNext}><FiArrowRight/> Next step: {next}</button>}
      <div className="field"><label>Shoot Date</label><input type="date" value={form.shootDate} onChange={e=>setForm({...form,shootDate:e.target.value})}/></div>
    </div>
    {form.promotionType==='Paid'&&<div className="form-section"><div className="form-section-title"><span>03</span><div><strong>Project finance</strong><small>Track agreed value, installments and pending money</small></div></div><div className="field"><label>Agreed Promotion Amount (₹)</label><input type="number" min="0" value={form.agreedAmount} onChange={e=>setForm({...form,agreedAmount:e.target.value})}/></div><PaymentEditor form={form} setForm={setForm}/></div>}
    <div className="form-section"><div className="form-section-title"><span>{form.promotionType==='Paid'?'04':'03'}</span><div><strong>Notes</strong><small>Anything you want to remember for this project</small></div></div><div className="field"><label>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What content are you creating?"/></div><div className="field"><label>Internal notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Location, contact details, creative notes..."/></div></div>
    <button className="primary-btn"><FiCheckCircle/> {editing?'Update Project':'Create Project'}</button>
  </form>;
}

export default function Projects(){
 const[data,setData]=useState([]),[clients,setClients]=useState([]),[q,setQ]=useState(''),[tab,setTab]=useState('All'),[open,setOpen]=useState(false),[form,setForm]=useState(fresh()),[editing,setEditing]=useState(null),[view,setView]=useState(null),[analytics,setAnalytics]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const [params,setParams]=useSearchParams();
 const load=async()=>{try{setLoading(true);const[p,c]=await Promise.all([getProjects(),getClients()]);setData(Array.isArray(p)?p:[]);setClients(Array.isArray(c)?c:[])}catch(e){setError(e.response?.data?.message||'Could not load projects.')}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 useEffect(()=>{if(params.get('add')==='1'&&!loading){setEditing(null);setForm(fresh());setOpen(true);setParams({}, {replace:true})}},[params,loading,setParams]);
 const filtered=useMemo(()=>data.filter(x=>(tab==='All'||(tab==='Active'&&!['Completed','Cancelled'].includes(x.status))||x.status===tab)&&(x.title||'').toLowerCase().includes(q.toLowerCase())),[data,q,tab]);
 const submit=async e=>{e.preventDefault();try{const payload={...form,agreedAmount:Number(form.agreedAmount||0),clientId:form.clientId||null,payments:(form.payments||[]).map(p=>({...p,amount:Number(p.amount||0)})).filter(p=>p.amount>0)};if(payload.promotionType!=='Paid')payload.payments=[];editing?await updateProject(editing,payload):await createProject(payload);setOpen(false);setEditing(null);setForm(fresh());load()}catch(e){setError(e.response?.data?.message||'Could not save project.')}};
 const edit=x=>{setEditing(x._id);setForm({...fresh(),...x,clientId:x.clientId?._id||x.clientId||'',projectAddDate:x.projectAddDate?.slice(0,10)||today(),shootDate:x.shootDate?.slice(0,10)||'',payments:(x.payments||[]).map(p=>({...p,status:p.status||'Pending',date:p.date?.slice(0,10)||today(),dueDate:p.dueDate?.slice(0,10)||''}))});setOpen(true)};
 const nextStatus=async x=>{const next=FLOW[x.status];if(!next)return;try{await updateProject(x._id,{status:next});load()}catch(e){setError(e.response?.data?.message||'Could not update project.')}};
 return <><Header title="Projects" subtitle="Your work from confirmation to payment" add onAdd={()=>{setEditing(null);setForm(fresh());setOpen(true)}}/>
  <div className="search"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search projects or brands..."/><FiSearch/></div>
  <div className="tabs project-tabs">{['All','Active','Editing','Ready to Post','Posted','Completed','Cancelled'].map(x=><button className={`tab ${tab===x?'active':''}`} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>
  {error&&<div className="error-box">{error}</div>}
  {loading?<div className="list-card empty"><span className="mini-spinner"/> Loading projects…</div>:filtered.map(x=>{const received=(x.payments||[]).filter(p=>p.status==='Paid').reduce((s,p)=>s+Number(p.amount||0),0),due=Math.max(0,Number(x.agreedAmount||0)-received),next=FLOW[x.status];return <div className="project-card glass" key={x._id} onClick={()=>edit(x)}><div className="thumb initial-thumb">{x.title?.charAt(0).toUpperCase()||'P'}</div><div className="project-body"><div className="project-title">{x.title}</div><div className="project-desc">{x.clientId?.name||'No client'} • {x.platform} • {x.promotionType}</div><span className={`badge-soft ${x.status==='Completed'?'completed':x.status==='Cancelled'?'cancelled':'ongoing'}`}>{x.status}</span><div className="date-line">Shoot: {dateText(x.shootDate)} {x.promotionType==='Paid'&&`• ${money(received)} received${due>0?` • ${money(due)} due`:' • settled'}`}</div>{next&&<button className="project-next" onClick={e=>{e.stopPropagation();nextStatus(x)}}><FiArrowRight/> {next}</button>}</div><div className="project-actions"><button className="plain-icon" onClick={e=>{e.stopPropagation();setView(x)}}><FiEye/></button><button className="plain-icon" onClick={e=>{e.stopPropagation();getProjectAnalytics(x._id).then(setAnalytics).catch(()=>setError('Could not load project finance.'))}}><FiDollarSign/></button><button className="danger-icon" onClick={async e=>{e.stopPropagation();if(window.confirm('Delete this project?')){await deleteProject(x._id);load()}}}><FiTrash2/></button></div></div>})}
  {!loading&&!filtered.length&&<div className="list-card empty">No projects found. Create your first project.</div>}
  {open&&<Modal title={editing?'Edit Project':'New Project'} onClose={()=>setOpen(false)}><ProjectForm form={form} setForm={setForm} clients={clients} editing={editing} onSubmit={submit}/></Modal>}
  {view&&<Modal title={view.title} onClose={()=>setView(null)}><div className="view-title-row"><div><span className="badge-soft ongoing">{view.status}</span><p className="view-text">{view.clientId?.name||'No client'} • {view.platform} • {view.promotionType}</p></div><button className="secondary-btn" onClick={()=>{setView(null);edit(view)}}><FiEdit3/> Edit</button></div><div className="detail-grid"><div><small>Shoot</small><strong>{dateText(view.shootDate)}</strong></div><div><small>Agreed</small><strong>{view.promotionType==='Paid'?money(view.agreedAmount):'—'}</strong></div></div>{view.description&&<div className="view-notes"><small>Description</small><p>{view.description}</p></div>}{view.notes&&<div className="view-notes"><small>Notes</small><p>{view.notes}</p></div>}<button className="secondary-btn full" onClick={()=>{setView(null);nav('/money?add=expense&project='+view._id)}}><FiDollarSign/> Add project expense</button></Modal>}
  {analytics&&<Modal title="Project Finance" onClose={()=>setAnalytics(null)}><div className="summary-grid"><div className="summary-box"><small>Revenue</small><strong className="income">{money(analytics.income)}</strong></div><div className="summary-box"><small>Expenses</small><strong className="expense">{money(analytics.expense)}</strong></div><div className="summary-box"><small>Profit</small><strong>{money(analytics.profit)}</strong></div></div><div className="payment-status"><strong>{analytics.paymentSummary.status}</strong><br/>{money(analytics.paymentSummary.received)} received of {money(analytics.paymentSummary.agreed)} • {money(analytics.paymentSummary.due)} receivable</div><div className="section-head"><h2>Project transactions</h2></div>{analytics.transactions.length?analytics.transactions.map(t=><div className="list-card transaction" key={t._id}><div className="tx-main"><div className="tx-title">{t.title}</div><div className="tx-sub">{dateText(t.date)} • {t.category}</div></div><strong className={t.type==='income'?'income':'expense'}>{t.type==='income'?'+':'-'} {money(t.amount)}</strong></div>):<div className="list-card empty">No project transactions yet.</div>}<button className="secondary-btn full" onClick={()=>{setAnalytics(null);nav('/money?project='+analytics.project._id)}}>View in Money</button></Modal>}
 </>;
}
