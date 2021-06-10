const Users = require("../DB/schema").Users
const bcrypt = require('bcrypt')
const fs = require('fs')

module.exports ={
    register: async (req,res)=>{
        let owner_name1= req.body.owner_name
        let sys_name1 = req.body.sys_name
        let email1 = req.body.email
        let mobile1 = req.body.mobile
        let password1 = req.body.password
        let cpassword1 = req.body.cpassword
        let tokens1 = req.body.access_token
        let sys_type1 = req.body.sys_type
        
        let token1 = require("../details.json")[0].tokens
        console.log("OK")
        if(token1 === tokens1){
            if(password1 === cpassword1 && password1 != ""){
                const sys_nm = await Users.findOne({ sys_name: sys_name1 })
                if (sys_nm) {
                    console.log("Shop Already Registered..!")
                    req.flash('error', "Shop Already Registered..!")
                    return res.redirect('/')
                }
                bcrypt.hash(password1, 10, (err, hash) => {
                    if(!err){
                        user = new Users({
                            owner_name: owner_name1,
                            sys_name: sys_name1,
                            sys_type: sys_type1,
                            email: email1,
                            mobile: mobile1,
                            password: hash,
                            accountType: 'Default',
                            accVerified:false,
                            ttl_queue :1,
                            queueID:""
                        })
                        user.save().then((result)=>{
                            Users.findOne({ _id: result._id }, function (err, doc){
                                doc.queueID = String(result._id);
                                doc.save();
                            });
                            let shop = {
                                name:sys_name1,
                                owner_name: owner_name1,
                                sys_type: sys_type1,
                                email: email1,
                                mobile: mobile1,
                                bg_img_url:"https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
                                theme:req.body.theme
                            }
                            let details =  require("../details.json")
                            

                            details.push(shop)
                            console.log(details)
                            fs.writeFile("details.json", JSON.stringify(details), err => { 
     
                                // Checking for errors 
                                if (err) throw err;  
                               
                                console.log("Shop Added to Details.JSON"); // Success 
                            }); 
                            console.log("Registration Successful...")
                            req.flash('success', "Registration Successful...")
                            return res.redirect("/")
                        })
                        .catch((dberr)=>{
                            console.log("Registration Failed",dberr)
                            req.flash('error', "Registration Failed...!")
                            return res.redirect("/")
                        })
                    }else{
                        console.log("Error while Encrypting your Password...!")
                        req.flash('error', "Error while Encrypting your Password...!")
                        return res.redirect("/")
                    }
                })
            }else{
                console.log("Password does not Matched...!")
                req.flash('error', "Password does not Matched...!")
                return res.redirect("/")
            }
        }
    },
    addQueue: async (req,res)=>{
        let owner_name1= req.body.owner_name
        let sys_name1 = req.body.sys_name
        let email1 = req.body.email
        let mobile1 = req.body.mobile
        let password1 = req.body.password
        let cpassword1 = req.body.cpassword
        let sys_type1 = req.body.sys_type
        if(password1 === cpassword1 && password1 != ""){
            const sys_nm = await Users.findOne({ sys_name: sys_name1 })
            if (sys_nm) {
                console.log("Queue Already Registered..!")
                req.flash('error', "Queue Already Registered..!")
                return res.redirect('/')
            }
            bcrypt.hash(password1, 10, (err, hash) => {
                if(!err){
                    user = new Users({
                        owner_name: owner_name1,
                        sys_name: sys_name1,
                        sys_type: sys_type1,
                        email: email1,
                        mobile: mobile1,
                        password: hash,
                        accountType: 'Default',
                        accVerified:false,
                        ttl_queue :1,
                        queueID:""
                    })
                    user.save().then((result)=>{
                        Users.findOne({ _id: req.session.userId }, function (err, doc){
                            doc.ttl_queue += 1;
                            doc.queueID += ","+result._id;
                            doc.save();
                        });
                        
                        console.log("Queue Added Successful...")
                        req.flash('success', "Queue Added Successful...")
                        return res.redirect('dashboard')
                    })
                    .catch((dberr)=>{
                        console.log("Registration Failed",dberr)
                        req.flash('error', "Adding Queue Failed...!")
                        return res.redirect("/")
                    })
                }else{
                    console.log("Error while Encrypting your Password...!")
                    req.flash('error', "Error while Encrypting your Password...!")
                    return res.redirect("/")
                }
            })
        }
    }
};