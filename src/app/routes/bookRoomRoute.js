module.exports = function(app){
    const bookroom = require('../controllers/bookroomController');
    //const jwtMiddleware = require('../../../config/jwtMiddleware');

    /** 홈화면 **/
    app.post('/books',bookroom.postbookroom); //jwtMiddleware 추가하기 , 책방 만들기
    app.get('/books/newest-books',bookroom.getbookroom); //jwtMiddleware 추가하기 , 책방 리스트 조회 - 최신순
    //app.get('/books/popularity-books', user.check); //jwtMiddleware 추가하기 , 책방 리스트 조회 - 인기순
    app.get('/books',bookroom.searchbookroom); //jwtMiddleware 추가하기 , 책방 검색

    /** 책방 입장 (온도차이) **/
    //app.get('/books/:bookIdx/bookmark-books', user.check); //jwtMiddleware 추가하기 , 커뮤니티 조회 - 북마크순
    app.get('/books/:bookIdx/newest-books', bookroom.getbookcontents); //jwtMiddleware 추가하기 , 글 조회 - 최신순
    //app.post('/books/:bookIdx/contents/:contentsIdx/report-contents', user.check); //jwtMiddleware 추가하기 , 신고하기
    //app.post('/books/:bookIdx/contents', user.check); //jwtMiddleware 추가하기 , 글 작성
    //app.patch('/books/:bookIdx/contents/:contentsIdx', user.check); //jwtMiddleware 추가하기 , 글 수정
    //app.delete('/books/:bookIdx/contents/:contentsIdx', user.check); //jwtMiddleware 추가하기 , 글 삭제 -> patch로 변경,,?
    //app.post('/contents/:contentsIdx/bookmark', user.check); //jwtMiddleware 추가하기 , 북마크 설정
    //app.patch('/contents/:contentsIdx/bookmark', user.check); //jwtMiddleware 추가하기 , 북마크 해제
    //app.get('/books/popularity-books', user.check); //jwtMiddleware 추가하기 , 본문검색 -> 수정필요
};