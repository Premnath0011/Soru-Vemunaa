const Idea=require('../models/Idea');
const fields=['title','description','category','status','projectId'];
const f=req=>({userId:req.user.id});
exports.list=async(req,res)=>{try{res.json(await Idea.find(f(req)).populate('projectId','title status').sort({createdAt:-1}));}catch(e){res.status(500).json({message:e.message});}};
exports.create=async(req,res)=>{try{const body={};fields.forEach(k=>{if(req.body[k]!==undefined)body[k]=req.body[k]});body.userId=req.user.id;res.status(201).json(await Idea.create(body));}catch(e){res.status(400).json({message:e.message});}};
exports.update=async(req,res)=>{try{const body={};fields.forEach(k=>{if(req.body[k]!==undefined)body[k]=req.body[k]});const x=await Idea.findOneAndUpdate({_id:req.params.id,userId:req.user.id},body,{new:true,runValidators:true}).populate('projectId','title status');if(!x)return res.status(404).json({message:'Idea not found'});res.json(x);}catch(e){res.status(400).json({message:e.message});}};
exports.remove=async(req,res)=>{const x=await Idea.findOneAndDelete({_id:req.params.id,userId:req.user.id});if(!x)return res.status(404).json({message:'Idea not found'});res.json({message:'Idea deleted'});};
