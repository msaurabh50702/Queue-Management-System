let shop = require("../details.json");
let Products = require("../DB/schema").Products

module.exports ={
    disp_shops:(req,res)=>{
        res.cookie('theme', 'blue')
        return res.render("shops",{title:"Queue Management System",shop_name:shop[0].name,shop_details:JSON.stringify(shop),layout:"user_layout"})
    },
    disp_products:async(req,res)=>{
        try{
            res.cookie('theme', shop[req.query.id].theme)
            req.session.shop_id = req.query.id
        } catch (error) {
            return res.send("Page Refreshed")
        }
        await Products.find({sys_name:req.query['shop_name']},{id:0,createdAt:0,updatedAt:0,__v:0}).then(data=>{
            return res.render("disp_prod",{title:req.query['shop_name'],shop_name:shop[req.query.id].name,prod_details:JSON.stringify(data),layout:"user_layout"})
        }).catch(err=>{
            console.log(err)
        })
    },
    checkout:(req,res)=>{
        ids = req.body.Product_id.split('"').join("")
        ids = ids.replace("{","").replace("}","").split(",")
        id = {}
        id_arr = []
        ids.forEach(i=>{
            a = i.split(":")
            id[String(a[0])] = a[1]
            id_arr.push(String(a[0]))
        })
        Products.find({"_id" : { "$in" : id_arr}}).then(data=>{
            try{
                return res.render("checkout",{title:'Checkout',shop_name:shop[req.session.shop_id].name,prod_details:JSON.stringify(data),layout:"user_layout"})
            } catch (error) {
                return res.send("Page Refreshed")
            }
        }).catch(err=>{
            console.log(err)
        })
    }

}