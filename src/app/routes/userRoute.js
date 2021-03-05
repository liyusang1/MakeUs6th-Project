module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.post('/sign-up',user.signUp);
    app.post('/sign-in',user.signIn);
    app.get('/check',jwtMiddleware,user.check);

    app.get('/check-email',user.checkEmail);
};