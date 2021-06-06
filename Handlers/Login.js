const User = require("../DB/schema").Users
const bcrypt = require('bcrypt')

module.exports ={
    login:async(req,res) =>{
        let sys_name1 = req.body.sys_name;
        const user = await User.findOne({sys_name:sys_name1})
        if(user) {
            bcrypt.compare(req.body.password, user.password, (err, result)=> {
                if(result){
                    req.session.isValidUser = true
                    req.session.userId = user.id;
                    req.session.userRole = user.accountType;
                    req.flash('success', "Welcome, "+user.owner_name)
                    return res.redirect('dashboard')
                }
                else{
                    req.flash('error', "Password not match")
                    return res.redirect("/")
                }
            })
        }
        else {
            req.flash('error', "User not found")
            return res.redirect('/')
        }
    },
    logout:(req,res)=>{
        req.session.isValidUser = false
        req.session.userId = false;
        req.session.userRole = false;
        req.session.destroy(function(re){
            res.redirect("/")
        })
    },
}