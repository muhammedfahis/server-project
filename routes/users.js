const express = require("express");
const router = express.Router();
const User = require("../models/User");
const session = require("express-session");
const Product = require("../models/product");
const mkdirp = require("mkdirp");
const resizeimg = require("resize-img");
const multer = require("multer");
const path = require("path");
const progress = require("progress-stream");
const axios = require("axios");
const FormData = require("form-data");
const Address = require("../models/address");
const paypal = require("paypal-rest-sdk");
const Order = require("../models/orders");
const fs = require("fs");
var MongoDBStore = require("connect-mongodb-session")(session);
var store = new MongoDBStore({
  uri: "mongodb://localhost:27017/connect_mongodb_session_test",
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

// paypal config

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
let productPrice;
let productId;
let newProduct;
let newVideo;
let priceValue;
let backProductId;
var projectName;

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

var upload = multer({
  storage: Storage,
}).single("image"); //Field name and max count

router.use(
  session({
    secret: "ok",
    name: "userCookie",
    store: store,
    saveUninitialized: false,
    resave: false,

    cookie: {
      maxAge: 60 * 1000 * 60 * 60 * 24 * 30,
    },
  })
);

router.use(
  "/login_verify",
  session({
    secret: "ok",
    name: "userCookie",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60 * 1000 * 60 * 60 * 24 * 30,
    },
  })
);

const userLoginChecker = (req, res, next) => {
  if (!req.session.email) {
    res.redirect("/login");
  } else {
    next();
  }
};

const DirectToDashboard = (req, res, next) => {
  if (req.session.email) {
    res.redirect("/");
  } else {
    next();
  }
};

//get routes
//user
router.get("/signup", DirectToDashboard, (req, res) => {
  res.render("signup", { style: "signup.css" });
});

router.get("/login", DirectToDashboard, (req, res) => {
  res.render("login", { style: "login.css" });
});

router.get("/verify_mobile", (req, res) => {
  res.render("forgotten", { style: "forgotten.css" });
});

router.get("/confirm_password", (req, res) => {
  res.render("confirm_pass", { style: "confirm_pass.css" });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie("userCookie");
  res.redirect("/");
});

// category

router.get("/art", (req, res) => {
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
});

router.get("/tech", (req, res) => {
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
});

router.get("/fashion", (req, res) => {
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
});

router.get("/craft", (req, res) => {
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
});

// products

router.get("/start_project", (req, res) => {
  var isLogged;
  if (req.session.email) {
    isLogged = true;
    res.render("startProject", {
      style: "start_project.css",
      isLogged,
      email: req.session.email,
    });
  } else {
    res.render("startProject", { style: "start_project.css" });
  }
});

//  render confirm project page

router.get("/confrim_page", (req, res) => {
  res.render("confirmation_page", { style: "signup.css" });
});

router.get("/rules", userLoginChecker, (req, res) => {
  var isLogged;
  if (req.session.email) {
    isLogged = true;
    res.render("project_rules", {
      style: "project_rules.css",
      isLogged,
      email: req.session.email,
    });
  } else {
    res.render("project_rules", { style: "project_rules.css" });
  }
});

// landingpage

router.get("/", (req, res) => {
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
});

// products page

router.get("/items/:id", (req, res) => {
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
});

// comment page

router.get("/comments/:id", (req, res) => {
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
});

//  opt verification
router.get("/verify_otp", (req, res) => {
  res.render("otp_verification", { style: "otpverify.css" });
});

//  login with otp
router.get("/otp_login", (req, res) => {
  res.render("otp_login", { style: "otp_login.css" });
});

//  verify the otp when login
router.get("/login_verify", (req, res) => {
  res.render("login_otpverify", { style: "otpverify.css" });
});

//  render the myproject page
router.get("/myproject", (req, res) => {
  Product.find({ projectId: req.session.email }).exec((err, data) => {
    if (err) throw err;
    res.render("myproject", { data: data, style: "myproject.css" });
  });
});
// view the item from the product page

// router.get("/item/:id", (req, res) => {
//   const id = req.params.id;
//   Product.find({ _id: id }).exec((err, data) => {
//     if (err) throw err;

//     res.render("myprojectview", { data: data, style: "product_page.css" });
//   });
// });

//my orders page

router.get("/myorders", (req, res) => {
  Order.find({ email: req.session.email, type: "pre-order" }).exec(
    (err, data) => {
      if (err) throw err;
      res.render("myorders", { style: "signup.css", data: data });
    }
  );
});

//  payment Address page

router.get("/address_page", (req, res) => {
  res.render("addresspage", { style: "signup.css" });
});

//  back up page runder

router.get("/back_page", (req, res) => {
  res.render("backup.hbs", { style: "backup.css" });
});

//post routers

// users

router.post("/signup", (req, res) => {
  const { name, email, password, confirmPassword, phone } = req.body;
  // if (password !== confirmPassword) {
  //   status = false;
  //   res.render("signup", {
  //     name: name,
  //     email: email,
  //     password: password,
  //     msg: "enter same password",
  //   });

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
});

router.post("/login", (req, res) => {
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
});

//  forgot password

router.post("/confirm_password", (req, res) => {
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
});

// axios ...................................................................

router.post("/verify_otp", (req, res) => {
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
});

router.get("/resend_otp", (req, res) => {
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
});

router.post("/otp_login", (req, res) => {
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
});

router.post("/login_verify", (req, res) => {
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
});

router.get("/resend_login_otp", (req, res) => {
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
});

// product upload

router.post("/project_upload", (req, res) => {
  imagePath = req.body.discription
  projectName = `${req.body.discription}.png`
  var datatoconvert = req.body.imageData;
  let base64Image = datatoconvert.split(";base64,").pop();
  fs.writeFile(`public/images/${imagePath}.png`, base64Image, { encoding: "base64" }, function (
    err
  ) {
    newProduct = {
      category: req.body.category,
      country: req.body.country,
      discription: req.body.discription,
      checkbox_1: req.body.checkbox_1,
      checkbox_2: req.body.checkbox_2,
      price: req.body.price,
      target: req.body.target,
      details: req.body.details,
      img: projectName,
      projectId: req.session.email,
    };

    res.render("videoupload", {
      name: req.body.discription,
      style: "signup.css",
    });
  });
});

// video upload

router.post("/upload_video", (req, res) => {

  
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
     

      var filename = req.file.filename;
      newVideo = ({
        video: filename,
      });

      res.render("confirmation_page", {video: newVideo, project: newProduct });
    }
  });
 
});

