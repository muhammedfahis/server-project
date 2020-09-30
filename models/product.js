const mongoose = require('mongoose');
const { on } = require('./User');


const productSchema = new mongoose.Schema({

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
    id:String,
    video:String



});

const Product = mongoose.model('Product', productSchema);
module.exports = Product