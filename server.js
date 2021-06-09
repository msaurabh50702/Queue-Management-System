//Import Dependencies
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const flash = require('express-flash');
const session = require('express-session');
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


const reg = require("./Handlers/Registration")
const log1 = require("./Handlers/Login")
const prod = require("./Handlers/Prod_Mgmt")

app.post("/register",reg.register)
app.post("/login",log1.login)
app.get("/logout",log1.logout)

app.post("/addProduct",prod.addProduct)
app.get('/removeProduct',prod.removeProduct)
app.post('/updateProduct',prod.updateProduct)

//Initialize Server 
app.listen(process.env.PORT,()=>{
    console.log("Server is Running...!");
    /*fs.readFile("details.json",async (err,data)=>{
        shop = await JSON.parse(data)
        console.log(shop)
    });*/
})


//Rebulid