const Product = require("../models/product");
const multer = require("multer");
const path = require("path");
const Order = require("../models/orders");



var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, "./public/images");
    },
    filename: function (req, file, callback) {
      callback(
        null,
        file.fieldname + "_" + Date.now() + "_" + path.extname(file.originalname)
      );
    },
  });




// paypal config



var upload = multer({
    storage: Storage,
  }).single("image"); //Field name and max count




  function productController(){
      return{
          artCategory(req,res){
            Product.find({ category: "Arts" }).exec((err, data) => {
                if (err) throw err;
                var isLogged;
                if (req.session.email) {
                  isLogged = true;
                  res.render("landingpage", {
                    data: data,
                    style: "landingpage.css",
                    isLogged,
                    email: req.session.email,
                  });
                } else {
                  res.render("landingpage", { data: data, style: "landingpage.css" });
                }
              });
          },
          techCategory(req,res){
            Product.find({ category: "Tech" }).exec((err, data) => {
                if (err) throw err;
                var isLogged;
                if (req.session.email) {
                  isLogged = true;
                  res.render("landingpage", {
                    data: data,
                    style: "landingpage.css",
                    isLogged,
                    email: req.session.email,
                  });
                } else {
                  res.render("landingpage", { data: data, style: "landingpage.css" });
                }
              });
          },
          fashionCategory(req,res){
            Product.find({ category: "Fashion" }).exec((err, data) => {
                if (err) throw err;
                var isLogged;
                if (req.session.email) {
                  isLogged = true;
                  res.render("landingpage", {
                    data: data,
                    style: "landingpage.css",
                    isLogged,
                    email: req.session.email,
                  });
                } else {
                  res.render("landingpage", { data: data, style: "landingpage.css" });
                }
              });
          },
          craftCategory(req,res){
            Product.find({ category: "Craft" }).exec((err, data) => {
                if (err) throw err;
                var isLogged;
                if (req.session.email) {
                  isLogged = true;
                  res.render("landingpage", {
                    data: data,
                    style: "landingpage.css",
                    isLogged,
                    email: req.session.email,
                  });
                } else {
                  res.render("landingpage", { data: data, style: "landingpage.css" });
                }
              });
          },
          landingPage(req,res){
            Product.find({}).exec((err, data) => {
                if (err) throw err;
                var isLogged;
            
                if (req.session.email) {
                  isLogged = true;
                  res.render("landingpage", {
                    data: data,
                    style: "landingpage.css",
                    isLogged,
                    email: req.session.email,
                  });
                } else {
                  res.render("landingpage", { data: data, style: "landingpage.css" });
                }
              });
          },
          productDisplay(req,res){
            const id = req.params.id;

            Order.count({ productId: id, type: "back" }).exec((err, count) => {
              if (err) throw err;
          
              Order.aggregate([
                { $match: { productId: id, status: true } },
                { $group: { _id: null, amount: { $sum: "$amount" } } },
              ]).exec((err, amount) => {
                console.log(amount);
          
                let pledged = amount[0];
          
                Product.findOne({ _id: id }).exec((err, data) => {
                  if (err) throw err;
                  console.log(data);
                  let date = new Date().getTime();
                  let difference = data.projectDate - date;
                  difference = Math.abs(difference);
                  let differenceInDays = difference / 1000 / 60 / 60 / 24;
                  differenceInDays = Math.round(differenceInDays);
                  let countDown = 60 - differenceInDays;
          
                  if (req.session.email) {
                    var isLogged = true;
                    res.render("product_page", {
                      data: [data],
                      count,
                      pledged,
                      countDown,
                      style: "product_page.css",
                      isLogged,
                      email: req.session.email,
                    });
                  } else {
                    res.render("product_page", { data: data, style: "product_page.css" });
                  }
                });
              });
            });
          },
          commentProduct(req,res){
            const id = req.params.id;
            Order.count({ productId: id, type: "back" }).exec((err, count) => {
              if (err) throw err;
          
              Order.aggregate([
                { $match: { productId: id, status: true } },
                { $group: { _id: null, amount: { $sum: "$amount" } } },
              ]).exec((err, amount) => {
                console.log(amount);
          
                let pledged = amount[0];
                Product.findOne({ _id: id }).exec((err, data) => {
                  if (err) throw err;
                  console.log(data);
                  let date = new Date().getTime();
                  let difference = data.projectDate - date;
                  difference = Math.abs(difference);
                  let differenceInDays = difference / 1000 / 60 / 60 / 24;
                  differenceInDays = Math.round(differenceInDays);
                  let countDown = 60 - differenceInDays;
          
                  var isLogged;
                  if (req.session.email) {
                    isLogged = true;
                    res.render("commentPage", {
                      data: [data],
                      pledged,
                      count,
                      countDown,
                      style: "commentPage.css",
                      isLogged,
                      email: req.session.email,
                    });
                  } else {
                    res.render("commentPage", { data: data, style: "commentPage.css" });
                  }
                });
              });
            });
          },
          otpVerifyPage(req,res){
            res.render("otp_verification", { style: "otpverify.css" });
          },
          otpLoginPage(req,res){
            res.render("otp_login", { style: "otp_login.css" });
          },
          verifyLogin(req,res){
            res.render("login_otpverify", { style: "otpverify.css" });
          },
          myProjectPage(req,res){
            Product.find({ projectId: req.session.email }).exec((err, data) => {
                if (err) throw err;
                res.render("myproject", { data: data, style: "myproject.css" });
              });
          },
          myOrderPage(req,res){
            Order.find({ email: req.session.email, type: "pre-order" }).exec(
                (err, data) => {
                  if (err) throw err;
                  res.render("myorders", { style: "signup.css", data: data });
                }
              );
          },
          doCommentProduct(req,res){
            Product.updateOne(
                { _id: req.body._id },
                {
                  $push: {
                    comments: req.body.comment,
                    username: req.body.username,
                    Date: Date.now(),
                  },
                },
                (err) => {
                  if (err) throw err;
            
                  Product.find({ _id: req.body._id })
                    .lean()
                    .exec((err, data) => {
                      if (err) throw err;
                      var isLogged;
                      if (req.session.email) {
                        isLogged = true;
                        res.render("commentPage", {
                          data: data,
                          style: "product_page.css",
                          isLogged,
                          email: req.session.email,
                        });
                      } else {
                        res.render("commentPage", {
                          data: data,
                          style: "product_page.css",
                        });
                      }
                    });
                });
        },

        doFilterProducts(req,res){
          if (req.body.conditions === "new") {
            Product.find({})
              .sort({ Date: "asc" })
              .exec((err, data) => {
                var isLogged;
                if (req.session.email) {
                  isLogged = true;
                  res.render("landingpage", {
                    data: data,
                    style: "landingpage.css",
                    isLogged,
                    email: req.session.email,
                  });
                } else {
                  res.render("landingpage", { data: data, style: "landingpage.css" });
                }
              });
          } else if (req.body.conditions === "old") {
            Product.find({})
              .sort({ Date: -1 })
              .exec((err, data) => {
                var isLogged;
                if (req.session.email) {
                  isLogged = true;
                  res.render("landingpage", {
                    data: data,
                    style: "landingpage.css",
                    isLogged,
                    email: req.session.email,
                  });
                } else {
                  res.render("landingpage", { data: data, style: "landingpage.css" });
                }
              });
          } else if (req.body.conditions === "high_price") {
            Product.find({})
              .sort({ price: -1 })
              .exec((err, data) => {
                var isLogged;
                if (req.session.email) {
                  isLogged = true;
                  res.render("landingpage", {
                    data: data,
                    style: "landingpage.css",
                    isLogged,
                    email: req.session.email,
                  });
                } else {
                  res.render("landingpage", { data: data, style: "landingpage.css" });
                }
              });
          } else if (req.body.conditions === "low_price") {
            Product.find({})
              .sort({ price: 1 })
              .exec((err, data) => {
                var isLogged;
                if (req.session.email) {
                  isLogged = true;
                  res.render("landingpage", {
                    data: data,
                    style: "landingpage.css",
                    isLogged,
                    email: req.session.email,
                  });
                } else {
                  res.render("landingpage", { data: data, style: "landingpage.css" });
                }
              });
          } else if (req.body.conditions === "under25") {
            Product.find({ price: { $lt: 2500 } }).exec((err, data) => {
              var isLogged;
              if (req.session.email) {
                isLogged = true;
                res.render("landingpage", {
                  data: data,
                  style: "landingpage.css",
                  isLogged,
                  email: req.session.email,
                });
              } else {
                res.render("landingpage", { data: data, style: "landingpage.css" });
              }
            });
          } else if (req.body.conditions === "25to50") {
            Product.find({ price: { $gt: 2500, $lt: 5000 } }).exec((err, data) => {
              var isLogged;
              if (req.session.email) {
                isLogged = true;
                res.render("landingpage", {
                  data: data,
                  style: "landingpage.css",
                  isLogged,
                  email: req.session.email,
                });
              } else {
                res.render("landingpage", { data: data, style: "landingpage.css" });
              }
            });
          } else if (req.body.conditions === "50to100") {
            Product.find({ price: { $gt: 5000, $lt: 10000 } }).exec((err, data) => {
              var isLogged;
              if (req.session.email) {
                isLogged = true;
                res.render("landingpage", {
                  data: data,
                  style: "landingpage.css",
                  isLogged,
                  email: req.session.email,
                });
              } else {
                res.render("landingpage", { data: data, style: "landingpage.css" });
              }
            });
          } else if (req.body.conditions == "100*") {
            Product.find({ price: { $gt: 10000 } }).exec((err, data) => {
              var isLogged;
              if (req.session.email) {
                isLogged = true;
                res.render("landingpage", {
                  data: data,
                  style: "landingpage.css",
                  isLogged,
                  email: req.session.email,
                });
              } else {
                res.render("landingpage", { data: data, style: "landingpage.css" });
              }
            });
          } else if (req.body.conditions === "0-25") {
            Product.find({ target: { $lt: 250000 } }).exec((err, data) => {
              var isLogged;
              if (req.session.email) {
                isLogged = true;
                res.render("landingpage", {
                  data: data,
                  style: "landingpage.css",
                  isLogged,
                  email: req.session.email,
                });
              } else {
                res.render("landingpage", { data: data, style: "landingpage.css" });
              }
            });
          } else if (req.body.conditions === "25-50") {
            Product.find({ target: { $gt: 250000, $lt: 500000 } }).exec((err, data) => {
              var isLogged;
              if (req.session.email) {
                isLogged = true;
                res.render("landingpage", {
                  data: data,
                  style: "landingpage.css",
                  isLogged,
                  email: req.session.email,
                });
              } else {
                res.render("landingpage", { data: data, style: "landingpage.css" });
              }
            });
          } else if (req.body.conditions === "50-100") {
            Product.find({ target: { $gt: 500000, $lt: 1000000 } }).exec(
              (err, data) => {
                var isLogged;
                if (req.session.email) {
                  isLogged = true;
                  res.render("landingpage", {
                    data: data,
                    style: "landingpage.css",
                    isLogged,
                    email: req.session.email,
                  });
                } else {
                  res.render("landingpage", { data: data, style: "landingpage.css" });
                }
              }
            );
          } else if (req.body.conditions === "100above") {
            Product.find({ target: { $gt: 1000000 } }).exec((err, data) => {
              var isLogged;
              if (req.session.email) {
                isLogged = true;
                res.render("landingpage", {
                  data: data,
                  style: "landingpage.css",
                  isLogged,
                  email: req.session.email,
                });
              } else {
                res.render("landingpage", { data: data, style: "landingpage.css" });
              }
            });
          } else {
            res.redirect("/");
          }
        }
      }
  }


  module.exports = productController