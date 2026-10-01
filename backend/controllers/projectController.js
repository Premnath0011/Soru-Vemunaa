const Project = require('../models/Project');
const Transaction = require('../models/Transaction');
const Schedule = require('../models/Schedule');
const Client = require('../models/Client');

const ALLOWED_FIELDS = ['title','description','promotionType','platform','projectAddDate','shootDate','status','thumbnail','notes','clientId','agreedAmount','payments'];
const paidAfterShoot = ['Shooted','Editing','Ready to Post','Posted','Completed'];
const scheduleStatus = status => status === 'Cancelled' ? 'Cancelled' : paidAfterShoot.includes(status) ? 'Completed' : 'Planned';

async function syncShoot(project) {
  const old = await Schedule.findOne({ userId: project.userId, projectId: project._id, type: 'Shoot' });
  if (!project.shootDate) {
    if (old) await Schedule.deleteOne({ _id: old._id });
    return;
  }
  const data = {
    title: `${project.title} • Shoot`, type: 'Shoot', date: project.shootDate, time: '',
    status: scheduleStatus(project.status), projectId: project._id, notes: project.notes || '', userId: project.userId
  };
  if (old) await Schedule.findByIdAndUpdate(old._id, data, { runValidators: true });
  else await Schedule.create(data);
}

async function validateClient(clientId, uid) {
  if (!clientId) return null;
  const client = await Client.findOne({ _id: clientId, userId: uid }).select('_id');
  if (!client) throw new Error('Selected client was not found.');
  return client._id;
}

async function syncPayments(project, uid) {
  if (project.promotionType !== 'Paid') {
    for (const pay of project.payments || []) {
      if (pay.transactionId) await Transaction.deleteOne({ _id: pay.transactionId, userId: uid });
      pay.transactionId = null;
    }
    project.payments = [];
    project.paymentReceived = false;
    project.paymentReceivedAt = undefined;
    project.paymentTransactionId = null;
    return { total: 0, due: 0 };
  }

  if ((!project.payments || project.payments.length === 0) && project.paymentReceived && Number(project.agreedAmount || 0) > 0) {
    project.payments = [{
      amount: Number(project.agreedAmount), status: 'Paid', date: project.paymentReceivedAt || new Date(),
      method: 'Other', notes: 'Migrated from previous payment record.', transactionId: project.paymentTransactionId || null
    }];
  }

  let total = 0;
  for (const pay of project.payments || []) {
    pay.amount = Number(pay.amount || 0);
    pay.status = pay.status || 'Paid';
    if (pay.amount <= 0) continue;
    if (pay.status === 'Paid') total += pay.amount;

    const data = {
      type: 'income', title: `Payment • ${project.title}`, amount: pay.amount,
      category: 'Paid Promotion', projectId: project._id, date: pay.date || new Date(),
      notes: pay.notes || `Payment via ${pay.method || 'Other'}`,
      source: 'Project Payment', userId: uid
    };

    let tx = pay.transactionId ? await Transaction.findOne({ _id: pay.transactionId, userId: uid }) : null;
    if (pay.status === 'Paid') {
      if (tx) { Object.assign(tx, data); await tx.save(); }
      else { tx = await Transaction.create(data); pay.transactionId = tx._id; }
    } else if (tx) {
      await Transaction.deleteOne({ _id: tx._id, userId: uid });
      pay.transactionId = null;
    }
  }

  const due = Math.max(0, Number(project.agreedAmount || 0) - total);
  project.paymentReceived = Number(project.agreedAmount || 0) > 0 && due <= 0;
  project.paymentReceivedAt = project.paymentReceived
    ? (project.payments || []).filter(p => p.status === 'Paid').slice().sort((a,b) => new Date(b.date) - new Date(a.date))[0]?.date
    : undefined;
  project.paymentTransactionId = (project.payments || []).find(p => p.status === 'Paid' && p.transactionId)?.transactionId || null;
  return { total, due };
}

const populateProject = () => Project.findById().populate('clientId','name contactPerson phone instagram');

