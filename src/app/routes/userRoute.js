module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //app.route('/app/signUp').post(user.signUp);
    app.route('/signIn').post(user.signIn);

    //app.get('/check', jwtMiddleware, user.check);
};