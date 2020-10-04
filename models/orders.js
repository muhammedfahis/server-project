const mongoose =require ('mongoose');
const { order } = require('paypal-rest-sdk');
const schema = mongoose.Schema;


const orderSchema = new schema({
    PaymentId:String,
    amount:{type:Number,default:0},
    email:String,
    productId:String,
    cust_Id:{type:schema.Types.ObjectId ,ref:'Product'},
    status:{type:Boolean,default:false},
    Date:Date,
    img:String,
    discription:String,
    type:String



})



const Order =mongoose.model('order',orderSchema);
module.exports =Order;