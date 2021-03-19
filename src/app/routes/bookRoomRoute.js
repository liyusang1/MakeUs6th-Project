module.exports = function(app){
    const bookroom = require('../controllers/bookroomController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    /** 홈화면 **/
    app.post('/books',jwtMiddleware,bookroom.postbookroom); // 책방 만들기
    app.get('/books/newest-books',bookroom.getbookroom); // 책방 리스트 조회 - 최신순
    app.get('/books/popularity-books', bookroom.getbookroomPopular); //책방 리스트 조회 - 인기순
    app.get('/books',bookroom.searchbookroom); // 책방 검색

    /** 책방 입장 **/
    app.get('/books/:bookIdx/bookmark-books',jwtMiddleware,bookroom.getbookcontentsbookmark); // 글 조회 - 북마크순
    app.get('/books/:bookIdx/newest-books', jwtMiddleware,bookroom.getbookcontents); // 글 조회 - 최신순
    app.post('/books/:bookIdx/contents/:contentsIdx/report-contents', jwtMiddleware,bookroom.postreport); // 글 신고
    app.post('/books/:bookIdx/contents', jwtMiddleware,bookroom.postcontents); // 글 작성
    app.patch('/books/:bookIdx/contents/:contentsIdx', jwtMiddleware,bookroom.patchcontents); // 글 수정
    app.delete('/books/:bookIdx/contents/:contentsIdx', jwtMiddleware,bookroom.deletecontents); // 글 삭제

    app.patch('/contents/:contentsIdx/bookmark',jwtMiddleware,bookroom.patchContentsbookmark); // 북마크 설정 및 해제
    app.get('/books/:bookIdx/contents', jwtMiddleware,bookroom.searchcontents); // 본문검색 - 내용
};