exports.list = async (req,res) => {
  try {
    res.json(await Project.find({ userId:req.user.id }).populate('clientId','name contactPerson phone instagram').sort({ shootDate:1, createdAt:-1 }));
  } catch(e) { res.status(500).json({message:e.message}); }
};

exports.create = async (req,res) => {
  try {
    const body = {};
    ALLOWED_FIELDS.forEach(k => { if (req.body[k] !== undefined) body[k] = req.body[k]; });
    body.userId = req.user.id;
    body.projectAddDate = body.projectAddDate || new Date();
    body.agreedAmount = Number(body.agreedAmount || 0);
    body.clientId = await validateClient(body.clientId, req.user.id);
    delete body.thumbnail;
    const p = await Project.create(body);
    await syncPayments(p, req.user.id);
    await p.save();
    await syncShoot(p);
    res.status(201).json(await Project.findById(p._id).populate('clientId','name contactPerson phone instagram'));
  } catch(e) { res.status(400).json({message:e.message}); }
};

exports.update = async (req,res) => {
  try {
    const p = await Project.findOne({_id:req.params.id,userId:req.user.id});
    if(!p) return res.status(404).json({message:'Project not found'});
    const previousTransactionIds = (p.payments || []).map(pay => pay.transactionId).filter(Boolean).map(String);
    const body = {};
    ALLOWED_FIELDS.forEach(k => { if (req.body[k] !== undefined) body[k] = req.body[k]; });
    if (body.agreedAmount !== undefined) body.agreedAmount = Number(body.agreedAmount || 0);
    if (body.clientId !== undefined) body.clientId = await validateClient(body.clientId, req.user.id);
    delete body.thumbnail;
    Object.assign(p, body);
    await syncPayments(p, req.user.id);
    const currentTransactionIds = (p.payments || []).map(pay => pay.transactionId).filter(Boolean).map(String);
    const staleIds = previousTransactionIds.filter(id => !currentTransactionIds.includes(id));
    if (staleIds.length) await Transaction.deleteMany({_id: {$in: staleIds}, userId: req.user.id, source: 'Project Payment'});
    await p.save();
    await syncShoot(p);
    res.json(await Project.findById(p._id).populate('clientId','name contactPerson phone instagram'));
  } catch(e) { res.status(400).json({message:e.message}); }
};

exports.remove = async (req,res) => {
  try {
    const x = await Project.findOneAndDelete({_id:req.params.id,userId:req.user.id});
    if(!x) return res.status(404).json({message:'Project not found'});
    for(const pay of x.payments || []) if(pay.transactionId) await Transaction.deleteOne({_id:pay.transactionId,userId:req.user.id});
    if(x.paymentTransactionId) await Transaction.deleteOne({_id:x.paymentTransactionId,userId:req.user.id});
    await Transaction.updateMany({userId:req.user.id,projectId:x._id,source:'Manual'},{$set:{projectId:null}});
    await Schedule.deleteMany({userId:req.user.id,projectId:x._id});
    res.json({message:'Project deleted'});
  } catch(e) { res.status(400).json({message:e.message}); }
};

exports.analytics = async (req,res) => {
  try {
    const p = await Project.findOne({_id:req.params.id,userId:req.user.id}).populate('clientId','name');
    if(!p) return res.status(404).json({message:'Project not found'});
    const tx = await Transaction.find({userId:req.user.id,projectId:p._id}).sort({date:-1});
    const income = tx.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0);
    const expense = tx.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
    const received = (p.payments||[]).filter(x=>x.status==='Paid').reduce((s,x)=>s+Number(x.amount||0),0);
    const agreed = Number(p.agreedAmount||0);
    res.json({project:p,transactions:tx,income,expense,profit:income-expense,paymentSummary:{agreed,received,due:Math.max(0,agreed-received),status:agreed>0?(received>=agreed?'Paid':received>0?'Partial':'Pending'):'Not set'}});
  } catch(e) { res.status(500).json({message:e.message}); }
};
