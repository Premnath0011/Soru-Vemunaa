const mongoose=require('mongoose');
const categorySchema=new mongoose.Schema({name:{type:String,required:true,trim:true},type:{type:String,enum:['income','expense'],required:true},userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}},{timestamps:true});
categorySchema.index({userId:1,type:1,name:1},{unique:true});
module.exports=mongoose.model('Category',categorySchema);
