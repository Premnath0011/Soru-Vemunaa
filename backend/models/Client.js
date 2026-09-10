const mongoose=require('mongoose');
const schema=new mongoose.Schema({
  name:{type:String,required:true,trim:true},contactPerson:{type:String,default:'',trim:true},phone:{type:String,default:'',trim:true},whatsapp:{type:String,default:'',trim:true},email:{type:String,default:'',trim:true,lowercase:true},instagram:{type:String,default:'',trim:true},location:{type:String,default:'',trim:true},notes:{type:String,default:'',trim:true},userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{timestamps:true});
schema.index({userId:1,name:1});
module.exports=mongoose.model('Client',schema);
