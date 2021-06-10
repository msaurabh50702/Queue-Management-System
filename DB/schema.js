const mongoose  = require('mongoose')
require("./initDB")

let Users = new mongoose.Schema({
    owner_name: {type: String},
    sys_name: {type: String},
    sys_type: {type: String},
    email: {type: String},
    mobile: {type: Number},
    password: {type: String},
    accountType: {type: String},
    age: {type: Number},
    accVerified:{type:Boolean},
    ttl_queue: {type:Number},
    queueID:{type:String}
},{timestamps:true})

let Prod = new mongoose.Schema({
    product_name:{type:String},
    product_img:{type:String},
    product_cat:{type:String},
    product_price:{type:Number},
    product_min_qty:{type:Number},
    product_max_qty:{type:Number},
    sys_name:{type:String}
},{timestamps:true})

Users = mongoose.model('Users', Users);
Products = mongoose.model('Products', Prod);
module.exports = {Users,Products}