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

    //회원탈퇴
    app.patch('/users/status',jwtMiddleware,user.patchUserStatus);

    //내가 쓴 글 조회
    app.get('/users-writing/books/:bookIdx',jwtMiddleware,user.getUserWriting);

    //내가 북마크 한 글 조회
    app.get('/users-bookmark/books/:bookIdx',jwtMiddleware,user.getUserBookmarkWriting);

    //비밀번호 찾기
    app.post('/find-password',user.findPassword);

    //프로필 변경
    app.patch('/users/profile',jwtMiddleware,user.patchProfile);
};