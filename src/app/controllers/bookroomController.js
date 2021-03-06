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


// . 글 수정
exports.patchcontents = async function (req, res) {
    var bookIdx = req.params['bookIdx']
    var contentsIdx = req.params['contentsIdx']

    const {
        contents
    } = req.body;

    try {
        const [updatecontentsRow] = await bookroomDao.updatecontents(contentsIdx,userIdx,bookIdx)

        if (updatecontentsRow) {
            return res.json({
                result:updatecontentsRow,
                isSuccess: true,
                code: 1000,
                message: "글이 수정되었습니다"
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "글 수정을 실패하였습니다."
        });
    } catch (err) {
        logger.error(`App - patchcontents Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};


// . 글 수정
exports.deletecontents = async function (req, res) {
    var bookIdx = req.params['bookIdx']
    var contentsIdx = req.params['contentsIdx']

    try {
        const [deletecontentsRow] = await bookroomDao.deletecontents(bookIdx,userIdx)

        if (deletecontentsRow) {
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "글이 삭제되었습니다"
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "글 삭제를 실패하였습니다."
        });
    } catch (err) {
        logger.error(`App - deletecontents Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};


// . 본문 검색 - 내용
exports.searchcontents = async function (req, res) {

    var bookIdx = req.params['bookIdx'];
    const {contents} = req.query;


    //내용 값을 입력하지 않았을 때
    if (contents.length<1)
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "본문 내용을 입력해주세요."
        });


    const checkContentsRow= await bookroomDao.checkContents(bookIdx,contents)
    //console.log(checkContentsRow);
    //bookIdx에 해당되는 본문 내용이 없는 경우
    if (checkContentsRow == '0')
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "해당 책방에 대한 본문 내용이 존재하지 않습니다."
        });

    try {
        const searchcontentsRow = await bookroomDao.searchcontents(bookIdx,contents)

        if (searchcontentsRow) {
            return res.json({
                result:searchcontentsRow,
                isSuccess: true,
                code: 1000,
                message: "본문 내용 검색 성공입니다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "본문 내용 검색 실패입니다."
        });
    } catch (err) {
        logger.error(`App - searchcontents Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};