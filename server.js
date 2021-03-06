//Import Dependencies
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const flash = require('express-flash');
const session = require('express-session');
const fs = require('fs');
const mail = require('nodemailer');
const Order = require("./DB/schema").Orders

let shop = require("./details.json")

require('dotenv').config()

const app = express()

let Queue_dict = require("./Handlers/Login").Queue_dict
const total_time = {1:"60",2:"60",3:"30"}

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

const sender = mail.createTransport({
    service: 'gmail',
    auth: {
      user: 'msaurabh50703@gmail.com',
      pass: process.env.PWD
    }
  });

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
            res.render("dashboard",{title:"Dashboard",shop_details:shop[shop_id],products:JSON.stringify(data),Qcnt:req.session.ttl_queue})
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
const prod = require("./Handlers/Prod_Mgmt");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const cust_opr = require("./Handlers/Cust_Opr");
const { Products } = require("./DB/schema");

app.post("/register",reg.register)
app.post("/login",log1.login)
app.get("/logout",log1.logout)

app.post("/addProduct",prod.addProduct)
app.get('/removeProduct',prod.removeProduct)
app.post('/updateProduct',prod.updateProduct)

app.get('/shops',cust_opr.disp_shops)
app.get('/my_shop',cust_opr.disp_products)
app.post("/checkout",cust_opr.checkout)

app.post("/addQueue",reg.addQueue)


// Place ORDER
const Queue = require("./Handlers/Queue").Queue

app.post("/placeOrder",(req,res)=>{
    if(Queue_dict.length==0)
        return res.send("No Queue Open")
    time_arr = []
    min_ind = 0
    min=99999999999
    for(let i=0;i<Queue_dict.length;i++){
        if(Queue_dict[i].time <= min){
            min_ind = i
            min = Queue_dict[i].time
        }
        time_arr.push(Queue_dict[i].time)
    }
    let order = new Order({
        cust_name:req.body.name,
        cust_email:req.body.email,
        order_products:req.body.product_ids,
        amount:Number(req.body.amount),
        order_time:Number(req.body.order_time),
        shop_name:shop[req.session.shop_id].name,
        order_status:"Pending",
        queue_id:Queue_dict[min_ind].qid
    })
    order.save().then(result=>{
        console.log(result)
        Queue_dict[min_ind].enqueue(result,result.order_time)
        console.log("EnQueue")
        console.log(Queue_dict)
        return res.render("timer",{title:"Timer",dtl:result,time:Queue_dict[min_ind].getTime(),layout:false})
        //return res.send("<p style='color:red'>Order Placed :- "+result._id+"</p>")
    })
})


const temp = require("./Handlers/mail_temp").getTemp
app.get("/completeOrder/:id",(req,res)=>{
    if(req.session.userId)
        Order.findOneAndUpdate({_id:req.params.id,order_status:"Pending"},{order_status:"Completed"}).then(data=>{
            Queue_dict.forEach((obj,ind)=>{
                if(obj.qid == data.queue_id){
                    Queue_dict[ind].dequeue(Number(data.order_time))
                     var mailOptions = {
                        from: 'msaurabh50703@gmail.com',
                        to: data.cust_email,
                        subject: 'Order Completed',
                        html: temp(data.shop_name,data._id,data.cust_name,data.amount)
                      };
                      sender.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });
                }
            })
            console.log("DeQueue")
            console.log(Queue_dict)
            return res.json(data)
        })
    else
        res.send("Invalid Operation")
})

app.get("/orderDetails",(req,res)=>{
    if(req.session.userId)
        Order.find({queue_id:req.session.userId,order_status:"Pending"}).then(data=>{
            res.json(data)
        })
    else
        res.send("Invalid Operation")
})

app.get("/getProdDtl/:id",(req,res)=>{
    Order.findOne({_id:req.params.id},{order_products:1}).then(data=>{
        id_arr = []
        di = {}
        res_arr = []
        d = String(data.order_products).replace("{","").replace("}","").split(",")
        d.forEach(elem=>{
            k = elem.split(":")[0].split('"').join().replace(',',"").replace(",","")
            v= elem.split(":")[1].split('"').join().replace(',',"").replace(",","")
            id_arr.push(k)
            di[k] = v
        })
        Products.find({"_id" : { "$in" : id_arr}}).then(pro=>{
            pro.forEach((element,ind) => {
                res_arr.push({item:element,qty:di[element._id]})
            });
            res.json(res_arr)
        })
    })
})

app.get("/tim",(req,res)=>{
    res.render("timer",{title:"Timer",time:30,layout:false})
})

app.get("/queue",(req,res)=>{
    console.log(Queue_dict)
    var queue = new Queue("ghjk");
    console.log(queue.dequeue());
    console.log(queue.isEmpty()+queue.qid);
    queue.enqueue(10);
    queue.enqueue(20);
    queue.enqueue(30);
    queue.enqueue(40);
    queue.enqueue(50);
    queue.enqueue(60);
    console.log(queue.front());
    console.log(queue.front());
    console.log(queue.dequeue());

    console.log(queue.time)
    queue.time += 5
    console.log(queue.time)
    console.log(queue.printQueue());

})

app.get('/send',(req,res)=>{
    var mailOptions = {
        from: 'msaurabh50703@gmail.com',
        to: 'msaurabh50702@gmail.com',
        subject: 'Order Completed',
        html: temp("shop_name","oid","Saurabh",200)
      };
      
      sender.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
})




//Initialize Server 
app.listen(process.env.PORT,()=>{
    console.log("Server is Running...!");
    /*fs.readFile("details.json",async (err,data)=>{
        shop = await JSON.parse(data)
        console.log(shop)
    });*/
})


//Final Deploy