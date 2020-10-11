const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const projectController = require('../controllers/projectController');
const { order } = require("paypal-rest-sdk");


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
router.get("/signup", DirectToDashboard,userController().userSignup);

router.get("/login", DirectToDashboard,userController().userLogin);

router.get("/verify_mobile", userController().verifyMobile);

router.get("/confirm_password",userController().confirmPassword);

router.get("/logout", userController().userLogout);

// category

router.get("/art", productController().artCategory);

router.get("/tech", productController().techCategory);

router.get("/fashion",productController().fashionCategory);

router.get("/craft",productController().craftCategory);

// products

router.get("/start_project", projectController().startProjectPage);

//  render confirm project page

router.get("/confrim_page", projectController().confirmationPage);

router.get("/rules", userLoginChecker,projectController().projectRules);

// landingpage

router.get("/", productController().landingPage);

// products page

router.get("/items/:id",productController().productDisplay);

// comment page

router.get("/comments/:id", productController().commentProduct);

//  opt verification
router.get("/verify_otp",productController().otpVerifyPage);

//  login with otp
router.get("/otp_login",productController().otpLoginPage);

//  verify the otp when login
router.get("/login_verify",productController().verifyLogin);

//  render the myproject page
router.get("/myproject",productController().myProjectPage);
// view the item from the product page



//my orders page

router.get("/myorders",productController().myOrderPage);

//  payment Address page

router.get("/address_page",orderController().addressPage);

//  back up page runder

router.get("/back_page",orderController().backPage);

//post routers

// users

router.post("/signup",userController().doSignUp);

router.post("/login",userController().doLogin);

//  forgot password

router.post("/confirm_password",userController().doConfirmPass);

// axios ...................................................................

router.post("/verify_otp", userController().doVerifyOtp);

router.get("/resend_otp", userController().doResendOtp);

router.post("/otp_login", userController().doOtpLogin);

router.post("/login_verify", userController().doLoginVerify);

router.get("/resend_login_otp",userController().resendLoginOtp);

// product upload

router.post("/project_upload", projectController().doProjectUpload);

// video upload

router.post("/upload_video", projectController().doUploadVideo);

// skip video upload

router.post('/skip_video',projectController().doSkipVideo);


//  confirmation of adding project

router.post("/confirm_project",projectController().doConfirmProject);

// comment page

router.post("/comments", productController().doCommentProduct);



// filter

router.post("/filter", productController().doFilterProducts);
// delete my project
router.post("/dlt_project",projectController().doDeleteProject);
// edit my project
router.post("/edt_project", projectController().doEditProject);

router.post("/edt_upload", projectController().doUploadEdited);

//  paypal complete works

// redirecting to Address page

router.post("/address_page", orderController().doLoadAddressPage);
//  reading users address when preorder the item

router.post("/redirect_payment", orderController().doRedirectToPayment);

// success payment

router.get("/success",orderController().doRedirectToSuccess);
// failed payment
router.get("/cancel",orderController().doRedirectToCancel);
// ended payment .....................................

// back post router

router.post("/back_page",orderController().doRenderBackPage);

//  back payment router
router.post("/back_project",orderController().doBackProject);

//  back success router

router.get("/back_success", orderController().doRedirectBackSuccess);

// backup cancel router

router.get("/back_cancel",orderController().doCancelBack);



module.exports = router;
