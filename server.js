//Import Dependencies
const express = require("express")
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

require('dotenv').config()

const app = express()

// Manage Middelware
app.set("view engine","ejs")
app.use(expressLayouts);

app.set("views","./views")

app.use(express.static('public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser())


// Route

app.get("/",(req,res)=>{
    res.render("index",{title:"Index"})
})

//Initialize Server 
app.listen(process.env.PORT,()=>{
    console.log("Server is Running...!");
})