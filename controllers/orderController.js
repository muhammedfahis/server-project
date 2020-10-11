const User = require("../models/User");
const Product = require("../models/product");
const Address = require("../models/address");
const paypal = require("paypal-rest-sdk");
const Order = require("../models/orders");




  
  
  let productPrice;
  let productId;
  let priceValue;
  let backProductId;
  



  function orderController(){

    return{
        addressPage(req,res){
            res.render("addresspage", { style: "signup.css" });
        },
        backPage(req,res){
            res.render("backup.hbs", { style: "backup.css" });
        },
        doLoadAddressPage(req,res){
          const id = req.body.id;

          if (req.session.email) {
            Product.findOne({ _id: id }).exec((err, data) => {
              res.render("addresspage", { data: data });
            });
          } else {
            res.redirect("/login");
          }
        },
        doRedirectToPayment(req,res){
          productId = req.body.id;

          productPrice = req.body.price.toString();
          const { name, phone, country, address } = req.body;
        
          const newAddress = new Address({
            email: req.session.email,
            name: name,
            phone: phone,
            country: country,
            address: address,
          });
          newAddress.save();
        
          const newOrder = new Order({
            amount: productPrice,
            email: req.session.email,
            productId: productId,
            Date: Date.now(),
            img: req.body.image,
            discription: req.body.discription,
          });
          newOrder.save();
        
          const create_payment_json = {
            intent: "sale",
            payer: {
              payment_method: "paypal",
            },
            redirect_urls: {
              return_url: "http://localhost:3000/success",
              cancel_url: "http://localhost:3000/cancel",
            },
            transactions: [
              {
                item_list: {
                  items: [
                    {
                      name: "" + req.body.discription,
                      sku: "001",
                      price: productPrice,
                      currency: "USD",
                      quantity: 1,
                    },
                  ],
                },
                amount: {
                  currency: "USD",
                  total: productPrice,
                },
                description: "Hat for the best team ever",
              },
            ],
          };
        
          paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
              throw error;
            } else {
              for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                  res.redirect(payment.links[i].href);
                }
              }
            }
          });
        },
        doRedirectToSuccess(req,res){
          const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  console.log(req.query);

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: productPrice,
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));

      Address.updateOne(
        { email: req.session.email },
        { $set: { payed: true } },
        (err) => {
          if (err) throw err;
        }
      );
      Order.updateOne(
        { productId: productId, email: req.session.email },
        { $set: { paymentId: paymentId, status: true, type: "pre-order" } },
        (err) => {
          if (err) throw err;
          res.redirect("/myorders");
        }
      );
    }
  });
        },
        doRedirectToCancel(req,res){
          res.send("Cancelled")
        },
        doRenderBackPage(req,res){
          const id = req.body.id;

          Product.findOne({ _id: id }).exec((err, data) => {
            if (err) throw err;
            res.render("backup", { data: data, style: "backup.css" });
          });
        },
        doBackProject(req,res){
          priceValue = req.body.product;
          backProductId = req.body.id;
        
          const create_payment_json = {
            intent: "sale",
            payer: {
              payment_method: "paypal",
            },
            redirect_urls: {
              return_url: "http://localhost:3000/back_success",
              cancel_url: "http://localhost:3000/back_cancel",
            },
            transactions: [
              {
                item_list: {
                  items: [
                    {
                      name: "" + req.body.name,
                      sku: "001",
                      price: "" + priceValue,
                      currency: "USD",
                      quantity: 1,
                    },
                  ],
                },
                amount: {
                  currency: "USD",
                  total: "" + priceValue,
                },
                description: "Hat for the best team ever",
              },
            ],
          };
        
          paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
              throw error;
            } else {
              for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                  res.redirect(payment.links[i].href);
                }
              }
            }
          });
        },
        doRedirectBackSuccess(req,res){
          const payerId = req.query.PayerID;
          const paymentId = req.query.paymentId;
        
          console.log(req.query);
        
          const execute_payment_json = {
            payer_id: payerId,
            transactions: [
              {
                amount: {
                  currency: "USD",
                  total: "" + priceValue,
                },
              },
            ],
          };
        
          paypal.payment.execute(paymentId, execute_payment_json, function (
            error,
            payment
          ) {
            if (error) {
              console.log(error.response);
              throw error;
            } else {
              console.log(JSON.stringify(payment));
        
              const newBack = new Order({
                amount: priceValue,
                type: "back",
                paymentId: paymentId,
                status: true,
                Date: Date.now(),
                email: req.session.email,
                productId: backProductId,
              });
              newBack.save();
            }
          });
          res.redirect("/");
        },
        doCancelBack(req,res){
          res.send("Cancelled")
        }
    }
  }

  module.exports =orderController;