// skip video upload

router.post('/skip_video',(req,res)=>{
  res.render('confirmation_page',{project: newProduct})
})


//  confirmation of adding project

router.post("/confirm_project", (req, res) => {

  if(newVideo){
  const confirmProduct = new Product({
    category: newProduct.category,
    discription: newProduct.discription,
    price: newProduct.price,
    target: newProduct.target,
    img: newProduct.img,
    checkbox_1: newProduct.checkbox_1,
    checkbox_2: newProduct.checkbox_2,
    country: newProduct.country,
    Date: Date.now(),
    video: newVideo.video,
    projectId: req.session.email,
    details: newProduct.details,
  });
  console.log(newProduct)
  confirmProduct.save();
  res.redirect("/");
}else{
  const confirmProduct = new Product({
    category: newProduct.category,
    discription: newProduct.discription,
    price: newProduct.price,
    target: newProduct.target,
    img: newProduct.img,
    checkbox_1: newProduct.checkbox_1,
    checkbox_2: newProduct.checkbox_2,
    country: newProduct.country,
    Date: Date.now(),
    projectId: req.session.email,
    details: newProduct.details,
  });
  console.log(newProduct)
  confirmProduct.save();
  res.redirect("/");
}
});

// comment page

router.post("/comments", (req, res) => {
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
    }
  );
});



// filter

router.post("/filter", (req, res) => {
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
});

router.post("/dlt_project", (req, res) => {
  const id = req.body.id;
  console.log(id);

  Product.findOneAndDelete({ _id: id }, (err) => {
    if (err) throw err;
    res.redirect("/myproject");
  });
});

router.post("/edt_project", (req, res) => {
  Product.findOne({ _id: req.body.id }).exec((err, data) => {
    if (err) throw err;
    res.render("edt_project", { data: data, style: "signup.css" });
  });
});

router.post("/edt_upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(req.file.path);

      var filename = req.file.filename;
    }
    Product.updateOne(
      { _id: req.body.id },
      {
        $set: {
          discription: req.body.discription,
          price: req.body.price,
          target: req.body.target,
          details: req.body.details,
          img: filename,
        },
      },
      (err) => {
        if (err) throw err;
      }
    );
  });
  res.redirect("/myproject");
});

//  paypal complete works

// redirecting to Address page

router.post("/address_page", (req, res) => {
  const id = req.body.id;

  if (req.session.email) {
    Product.findOne({ _id: id }).exec((err, data) => {
      res.render("addresspage", { data: data });
    });
  } else {
    res.redirect("/login");
  }
});
//  reading users address when preorder the item

router.post("/redirect_payment", (req, res) => {
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
});

// success payment

router.get("/success", (req, res) => {
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
});

router.get("/cancel", (req, res) => res.send("Cancelled"));
// ended payment .....................................

// back post router

router.post("/back_page", (req, res) => {
  const id = req.body.id;

  Product.findOne({ _id: id }).exec((err, data) => {
    if (err) throw err;
    res.render("backup", { data: data, style: "backup.css" });
  });
});

//  back payment router
router.post("/back_project", (req, res) => {
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
});

//  back success router

router.get("/back_success", async (req, res) => {
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
});

// backup cancel router

router.get("/back_cancel", (req, res) => res.send("Cancelled"));



module.exports = router;
