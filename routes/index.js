const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers')

router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', authController.isLoggedIn, storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));
router.post('/add/:id', catchErrors(storeController.updateStore));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

// 1. validate the registration data
// 2. register the user
// 3. we need to log them in
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post(
  '/account/reset/:token', 
  authController.confirmedPasswords, 
  catchErrors(authController.update)
);

router.get('/map', storeController.mapPage);

// API
router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
module.exports = router;


// Do work here
// router.get('/', (req, res) => {
//   res.send('Hey! It works!');
// });

// 2.4 notes
// req is what we use to represent the data we want
// res is response, self-explanatory
// don't send data more than once
// we can put variables by using a colon. i.e. router.get('/reverse/:variable', (req, res)...)
// express docs has all this info 

// 2.5 notes 
// using pug for our templating engine (from jade)
// templates go into the views folder
// looks like we use views instead of react or something like that?
// layout.pug is the overall layout, and our pug files extend on this

// 2.6 notes
// title will change the variable in layout.pug (line 4)
// all helpers stuff goes into helpers.js
// 02:45

// router.get('/', (req, res) => {
//   //how we render a view
//   res.render('hello', {
//     name: "wes",
//     dog: req.query.dog,
//     // title: "i love food"
//   }) 

//   res.render('hello')
// })


// 2.7 notes
// MVC pattern: Model, View, Controller
// model layer: fetching data from the database (via API)
// view layer: templates (pug files)
// controller layer: traffic cop, takes the model data and sends it into the view (templates)
// separate controller folder
// each functional part of the app will have its own controller

// always use a separate controller to do all the work

// router.get('/', storeController.homePage);

// 2.8 notes
// middleware is the work that happens between a request and a response 
// i.e. login middleware would pull up a login form, and normalize the text entry, and verify
// essentially an assembly line of tasks between the req and res 
// this is route-specific middleware, whereas there is global middleware, which happens before router is (most of what app.js is; anything with app.use)

// router.get('/', storeController.myMiddleware, storeController.homePage);

