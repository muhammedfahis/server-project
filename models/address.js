const moongoose =require ('mongoose');



const addressSchema =new moongoose.Schema({

    email:String,
    name:String,
    phone:Number,
    country:String,
    address:String,
    payed:{type:Boolean,default:false}
});

const Address =moongoose.model('Address',addressSchema);
module.exports=Address;