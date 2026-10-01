const Transaction=require('../models/Transaction');
const Project=require('../models/Project');
exports.summary=async(req,res)=>{
  try{
    const uid=req.user.id,year=Number(req.query.year)||new Date().getFullYear();
    const tx=await Transaction.find({userId:uid,date:{$gte:new Date(`${year}-01-01`),$lte:new Date(`${year}-12-31T23:59:59`)}}).populate('projectId','title').sort({date:1});
    const projects=await Project.find({userId:uid}).populate('clientId','name').sort({createdAt:-1});
    const monthly=Array.from({length:12},(_,i)=>({month:i+1,income:0,expense:0,projectIncome:0,projectExpense:0,balance:0}));
    const categories={income:{},expense:{}};const projectMap={};
    for(const x of tx){const m=new Date(x.date).getMonth(),amount=Number(x.amount||0);monthly[m][x.type]+=amount;if(x.projectId&&x.type==='income')monthly[m].projectIncome+=amount;if(x.projectId&&x.type==='expense')monthly[m].projectExpense+=amount;const cat=x.category||'Uncategorized';categories[x.type][cat]=(categories[x.type][cat]||0)+amount;if(x.projectId){const id=String(x.projectId._id||x.projectId);if(!projectMap[id])projectMap[id]={income:0,expense:0};projectMap[id][x.type]+=amount;}}
    monthly.forEach(m=>m.balance=m.income-m.expense);
    const totalIncome=tx.filter(x=>x.type==='income').reduce((s,x)=>s+Number(x.amount||0),0),totalExpense=tx.filter(x=>x.type==='expense').reduce((s,x)=>s+Number(x.amount||0),0);
    const projectAnalytics=projects.map(p=>{const v=projectMap[String(p._id)]||{income:0,expense:0};const received=(p.payments||[]).filter(x=>x.status==='Paid').reduce((s,x)=>s+Number(x.amount||0),0);const agreed=Number(p.agreedAmount||0);return{id:p._id,title:p.title,client:p.clientId?.name||'',status:p.status,income:v.income,expense:v.expense,profit:v.income-v.expense,agreed,received,due:Math.max(0,agreed-received)}});
    const projectTransactions=tx.filter(x=>x.projectId).map(x=>({id:x._id,type:x.type,title:x.title,amount:x.amount,date:x.date,projectId:x.projectId}));
    res.json({year,totalIncome,totalExpense,balance:totalIncome-totalExpense,monthly,categories,projectAnalytics,projectTransactions,projects:{total:projects.length,active:projects.filter(p=>!['Completed','Cancelled'].includes(p.status)).length,ongoing:projects.filter(p=>p.status==='Ongoing'||p.status==='On Hold').length,completed:projects.filter(p=>p.status==='Completed').length}});
  }catch(e){res.status(500).json({message:e.message});}
};
