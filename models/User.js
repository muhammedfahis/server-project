const mongoose=require('mongoose');


const UserSchema=new mongoose.Schema({
    
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    status:{type:Boolean,default:true},
    number:Number,
    
});

const User=mongoose.model('user',UserSchema);
module.exports=User;