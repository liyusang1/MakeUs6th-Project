const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const bookroomDao = require('../dao/bookroomDao');
const { constants } = require('buffer');


/** 홈화면 **/
// 1. 책방 만들기
exports.postbookroom = async function (req, res) {

    const {
        bookName,authorName,bookImgUrl
    } = req.body;

    if (!bookName) return res.json({isSuccess: false, code: 2000, message: "책 제목을 입력해주세요."});
    if (!authorName) return res.json({isSuccess: false, code: 2001, message: "저자명을 입력해주세요."});
    if (!bookImgUrl) return res.json({isSuccess: false, code: 2002, message: "책 사진을 첨부해주세요."});

    try {
        const [insertbookroomRow] = await bookroomDao.insertbookroom(bookName,authorName,bookImgUrl)

        if (insertbookroomRow) {
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "책방 개설이 완료되었습니다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "책방 생성을 실패하였습니다."
        });
    } catch (err) {
        logger.error(`App - postbookroom Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};


// 2. 책방 리스트 조회
exports.getbookroom = async function (req, res) {

    try {
        const [selectbookroomRow] = await bookroomDao.selectbookroom()

        if (selectbookroomRow) {
            return res.json({
                result:selectbookroomRow,
                isSuccess: true,
                code: 1000,
                message: "책방 리스트 조회 성공입니다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "책방 리스트 조회 실패입니다."
        });
    } catch (err) {
        logger.error(`App - getbookroom Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

// 4. 책방 검색
exports.searchbookroom = async function (req, res) {
   const {bookName} = req.query;

   //원하는 값이 안들어올 경우 에러 처리 해주세요
   if (!bookName)
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "bookName을 입력해주세요.",
    });

    try {
        
        const searchbookroomRow = await bookroomDao.searchbookroom(bookName)

        if (searchbookroomRow) {
            return res.json({
                result:searchbookroomRow,
                isSuccess: true,
                code: 1000,
                message: "책방 검색 성공입니다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "책방 검색 실패입니다."
        });
    } catch (err) {
        logger.error(`App - searchbookroom Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

// 6. 글 조회 - 최신순
exports.getbookcontents = async function (req, res) {
    var bookIdx = req.params['bookIdx']
    try {
        const [selectbookcontentsRow] = await bookroomDao.selectbookcontents(bookIdx)

        if (selectbookcontentsRow) {
            return res.json({
                result:selectbookcontentsRow,
                isSuccess: true,
                code: 1000,
                message: "글 조회 성공입니다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "글 조회 실패입니다."
        });
    } catch (err) {
        logger.error(`App - getbookcontents Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};