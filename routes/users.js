const express = require('express');
const router = express.Router();
const User = require('../models/User');
const session = require('express-session');
const Product = require('../models/product');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const resizeimg = require('resize-img');
const multer = require('multer');
const path = require('path');
const progress = require('progress-stream');
const axios = require('axios');
const FormData = require('form-data');
// const { response } = require('express');


let otpId;
let login_otpId;
let newUser;








var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/images");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + path.extname(file.originalname));
  },
});

var upload = multer({
  storage: Storage,
}).single("image"); //Field name and max count



router.use(session({
  secret: 'ok',
  name: 'userCookie',
  saveUninitialized: false,
  resave: false,

  cookie: {
    maxAge: 60 * 1000 * 60 * 60 * 24 * 30
  }
}));

router.use("/login_verify", session({
  secret: 'ok',
  name: 'userCookie',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60 * 1000 * 60 * 60 * 24 * 30
  }


}))

const userLoginChecker = (req, res, next) => {
  if (!req.session.email) {
    res.redirect('/users/login');
  } else {
    next();
  }
}

const DirectToDashboard = (req, res, next) => {
  if (req.session.email) {
    res.redirect('/users/landingpage');
  } else {
    next();
  }
}

//get routes
//user
router.get('/signup', DirectToDashboard, (req, res) => {
  res.render('signup', { style: 'signup.css' });
});

router.get('/login', DirectToDashboard, (req, res) => {
  res.render('login', { style: 'login.css' });
});

router.get('/verify_mobile', (req, res) => {
  res.render('forgotten', { style: 'forgotten.css' });
});

router.get('/confirm_password', (req, res) => {
  res.render('confirm_pass', { style: 'confirm_pass.css' });

})

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('userCookie');
  res.redirect('/users/landingpage');
})

// category

router.get('/art', (req, res) => {

  Product.find({ category: 'Arts' }).exec((err, data) => {
    if (err) throw err;
    var isLogged;
    if (req.session.email) {
      isLogged = true;
      res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email });
    } else {
      res.render('landingpage', { data: data, style: 'landingpage.css' });

    }
  })
});

router.get('/tech', (req, res) => {

  Product.find({ category: 'Tech' }).exec((err, data) => {
    if (err) throw err;
    var isLogged;
    if (req.session.email) {
      isLogged = true;
      res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email });
    } else {
      res.render('landingpage', { data: data, style: 'landingpage.css' });
    }
  })
});

router.get('/fashion', (req, res) => {

  Product.find({ category: 'Fashion' }).exec((err, data) => {
    if (err) throw err;
    var isLogged;
    if (req.session.email) {

      isLogged = true;
      res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email });
    } else {
      res.render('landingpage', { data: data, style: 'landingpage.css' });
    }
  })
});

router.get('/craft', (req, res) => {
  Product.find({ category: 'Craft' }).exec((err, data) => {
    if (err) throw err;
    var isLogged;
    if (req.session.email) {
      isLogged = true;
      res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email });
    } else {
      res.render('landingpage', { data: data, style: 'landingpage.css' });
    }
  });
});




// products


router.get('/start_project', (req, res) => {
  var isLogged;
  if (req.session.email) {
    isLogged = true;
    res.render('startProject', { style: 'start_project.css', isLogged, email: req.session.email });
  } else {
    res.render('startProject', { style: 'start_project.css' });
  }
});

router.get('/rules', userLoginChecker, (req, res) => {
  var isLogged;
  if (req.session.email) {
    isLogged = true;
    res.render('project_rules', { style: 'project_rules.css', isLogged, email: req.session.email });
  } else {
    res.render('project_rules', { style: 'project_rules.css' });
  }
});

// landingpage

router.get('/landingpage', (req, res) => {
  Product.find({}).exec((err, data) => {
    if (err) throw err;
    var isLogged;

    if (req.session.email) {
      isLogged = true;
      res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email });
    } else {
      res.render('landingpage', { data: data, style: 'landingpage.css' });
    }
  })
});

// products page

router.get('/items/:id', (req, res) => {
  const id = req.params.id;
  Product.find({ _id: id }).exec((err, data) => {
    if (err) throw err;

    if (req.session.email) {
      var isLogged = true;
      res.render('product_page', { data: data, style: 'product_page.css', isLogged, email: req.session.email });
    } else {
      res.render('product_page', { data: data, style: 'product_page.css' });
    }
  })
});

// comment page

