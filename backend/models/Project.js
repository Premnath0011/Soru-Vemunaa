const mongoose=require('mongoose');
const paymentSchema=new mongoose.Schema({amount:{type:Number,required:true,min:0},status:{type:String,enum:['Pending','Paid'],default:'Paid'},date:{type:Date,default:Date.now},dueDate:{type:Date},method:{type:String,enum:['Cash','UPI','Bank Transfer','Card','Other'],default:'UPI'},notes:{type:String,default:'',trim:true},transactionId:{type:mongoose.Schema.Types.ObjectId,ref:'Transaction',default:null}},{_id:true});
const checklistSchema=new mongoose.Schema({label:{type:String,required:true},done:{type:Boolean,default:false}},{_id:true});
const schema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},description:{type:String,default:''},
 promotionType:{type:String,enum:['Paid','Collaboration','Content'],default:'Content'},platform:{type:String,enum:['Instagram','YouTube','Both'],default:'Instagram'},
 projectAddDate:{type:Date,default:Date.now},shootDate:{type:Date},status:{type:String,enum:['On Hold','Confirmed','Shoot Scheduled','Shooted','Editing','Ready to Post','Posted','Completed','Cancelled','Ongoing'],default:'On Hold'},
 thumbnail:{type:String,default:''},notes:{type:String,default:''},clientId:{type:mongoose.Schema.Types.ObjectId,ref:'Client',default:null},
 agreedAmount:{type:Number,default:0,min:0},paymentReceived:{type:Boolean,default:false},paymentReceivedAt:{type:Date},paymentTransactionId:{type:mongoose.Schema.Types.ObjectId,ref:'Transaction',default:null},
 payments:{type:[paymentSchema],default:[]},checklist:{type:[checklistSchema],default:[]},userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{timestamps:true});
schema.index({userId:1,shootDate:1});
module.exports=mongoose.model('Project',schema);
