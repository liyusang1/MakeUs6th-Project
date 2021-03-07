module.exports = function(app){
    const bookstore = require('../controllers/bookstoreController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //서점 전체조회
    app.get('/bookstores/all',bookstore.getAllBookstore);

    //서점 특정지역조회
    app.get('/bookstores',bookstore.getBookstore);

    //서점 상세 조회
    app.get('/bookstores/:bookstoreIdx',jwtMiddleware,bookstore.bookstoreDetail);

    //서점 북마크상태 수정
    app.patch('/bookmark/bookstores/:bookstoreIdx',jwtMiddleware,bookstore.bookmarkBookstore);

};