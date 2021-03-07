module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.post('/sign-up',user.signUp);
    app.post('/sign-in',user.signIn);

    //JWT 토큰 검증
    app.get('/check',jwtMiddleware,user.check);

    //이메일 중복검사
    app.get('/check-email',user.checkEmail);

    //마이 페이지
    app.get('/users',jwtMiddleware,user.myPage);

    //비밀번호 변경
    app.patch('/users/password',jwtMiddleware,user.changePassword);

    //프로필 관리
    app.get('/users/profile',jwtMiddleware,user.profile);

    //닉네임 변경
    app.patch('/users/nickname',jwtMiddleware,user.changeNickname);

    //프로필 이미지 변경
    app.patch('/users/image',jwtMiddleware,user.patchImage);

    //프로필 이미지 삭제
    app.delete('/users/image',jwtMiddleware,user.deleteImage);
};