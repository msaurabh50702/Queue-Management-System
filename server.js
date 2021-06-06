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

app.get("/dashboard",(req,res)=>{
    if(req.session.isValidUser){
        res.render("dashboard",{title:"Dashboard",shop_details:shop[shop_id]})
    }else{
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