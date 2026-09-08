const mongoose=require('mongoose');
const schema=new mongoose.Schema({
  title:{type:String,required:true,trim:true},description:{type:String,default:''},
  promotionType:{type:String,enum:['Paid','Collaboration','Content'],default:'Content'},
  platform:{type:String,enum:['Instagram','YouTube','Both'],default:'Instagram'},
  projectAddDate:{type:Date,default:Date.now},shootDate:{type:Date},
  status:{type:String,enum:['On Hold','Shooted','Completed','Cancelled','Ongoing'],default:'On Hold'},
  thumbnail:{type:String,default:''},notes:{type:String,default:''},
  agreedAmount:{type:Number,default:0,min:0},paymentReceived:{type:Boolean,default:false},paymentReceivedAt:{type:Date},paymentTransactionId:{type:mongoose.Schema.Types.ObjectId,ref:'Transaction',default:null},
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{timestamps:true});
module.exports=mongoose.model('Project',schema);
