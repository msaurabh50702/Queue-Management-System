//Import Dependencies
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const flash = require('express-flash');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

let shop = require("./details.json")

require('dotenv').config()

const app = express()

// Manage Middelware
app.set("view engine","ejs")
app.use(expressLayouts);
app.use(flash());

app.use(session({
    secret: "SOMETHING",
    cookie: { maxAge: 60000*30 },
    resave: true,
    saveUninitialized: false
  }));

app.set("views","./views")

app.use(express.static('public'));
app.use(express.static('ProdImg'));
app.use(cookieParser());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser())


const Products = require("./DB/schema").Products;


let storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './ProdImg');
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname.split(' ').join('_'));
    }
});

let upload = multer({ storage : storage }).array('ProdPic',25);


// Route

let shop_id = 0;

app.get("/",(req,res)=>{
    res.cookie('theme', shop[shop_id].theme)
    shops = ""
    shop.slice(1).forEach(element => {
        shops+=element.name+","
    });
    res.render("index",{title:"QMS",shop_details:shop[shop_id],shop_names:shops})
})

app.get("/dashboard",async(req,res)=>{
    if(req.session.isValidUser){
        shop.forEach((element,ind) => {
            if(element.name == req.session.sys_name){
                shop_id = ind;
            }
        });
        res.cookie('theme', shop[shop_id].theme)
        await Products.find({sys_name:req.session.sys_name},{id:0,createdAt:0,updatedAt:0,__v:0}).then(data=>{
            res.render("dashboard",{title:"Dashboard",shop_details:shop[shop_id],products:JSON.stringify(data)})
        }).catch(err=>{
            console.log(err)
        })
    }else{
        req.flash("error","Access Denied...!")
        res.redirect("/")
    }
})


app.post("/addProduct",(req,res)=>{
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
})

const reg = require("./Handlers/Registration")
const log1 = require("./Handlers/Login")

app.post("/register",reg.register)
app.post("/login",log1.login)
app.get("/logout",log1.logout)

//Initialize Server 
app.listen(process.env.PORT,()=>{
    console.log("Server is Running...!");
    /*fs.readFile("details.json",async (err,data)=>{
        shop = await JSON.parse(data)
        console.log(shop)
    });*/
})


//Rebulid