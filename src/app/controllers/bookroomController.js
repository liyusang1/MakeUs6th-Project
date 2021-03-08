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


// 2. 책방 리스트 조회 - 최신순
exports.getbookroom = async function (req, res) {
    const {page,limit} = req.query;

    //페이징 validation 처리
    // 1. page 값은 1부터 시작 ex) 1페이지
    if (page<1)
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "페이지를 1부터 입력해주세요",
        });

    // 2. limit 값은 1부터 시작
    if (limit < 1)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요",
        });

    // 페이징 - 클라 쪽에서 1페이지 당 20개 출력을 원한다면 page=1,limit=20 값 입력
    // => 서버 쪽에서는 page=0, limit=20 / page=20,limit =40 이렇게 값을 넣어줘야 원하는 결과값을 추출할 수 있기 때문에 아래와 같은 공식 처리
    let start = page;
    let infoCount = limit;

    if (page>=1 && limit >=1 ){
        start = 20 * (page-1);
        infoCount = page * limit;
    };

    try {
        const [selectbookroomRow] = await bookroomDao.selectbookroom(start,infoCount)

        // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우(먼저 비어있는지 확인하는 함수 선언)
        var isEmpty = function (val){
            if (val === "" || val === null || val === undefined || (val !==null && typeof val === 'object' && !Object.keys(val).length))
            {
                return true
            }
            else{
                return false
            }
        };

        // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우
        if(isEmpty(selectbookroomRow)) {
            return res.json({
                isSuccess: false,
                code: 4000,
                message: "책방이 더 이상 존재하지 않습니다.",
            });
        }

        if (selectbookroomRow) {
            return res.json({
                result:selectbookroomRow,
                isSuccess: true,
                code: 1000,
                message: "책방 리스트 최신순 조회 성공입니다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "책방 리스트 최신순 조회 실패입니다."
        });
    } catch (err) {
        logger.error(`App - getbookroom Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

// 2. 책방 리스트 조회 - 인기순
exports.getbookroomPopular = async function (req, res) {
    const {page,limit} = req.query;

    //페이징 validation 처리
    // 1. page 값은 1부터 시작 ex) 1페이지
    if (page<1)
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "페이지를 1부터 입력해주세요",
        });

    // 2. limit 값은 1부터 시작
         if (limit < 1)
             return res.json({
                 isSuccess: false,
                code: 2002,
                 message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요",
            });



    // 페이징 - 클라 쪽에서 1페이지 당 20개 출력을 원한다면 page=1,limit=20 값 입력
    // => 서버 쪽에서는 page=0, limit=20 / page=20,limit =40 이렇게 값을 넣어줘야 원하는 결과값을 추출할 수 있기 때문에 아래와 같은 공식 처리
    let start = page;
    let infoCount = limit;

    if (page>=1 && limit >=1 ){
        start = 20 * (page-1);
        infoCount = page * limit;
    };



    try {
        const selectbookroomPopular = await bookroomDao.selectbookroomPopular(start,infoCount)

        // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우(먼저 비어있는지 확인하는 함수 선언)
        var isEmpty = function (val){
            if (val === "" || val === null || val === undefined || (val !==null && typeof val === 'object' && !Object.keys(val).length))
            {
                return true
                }
            else{
                return false
            }
        };

        // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우
        if(isEmpty(selectbookroomPopular)) {
            return res.json({
                isSuccess: false,
                code: 4000,
                message: "책방이 더 이상 존재하지 않습니다.",
            });
        }

        if (selectbookroomPopular) {
            return res.json({
                result:selectbookroomPopular,
                isSuccess: true,
                code: 1000,
                message: "책방 리스트 조회 인기순 성공입니다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "책방 리스트 조회 인기순 실패입니다."
        });
    } catch (err) {
        logger.error(`App - getbookroomPopular Query error\n: ${JSON.stringify(err)}`);
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
        const [updatecontentsRow] = await bookroomDao.updatecontents(contents,contentsIdx,userIdx,bookIdx)

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
        const [deletecontentsRow] = await bookroomDao.deletecontents(bookIdx,userIdx,contentsIdx)

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