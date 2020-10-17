const Product = require("../models/product");
const multer = require("multer");
const path = require("path");
const  fs = require('fs');
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

let newProduct;
let newVideo;
var projectName;

function projectController() {
  return {
    startProjectPage(req, res) {
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
    },
    confirmationPage(req, res) {
      res.render("confirmation_page", { style: "signup.css" });
    },
    projectRules(req, res) {
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
    },
    doProjectUpload(req, res) {
      imagePath = req.body.discription;
      projectName = `${req.body.discription}.png`;
      var datatoconvert = req.body.imageData;
      let base64Image = datatoconvert.split(";base64,").pop();
      fs.writeFile(
        `public/images/${imagePath}.png`,
        base64Image,
        { encoding: "base64" },
        function (err) {
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
        }
      );
    },
    doUploadVideo(req, res) {
      upload(req, res, (err) => {
        if (err) {
          console.log(err);
        } else {
          var filename = req.file.filename;
          newVideo = {
            video: filename,
          };

          res.render("confirmation_page", {
            video: newVideo,
            project: newProduct,
            style:'signup.css'
          });
        }
      });
    },

    doSkipVideo(req, res) {
      res.render("confirmation_page", { project: newProduct,style:'signup.css' });
    },
    doConfirmProject(req, res) {
      if (newVideo) {
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
        console.log(newProduct);
        confirmProduct.save();
        res.redirect("/");
      } else {
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
        console.log(newProduct);
        confirmProduct.save();
        res.redirect("/");
      }
    },
    doDeleteProject(req, res) {
      const id = req.body.id;
      console.log(id);

      Product.findOneAndDelete({ _id: id }, (err) => {
        if (err) throw err;
        res.redirect("/myproject");
      });
    },
    doEditProject(req, res) {
      Product.findOne({ _id: req.body.id }).exec((err, data) => {
        if (err) throw err;
        res.render("edt_project", { data: data, style: "signup.css" });
      });
    },
    doUploadEdited(req, res) {
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
    },
  };
}

module.exports = projectController;
