var express = require('express');
var router = express.Router();
var adminController = require('../controllers/adminController');





const checkAdmin = (req, res, next) => {
  if (!req.session.username) {
    res.redirect('/admin/login');
  } else {
    next();
  }
}

const directDashboard = (req, res, next) => {
  if (req.session.username) {
    res.redirect('/admin/dashboard');
  }
  next();
}

// get routers

router.get('/login', directDashboard,adminController().renderLoginPage);

router.get('/logout',adminController().logoutAdmin);

router.get('/dashboard', checkAdmin,adminController().renderDashboard);

router.get('/edit_project',adminController().renderEditProjectPage);

router.get('/getusers', adminController().getAllUsers);

router.get('/edit_user',adminController().editUser);

router.get('/orders',adminController().getAllOrders);
// post routers

router.post('/login',adminController().doLoginAdmin );


router.post('/edit_project',adminController().doEditProject);

router.post('/edit_upload',adminController().doUploadEdited);

router.post('/delete_project',adminController().doDeleteProject);

router.post('/block_user',adminController().doBlockUser);

router.post('/unblock_user', adminController().doUnblockUser);

router.post('/edit_user',adminController().doEditUser);

router.post('/save_edit',adminController().doSaveEditedUser);




module.exports = router;
