const Schedule=require('../models/Schedule');
const q=req=>({userId:req.user.id});
exports.list=async(req,res)=>{try{const f=q(req);if(req.query.from||req.query.to){f.date={};if(req.query.from)f.date.$gte=new Date(req.query.from);if(req.query.to)f.date.$lte=new Date(req.query.to+'T23:59:59');}if(req.query.status)f.status=req.query.status;res.json(await Schedule.find(f).populate('projectId','title').sort({date:1,time:1}));}catch(e){res.status(500).json({message:e.message});}};
exports.create=async(req,res)=>{try{res.status(201).json(await Schedule.create({...req.body,userId:req.user.id}));}catch(e){res.status(400).json({message:e.message});}};
exports.update=async(req,res)=>{try{const x=await Schedule.findOneAndUpdate({_id:req.params.id,userId:req.user.id},req.body,{new:true,runValidators:true}).populate('projectId','title');if(!x)return res.status(404).json({message:'Schedule item not found'});res.json(x);}catch(e){res.status(400).json({message:e.message});}};
exports.remove=async(req,res)=>{const x=await Schedule.findOneAndDelete({_id:req.params.id,userId:req.user.id});if(!x)return res.status(404).json({message:'Schedule item not found'});res.json({message:'Deleted'});};
