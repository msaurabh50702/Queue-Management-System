const Products = require("../DB/schema").Products;
const bcrypt = require('bcrypt')
const multer = require('multer');

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './ProdImg');
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname.split(' ').join('_'));
    }
});

let upload = multer({ storage : storage }).array('ProdPic',25);

module.exports ={
    addProduct:async(req,res) =>{
        if(req.session.isValidUser){
            upload(req,res,function(err) {
                if(err) {
                    console.log(err)
                    req.flash('error', "Error uploading file.")
                    return res.redirect('dashboard')
                }
                prod = new Products({
                    product_name:req.body.prod_name,
                    product_img:req.files[0].filename,
                    product_cat:req.body.prod_cat,
                    product_price:req.body.price,
                    product_min_qty:req.body.min_qty,
                    product_max_qty:req.body.max_qty,
                    sys_name:req.session.sys_name
                })
                prod.save().then(result=>{
                    req.flash('success', "Product Added")
                    return res.redirect('dashboard')
                }).catch(err=>{
                    req.flash('error', "Error While Adding Product")
                    return res.redirect('dashboard')
                })
            });
        }
        else{
            req.flash("error","Access Denied...!")
            res.redirect("/")
        }
    },
    removeProduct:(req,res)=>{
        if(req.session.isValidUser){
                Products.findOneAndRemove({_id: req.query.id}).then(result=>{
                req.flash('success', "Product Removed")
                return res.redirect('dashboard')
            }).catch(err=>{
                req.flash('error', "Error While Removing Product")
                return res.redirect('dashboard')
            })
        }
        else{
            req.flash("error","Access Denied...!")
            res.redirect("/")
        }
    },
}