router.get('/comments/:id', (req, res) => {
  const id = req.params.id;
  Product.find({ _id: id }).exec((err, data) => {
    if (err) throw err;
    var isLogged;
    if (req.session.email) {
      isLogged = true;
      res.render('commentPage', { data: data, style: 'commentPage.css', isLogged, email: req.session.email });
    } else {
      res.render('commentPage', { data: data, style: 'commentPage.css' });
    }
  })
});

router.get('/verify_otp', (req, res) => {
  res.render('otp_verification', { style: 'otpverify.css' });
});

router.get('/otp_login', (req, res) => {
  res.render('otp_login', { style: 'otp_login.css' });
})
router.get('/login_verify', (req, res) => {
  res.render('login_otpverify', { style: 'otpverify.css' });
})







//post routers

// users

router.post('/signup', (req, res) => {
  const { name, email, password, confirmPassword, phone } = req.body
  if (password !== confirmPassword) {
    res.render('signup', { name: name, email: email, password: password });
  } else {

    newUser = new User({
      email: email,
      name: name,
      password: password,
      number: phone

    });
  }
  let number = req.body.phone;
  req.body.phone = req.body.email;

  var data = new FormData();
  data.append('mobile', '91' + number);
  data.append('sender_id', 'SMSINFO');
  data.append('message', 'Your otp code is {code}');
  data.append('expiry', '900');

  var config = {
    method: 'post',
    url: 'https://d7networks.com/api/verifier/send',
    headers: {
      'Authorization': 'Token 975b3cd4c0a23b133ae2f37c270a1d4fe4125e61',
      ...data.getHeaders()
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      otpId = response.data.otp_id;
      console.log(JSON.stringify(response.data));

    })
    .catch(function (error) {
      console.log(error);
    });


  res.redirect('/users/verify_otp');


});



router.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email, password: password }).lean().exec((err, data) => {
    if (data) {
      var isLogged;
      if (data.status === true) {
        req.session.email = email;
        res.redirect('/users/landingpage');
      } else {
        res.render('login', { msg: 'you have been blocked', style: 'login.css' });
      }

    } else {
      res.render('login', { msg: 'invalid email or password', style: 'login.css' });
    }
  })
});

//  forgot password

router.post('/confirm_password', (req, res) => {
  const { email, password, confirmpassword } = req.body;

  if (password !== confirmpassword) {
    console.log('Enter same password');
    res.render('confirm_pass', { style: 'confirm_pass.css', msg: 'wrong password', email: email, password: password });
  } else {
    User.updateOne({ email: email }, { $set: { password: password, number: req.body.phone } }, (err) => {
      if (err) throw err;
    });
    res.redirect('/users/login');
  }

})


// axios ...................................................................




router.post('/verify_otp', (req, res) => {
  var data = new FormData();
  data.append('otp_id', otpId);
  data.append('otp_code', req.body.otp);
  console.log(req.body.otp);

  var config = {
    method: 'post',
    url: 'https://d7networks.com/api/verifier/verify',
    headers: {
      'Authorization': 'Token 975b3cd4c0a23b133ae2f37c270a1d4fe4125e61',
      ...data.getHeaders()
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      if (response.data.status === 'success') {
        newUser.save();
        res.redirect('/users/login');
      } else {
        res.render('otp_verification', { err: "invalid otp" });
      }
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);

    });
});


router.get('/resend_otp', (req, res) => {

  var data = new FormData();
  data.append('otp_id', otpId);

  var config = {
    method: 'post',
    url: 'https://d7networks.com/api/verifier/resend',
    headers: {
      'Authorization': 'Token 975b3cd4c0a23b133ae2f37c270a1d4fe4125e61',
      ...data.getHeaders()
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));

    })
    .catch(function (error) {
      console.log(error);
    });
  res.redirect('/users/verify_otp')
});


