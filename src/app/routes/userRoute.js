module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.post('/sign-up',user.signUp);
    app.post('/sign-in',user.signIn);

    //JWT 토큰 검증
    app.get('/check',jwtMiddleware,user.check);

    //이메일 중복검사
    app.get('/check-email',user.checkEmail);
};