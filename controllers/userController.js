const User = require("../models/User");
const Product = require("../models/product");
const axios = require("axios");
const FormData = require("form-data");
const paypal = require("paypal-rest-sdk");


paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
      "ATRdJYxiszV1z9a8znZHASfrY4RqhRgULjNtytARzB0gEKLjz92Tq88bUOTD1-aOHenPAfb6kzBVqVNd",
    client_secret:
      "EPGTGXhvezBRAHql2lBxL1XuHKsPtibPO-wCjiM2Kq_OWY6AspHLVqNTz3r9zzQgnKia5u-1dyK5NQBl",
  });
  
  let otpId;
  let login_otpId;
  let newUser;
  
  
  
  
  
  





function userController(){

    return{
        
        userSignup(req, res) {
            res.render("signup", { style: "signup.css" });
        },
        userLogin(req,res){
            res.render("login", { style: "login.css" });
        },
        verifyMobile(req,res){
            res.render("forgotten", { style: "forgotten.css" });
        },
        confirmPassword(req,res){
            res.render("confirm_pass", { style: "confirm_pass.css" });
        },
        userLogout(req,res){
            req.session.destroy();
            res.clearCookie("userCookie");
            res.redirect("/");
        },
        doSignUp(req,res){
            const { name, email, password, confirmPassword, phone } = req.body;
            User.find({}, { email: 1, number: 1 }, (err, data) => {
              console.log(data);
              if (err) throw err;
              if (data.email == email) {
                res.render("signup", {
                  name: name,
                  msg: "account already taken",
                });
              } else if (data.number == phone) {
                res.render("signup", {
                  name: name,
                  msg: "account already taken",
                });
              } else if (password !== confirmPassword) {
                res.render("signup", {
                  name: name,
                  email: email,
                  password: password,
                  msg: "enter same password",
                });
              } else {
                newUser = new User({
                  email: email,
                  name: name,
                  password: password,
                  number: phone,
                });
          
                let number = req.body.phone;
                req.body.phone = req.body.email;
          
                var data = new FormData();
                data.append("mobile", "91" + number);
                data.append("sender_id", "SMSINFO");
                data.append("message", "Your otp code is {code}");
                data.append("expiry", "900");
          
                var config = {
                  method: "post",
                  url: "https://d7networks.com/api/verifier/send",
                  headers: {
                    Authorization: "Token dccd9c351287aecd7a771e261a9ce8937e7011aa",
                    ...data.getHeaders(),
                  },
                  data: data,
                };
          
                axios(config)
                  .then(function (response) {
                    otpId = response.data.otp_id;
                    console.log(JSON.stringify(response.data));
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
          
                res.redirect("/verify_otp");
              }
            });
        },
        doLogin(req,res){
            const { email, password } = req.body;

     User.findOne({ email: email, password: password })
    .lean()
    .exec((err, data) => {
      if (data) {
        var isLogged;
        if (data.status === true) {
          req.session.email = email;
          res.redirect("/");
        } else {
          res.render("login", {
            msg: "you have been blocked",
            style: "login.css",
          });
        }
      } else {
        res.render("login", {
          msg: "invalid email or password",
          style: "login.css",
        });
      }
    });
        },
        doConfirmPass(req,res){
            const { email, password, confirmpassword } = req.body;

            if (password !== confirmpassword) {
              console.log("Enter same password");
              res.render("confirm_pass", {
                style: "confirm_pass.css",
                msg: "wrong password",
                email: email,
                password: password,
              });
            } else {
              User.updateOne(
                { email: email },
                { $set: { password: password, number: req.body.phone } },
                (err) => {
                  if (err) throw err;
                }
              );
              res.redirect("/login");
            }
        },
        doVerifyOtp(req,res){
            var data = new FormData();
  data.append("otp_id", otpId);
  data.append("otp_code", req.body.otp);
  console.log(req.body.otp);

  var config = {
    method: "post",
    url: "https://d7networks.com/api/verifier/verify",
    headers: {
      Authorization: "Token dccd9c351287aecd7a771e261a9ce8937e7011aa",
      ...data.getHeaders(),
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      if (response.data.status === "success") {
        newUser.save();
        res.redirect("/login");
      } else {
        res.render("otp_verification", { err: "invalid otp" });
      }
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
        },

        doResendOtp(req,res){
            var data = new FormData();
  data.append("otp_id", otpId);

  var config = {
    method: "post",
    url: "https://d7networks.com/api/verifier/resend",
    headers: {
      Authorization: "Token dccd9c351287aecd7a771e261a9ce8937e7011aa",
      ...data.getHeaders(),
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
  res.redirect("/verify_otp");
        
         },
         doOtpLogin(req,res){
            const phone = req.body.phone;
            User.findOne({ number: req.body.phone }).exec((err, data) => {
              if (err) throw err;
              if (data) {
                var data = new FormData();
                data.append("mobile", "91" + phone);
                data.append("sender_id", "SMSINFO");
                data.append("message", "Your otp code is {code}");
                data.append("expiry", "900");
          
                var config = {
                  method: "post",
                  url: "https://d7networks.com/api/verifier/send",
                  headers: {
                    Authorization: "Token dccd9c351287aecd7a771e261a9ce8937e7011aa",
                    ...data.getHeaders(),
                  },
                  data: data,
                };
          
                axios(config)
                  .then(function (response) {
                    login_otpId = response.data.otp_id;
                    console.log(JSON.stringify(response.data));
                    res.render("login_otpverify", { phone: req.body.phone });
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              } else {
                res.render("otp_login", {
                  msg: "invalid number",
                  style: "otp_login.css",
                });
              }
            });
         },

         doLoginVerify(req,res){
            let phone = req.body.phone;
            console.log(phone);
            var data = new FormData();
            data.append("otp_id", login_otpId);
            data.append("otp_code", req.body.otp);
            console.log(req.body.otp);
          
            var config = {
              method: "post",
              url: "https://d7networks.com/api/verifier/verify",
              headers: {
                Authorization: "Token dccd9c351287aecd7a771e261a9ce8937e7011aa",
                ...data.getHeaders(),
              },
              data: data,
            };
          
            axios(config)
              .then(function (response) {
                if (response.data.status === "success") {
                  req.session.email = req.body.phone;
          
                  Product.find({}).exec((err, data) => {
                    if (err) throw err;
                    var isLogged;
                    if (req.session.email) {
                      isLogged = true;
                      return res.render("landingpage", {
                        data: data,
                        style: "landingpage.css",
                        isLogged,
                        email: req.session.email,
                      });
                    } else {
                      return res.render("landingpage", {
                        data: data,
                        style: "landingpage.css",
                      });
                    }
                  });
                } else {
                  res.render("login_otpverify", { err: "invalid otp" });
                }
                console.log(JSON.stringify(response.data));
              })
              .catch(function (error) {
                console.log(error);
              });
         },
         resendLoginOtp(req,res){
            var data = new FormData();
            data.append("otp_id", login_otpId);
          
            var config = {
              method: "post",
              url: "https://d7networks.com/api/verifier/resend",
              headers: {
                Authorization: "Token dccd9c351287aecd7a771e261a9ce8937e7011aa",
                ...data.getHeaders(),
              },
              data: data,
            };
          
            axios(config)
              .then(function (response) {
                console.log(JSON.stringify(response.data));
              })
              .catch(function (error) {
                console.log(error);
              });
            res.redirect("/verify_otp");
         },
         



    }

}



module.exports =userController;