router.post('/otp_login', (req, res) => {
  const phone = req.body.phone;
  User.findOne({ number: req.body.phone }).exec((err, data) => {

    if (data) {

      var data = new FormData();
      data.append('mobile', '91' + phone);
      data.append('sender_id', 'SMSINFO');
      data.append('message', 'Your otp code is {code}');
      data.append('expiry', '900');

      var config = {
        method: 'post',
        url: 'https://d7networks.com/api/verifier/send',
        headers: {
          'Authorization': 'Token 975b3cd4c0a23b133ae2f37c270a1d4fe4125e61',
          ...data.getHeaders()
        },
        data: data
      };

      axios(config)
        .then(function (response) {
          login_otpId = response.data.otp_id;
          console.log(JSON.stringify(response.data));
          res.render('login_otpverify', { phone: req.body.phone });

        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      res.render('otp_login', { msg: 'invalid number', style: 'otp_login.css' });
    }
  })
});

router.post('/login_verify', (req, res) => {
  let phone = req.body.phone;
  console.log(phone);
  var data = new FormData();
  data.append('otp_id', login_otpId);
  data.append('otp_code', req.body.otp);
  console.log(req.body.otp);

  var config = {
    method: 'post',
    url: 'https://d7networks.com/api/verifier/verify',
    headers: {
      'Authorization': 'Token 975b3cd4c0a23b133ae2f37c270a1d4fe4125e61',
      ...data.getHeaders()
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      if (response.data.status === 'success') {
        
        req.session.email = req.body.phone;
        

        Product.find({}).exec((err, data) => {
          if (err) throw err;
          var isLogged;
          if (req.session.email) {
            isLogged = true;
            return res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
          } else {
            return res.render('landingpage', { data: data, style: 'landingpage.css' })
          }


        });

      } else {
        res.render('login_otpverify', { err: "invalid otp" });
      }
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);

    });
});

router.get('/resend_login_otp', (req, res) => {
  var data = new FormData();
  data.append('otp_id', login_otpId);

  var config = {
    method: 'post',
    url: 'https://d7networks.com/api/verifier/resend',
    headers: {
      'Authorization': 'Token 975b3cd4c0a23b133ae2f37c270a1d4fe4125e61',
      ...data.getHeaders()
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));

    })
    .catch(function (error) {
      console.log(error);
    });
  res.redirect('/users/verify_otp')
})




// axios



// product upload

router.post('/project_upload', (req, res) => {


  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(req.file.path);

      var filename = req.file.filename

      const newProduct = new Product({
        category: req.body.category,
        country: req.body.country,
        discription: req.body.discription,
        checkbox_1: req.body.checkbox_1,
        checkbox_2: req.body.checkbox_2,
        price: req.body.price,
        target: req.body.target,
        details: req.body.details,
        img: filename,
        Date: Date.now()

      });
      newProduct.save()
      res.redirect('/users/landingpage')
    }
  });
});

// comment page

router.post('/comments', (req, res) => {

  Product.updateOne({ _id: req.body._id }, { $push: { comments: req.body.comment, username: req.body.username, Date: Date.now() } }, ((err, data) => {
    if (err) throw err;

    Product.find({ _id: req.body._id }).lean().exec((err, data) => {
      if (err) throw err;
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('commentPage', { data: data, style: 'product_page.css', isLogged, email: req.session.email });
      } else {
        res.render('commentPage', { data: data, style: 'product_page.css' });
      }
    })
  }));
});

// filter

router.post('/filter', (req, res) => {
  if (req.body.conditions === 'new') {

    Product.find({}).sort({ Date: 'asc' }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });

  } else if (req.body.conditions === 'old') {

    Product.find({}).sort({ Date: -1 }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });

  } else if (req.body.conditions === 'high_price') {

    Product.find({}).sort({ price: -1 }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });

  } else if (req.body.conditions === 'low_price') {
    Product.find({}).sort({ price: 1 }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });

  } else if (req.body.conditions === 'under25') {
    Product.find({ price: { $lt: 2500 } }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });
  } else if (req.body.conditions === '25to50') {
    Product.find({ price: { $gt: 2500, $lt: 5000 } }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });
  } else if (req.body.conditions === '50to100') {
    Product.find({ price: { $gt: 5000, $lt: 10000 } }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });
  } else if (req.body.conditions == '100*') {
    Product.find({ price: { $gt: 10000 } }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });
  } else if (req.body.conditions === '0-25') {
    Product.find({ target: { $lt: 250000 } }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });
  } else if (req.body.conditions === '25-50') {
    Product.find({ target: { $gt: 250000, $lt: 500000 } }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });
  } else if (req.body.conditions === '50-100') {
    Product.find({ target: { $gt: 500000, $lt: 1000000 } }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })
      }
    });
  } else if (req.body.conditions === '100above') {
    Product.find({ target: { $gt: 1000000 } }).exec((err, data) => {
      var isLogged;
      if (req.session.email) {
        isLogged = true;
        res.render('landingpage', { data: data, style: 'landingpage.css', isLogged, email: req.session.email })
      } else {
        res.render('landingpage', { data: data, style: 'landingpage.css' })

      }
    });
  } else {
    res.redirect('/users/landingpage');
  }

});









































module.exports = router;
