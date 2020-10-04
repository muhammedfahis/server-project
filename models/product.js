const mongoose = require('mongoose');
const { on } = require('./User');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    category: String,
    discription: String,
    price: Number,
    target: Number,
    img: String,
    checkbox_1: String,
    checkbox_2: String,
    country: String,
    details: String,
    comments: Array,
    username: Array,
    Date: Array,
    projectId:String,
    video:String,
    orderId:Array,
    projectDate:{type:Number,default:new Date().getTime()}
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product