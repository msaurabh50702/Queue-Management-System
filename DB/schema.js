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
    accVerified:{type:Boolean}
},{timestamps:true})

Users = mongoose.model('Users', Users);
module.exports = {Users}