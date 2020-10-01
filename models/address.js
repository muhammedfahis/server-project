const moongoose =require ('mongoose');



const addressSchema =new moongoose.Schema({

    email:String,
    name:String,
    phone:Number,
    country:String,
    address:String
});

const Address =moongoose.model('Address',addressSchema);
module.exports=Address;