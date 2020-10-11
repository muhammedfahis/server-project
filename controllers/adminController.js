var Product = require('../models/product');
var User = require('../models/User');
var Order =require ('../models/orders');
var multer = require('multer');
var path = require('path');




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


function adminController(){

    return{

        renderLoginPage(req,res){
            res.render('admin_login');
        },
        logoutAdmin(req,res){
            req.session.destroy();
        res.clearCookie('adminCookie')
        res.redirect('/admin/login')
        },
        renderDashboard(req,res){
            Product.find({}).exec((err, data) => {
                if (err) throw err;
                res.render('admin_dashboard', { data: data, style: '' });
              })
        },
        renderEditProjectPage(req,res){
            res.render('edit_project');
        },
        getAllUsers(req,res){
            User.find({}).lean().exec((err, data) => {
                if (err) throw err;
                res.render('getUsers', { data: data, style: '' });
            
              })
        },
        editUser(req,res){
            res.render('editUser', { style: 'editUsers.css' });
        },
        getAllOrders(req,res){
            Order.find({type:'pre-order',status:true}).lean().exec((err,data)=>{
                res.render('admin_orders',{data:data})
              });
            
        },
        doLoginAdmin(req,res){
            const { username, password } = req.body;
  if (username === Admin.username && password === Admin.password) {
    req.session.username = username;

    res.redirect('/admin/dashboard');
  } else {
    res.render('admin_login', { msg: 'invalid username or password' });
  }
        },
        doEditProject(req,res){
            Product.findById({_id:req.body.id}).lean().exec((err,data) => {
                if (err) throw err;
                console.log(data);
                res.render('edit_project', { data: data, style: 'start_project.css' });
              });
        },
        doUploadEdited(req,res){
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
                      res.redirect('/admin/dashboard');
                    })
                }
              })
        },
        doDeleteProject(req,res){
            Product.deleteOne({ _id: req.body._id }, (err) => {
                if (err) throw err;
                res.redirect('/admin/dashboard');
              })
        },
        doBlockUser(req,res){
            User.updateOne({ _id: req.body.id }, { $set: { status: false } }, (err) => {
                if (err) throw err;
                res.redirect('/admin/getusers');
            
              });
        },
        doUnblockUser(req,res){
            User.updateOne({ _id: req.body.id }, { $set: { status: true } }, (err) => {
                if (err) throw err;
                res.redirect('/admin/getusers');
              });
        },
        doEditUser(req,res){
            User.findOne({ _id: req.body.id }).lean().exec((err, data) => {
                if (err) throw err;
                res.render('editUser', { data: data, style: 'editUsers.css' })
              })
        },
        doSaveEditedUser(req,res){
            User.updateOne({ _id: req.body.id }, {
                $set: {
                  name: req.body.name,
                  email: req.body.email,
                  password: req.body.password
                }
              },(err) => {
                if (err) throw err;
                res.redirect('/admin/getusers');
              })
        }
    }
}


module.exports =adminController
