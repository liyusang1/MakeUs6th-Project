module.exports = function(app){
    const bookstore = require('../controllers/bookstoreController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/bookstores/all',bookstore.getAllBookstore);
};