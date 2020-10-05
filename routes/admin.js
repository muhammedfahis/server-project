var express = require('express');
var router = express.Router();
var session = require('express-session');
var Product = require('../models/product');
var User = require('../models/User');
var Order =require ('../models/orders');
var multer = require('multer');
var path = require('path');
var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
  collection: 'mySessions'
});
store.on('error', function(error) {
  console.log(error);
});




router.use(session({

  secret: 'ok',
  name: 'adminCookie',
  saveUninitialized: false,
  store: store,
  resave: false,

  cookie: {
    maxAge: 60 * 1000 * 60 * 60 * 24 * 30
  }
}));

// multer

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



const Admin = {
  username: 'admin',
  password: '123'
}



const checkAdmin = (req, res, next) => {
  if (!req.session.username) {
    res.redirect('/login');
  } else {
    next();
  }
}

const directDashboard = (req, res, next) => {
  if (req.session.username) {
    res.redirect('/dashboard');
  }
  next();
}

// get routers

router.get('/login', directDashboard, (req, res) => {
  res.render('admin_login');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('adminCookie')
  res.redirect('/login')
});

router.get('/dashboard', checkAdmin, (req, res) => {
  Product.find({}).exec((err, data) => {
    if (err) throw err;
    res.render('admin_dashboard', { data: data, style: '' });
  })
});

router.get('/edit_project', (req, res) => {
  res.render('edit_project');
});

router.get('/getusers', (req, res) => {
  User.find({}).lean().exec((err, data) => {
    if (err) throw err;
    res.render('getUsers', { data: data, style: '' });

  })
});

router.get('/edit_user', (req, res) => {
  res.render('editUser', { style: 'editUsers.css' });
});

router.get('/orders',(req,res)=>{
  Order.find({type:'pre-order',status:true}).lean().exec((err,data)=>{
    res.render('admin_orders',{data:data})
  });

router.get('/backers',(req,res)=>{
  Order.find({type:'back',status:'true'}).lean().exec((err,data)=>{
    res.render('admin_backpage',{data:data})
  })
})
  
})
// post routers

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === Admin.username && password === Admin.password) {
    req.session.username = username;

    res.redirect('/dashboard');
  } else {
    res.render('admin_login', { msg: 'invalid username or password' });
  }
});


router.post('/edit_project', (req, res) => {
console.log(req.body.id);
  Product.findById({_id:req.body.id}).lean().exec((err,data) => {
    if (err) throw err;
    console.log(data);
    res.render('edit_project', { data: data, style: 'start_project.css' });
  });
});

router.post('/edit_upload', (req, res) => {

  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(req.file.path);

      var filename = req.file.filename
      Product.updateOne({ _id: req.body.id },
        {
          $set: {
            discription: req.body.discription,
            price: req.body.price,
            target: req.body.target,
            img: filename,
            details: req.body.details
          }
        }, (err) => {
          if (err) throw err;
          res.redirect('/dashboard');
        })
    }
  })
});

router.post('/delete_project', (req, res) => {
  Product.deleteOne({ _id: req.body._id }, (err) => {
    if (err) throw err;
    res.redirect('/dashboard');
  })
});

router.post('/block_user', (req, res) => {
  User.updateOne({ _id: req.body.id }, { $set: { status: false } }, (err) => {
    if (err) throw err;
    res.redirect('/getusers');

  });
});

router.post('/unblock_user', (req, res) => {
  User.updateOne({ _id: req.body.id }, { $set: { status: true } }, (err) => {
    if (err) throw err;
    res.redirect('/getusers');
  });
});

router.post('/edit_user', (req, res) => {
  User.findOne({ _id: req.body.id }).lean().exec((err, data) => {
    if (err) throw err;
    res.render('editUser', { data: data, style: 'editUsers.css' })
  })
});

router.post('/save_edit', (req,res) => {
  console.log(req.body.id);
  User.updateOne({ _id: req.body.id }, {
    $set: {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    }
  },(err) => {
    if (err) throw err;
    res.redirect('/getusers');
  })
});

router.post('/orders',(req,res)=>{

})


module.exports = router;
