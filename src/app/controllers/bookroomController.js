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
    if (!authorName) return res.json({isSuccess: false, code: 2001, message: "저자를 입력해주세요."});
    if (!bookImgUrl) return res.json({isSuccess: false, code: 2002, message: "책 표지 사진을 첨부해주세요."});

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
            message: "페이지를 1부터 입력해주세요"
        });

    // 2. limit 값은 1부터 시작
    if (limit < 1)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요"
        });

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
                message: "책방이 더 이상 존재하지 않습니다."
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
            message: "페이지를 1부터 입력해주세요"
        });

    // 2. limit 값은 1부터 시작
         if (limit < 1)
             return res.json({
                 isSuccess: false,
                code: 2002,
                 message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요"
            });

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
                message: "책방이 더 이상 존재하지 않습니다."
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
            message: "bookName을 입력해주세요."
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
    var bookIdx = req.params['bookIdx'] //path variable
    const {page,limit} = req.query; //페이징 처리 쿼리스트링

    const userIdx = req.verifiedToken;


    //페이징 validation 처리
    // 1. page 값은 1부터 시작 ex) 1페이지
    if (page<1)
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "페이지를 1부터 입력해주세요"
        });

    // 2. limit 값은 1부터 시작
    if (limit < 1)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요"
        });


    try {
        const [selectbookcontentsRow] = await bookroomDao.selectbookcontents(bookIdx,start,infoCount)


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
        if(isEmpty(selectbookcontentsRow)) {
            return res.json({
                isSuccess: false,
                code: 4000,
                message: "글이 더 이상 존재하지 않습니다."
            });
        }


        if (selectbookcontentsRow) {
            const [updateviewCountRow] = await bookroomDao.updateviewCount(bookIdx) // 글 조회가 되면 viewCount+1 쿼리 실행
            return res.json({
                result:selectbookcontentsRow,
                isSuccess: true,
                code: 1000,
                message: "글 최신순 조회 성공입니다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "글 최신순 조회 실패입니다."
        });
    } catch (err) {
        logger.error(`App - getbookcontents Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};


// 6. 글 조회 - 북마크순
exports.getbookcontentsbookmark = async function (req, res) {
    var bookIdx = req.params['bookIdx'] //path variable
    const {page,limit} = req.query; //페이징 처리 쿼리스트링

    const userIdx = req.verifiedToken;

    //페이징 validation 처리
    // 1. page 값은 1부터 시작 ex) 1페이지
    if (page<1)
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "페이지를 1부터 입력해주세요"
        });

    // 2. limit 값은 1부터 시작
    if (limit < 1)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요"
        });


    try {
        const [selectbookcontentsbookmarkRow] = await bookroomDao.selectbookcontentsbookmark(bookIdx,start,infoCount)

        // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우(먼저 비어있는지 확인하는 함수 선언)

        var isEmpty = function (checkContentsContentsIdxRow){
            if (checkContentsContentsIdxRow === "" ||checkContentsContentsIdxRow === null || checkContentsContentsIdxRow === undefined || (checkContentsContentsIdxRow !==null && typeof checkContentsContentsIdxRow === 'object' && !Object.keys(checkContentsContentsIdxRow).length))
            {
                return true
            }
            else{
                return false
            }
        };

        // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우
        if(isEmpty(selectbookcontentsbookmarkRow)) {
            return res.json({
                isSuccess: false,
                code: 4000,
                message: "글이 더 이상 존재하지 않습니다."
            });
        }

        if (selectbookcontentsbookmarkRow) {
            const [updateviewCountRow] = await bookroomDao.updateviewCount(bookIdx) // 글 조회가 되면 viewCount+1 쿼리 실행
            return res.json({
                result:selectbookcontentsbookmarkRow,
                isSuccess: true,
                code: 1000,
                message: "글 북마크순 조회 성공입니다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "글 북마크순 조회 실패입니다."
        });
    } catch (err) {
        logger.error(`App - getbookcontentsbookmark Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

// . 글 작성
exports.postcontents = async function (req, res) {
    var bookIdx = req.params['bookIdx'] //path variable
    const userIdx = req.verifiedToken.userIdx;

    const {
        contents
    } = req.body;

    //validation 처리
    if (contents.length<1)
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "내용을 작성해주세요."
        });


   try {
        const [postcontentsRow] = await bookroomDao.postcontents(userIdx,bookIdx,contents)

        if (postcontentsRow) {
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "글이 등록 되었습나다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "글 등록을 실패하였습니다."
        });
    } catch (err) {
        logger.error(`App - postcontents Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};


// . 글 수정
exports.patchcontents = async function (req, res) {
    const {
        contents
    } = req.body;
    const userIdx = req.verifiedToken.userIdx;
    var bookIdx = req.params['bookIdx'];
    var contentsIdx = req.params['contentsIdx'];

    //validation 처리
    if (contents.length<1)
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "수정할 내용을 입력해주세요."
        });

    const checkbookroomIdxRow = await bookroomDao.checkbookroomIdx(bookIdx)
    var isEmptys = function (checkbookroomIdxRow){
        if (checkbookroomIdxRow === "" || checkbookroomIdxRow === null || checkbookroomIdxRow === undefined || (checkbookroomIdxRow !==null && typeof checkbookroomIdxRow === 'object' && !Object.keys(checkbookroomIdxRow).length) || checkbookroomIdxRow == '{}')
        {
            return true
        }
        else{
            return false
        }
    };

    if (isEmptys(checkbookroomIdxRow))
        return res.json({
            isSuccess: false,
            code: 2003,
            message: "해당 책방이 존재하지 않습니다."
        });

    const checkContentsContentsIdxRow = await bookroomDao.checkContentsContentsIdx(contentsIdx)
    // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우(먼저 비어있는지 확인하는 함수 선언)
    var isEmpty = function (checkContentsContentsIdxRow){
        if (checkContentsContentsIdxRow === "" || checkContentsContentsIdxRow === null || checkContentsContentsIdxRow === undefined || (checkContentsContentsIdxRow !==null && typeof checkContentsContentsIdxRow === 'object' && !Object.keys(checkContentsContentsIdxRow).length) || checkContentsContentsIdxRow == '{}')
        {
            return true
        }
        else{
            return false
        }
    };

    if (isEmpty(checkContentsContentsIdxRow))
        return res.json({
            isSuccess: false,
            code: 2004,
            message: "해당 글이 존재하지 않습니다."
        });




    try {
        const [updatecontentsRow] = await bookroomDao.updatecontents(contents,userIdx,bookIdx,contentsIdx)
        const checkContentsUserIdxRow = await bookroomDao.checkContentsUserIdx(bookIdx,contentsIdx)


        if (userIdx != checkContentsUserIdxRow)
            return res.json({
                isSuccess: false,
                code: 2002,
                message: "당신의 유저 인덱스 번호와 글을 작성한 유저 인덱스 번호가 일치하지 않습니다."
            });

        if (updatecontentsRow) {
            return res.json({
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


// . 글 삭제
exports.deletecontents = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    var bookIdx = req.params['bookIdx'];
    var contentsIdx = req.params['contentsIdx'];

    const checkbookroomIdxRow = await bookroomDao.checkbookroomIdx(bookIdx)

    var isEmptys = function (checkbookroomIdxRow){
        if (checkbookroomIdxRow === "" || checkbookroomIdxRow === null || checkbookroomIdxRow === undefined || (checkbookroomIdxRow !==null && typeof checkbookroomIdxRow === 'object' && !Object.keys(checkbookroomIdxRow).length) || checkbookroomIdxRow == '{}')
        {
            return true
        }
        else{
            return false
        }
    };

    if (isEmptys(checkbookroomIdxRow))
        return res.json({
            isSuccess: false,
            code: 2003,
            message: "해당 책방이 존재하지 않습니다."
        });

    const checkContentsContentsIdxRow = await bookroomDao.checkContentsContentsIdx(contentsIdx)
    // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우(먼저 비어있는지 확인하는 함수 선언)
    var isEmpty = function (checkContentsContentsIdxRow){
        if (checkContentsContentsIdxRow === "" || checkContentsContentsIdxRow === null || checkContentsContentsIdxRow === undefined || (checkContentsContentsIdxRow !==null && typeof checkContentsContentsIdxRow === 'object' && !Object.keys(checkContentsContentsIdxRow).length) || checkContentsContentsIdxRow == '{}')
        {
            return true
        }
        else{
            return false
        }
    };

    if (isEmpty(checkContentsContentsIdxRow))
        return res.json({
            isSuccess: false,
            code: 2004,
            message: "해당 글이 존재하지 않습니다."
        });

    const checkContentsUserIdxRow = await bookroomDao.checkContentsUserIdx(bookIdx,contentsIdx)

    if (userIdx != checkContentsUserIdxRow)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "당신의 유저 인덱스 번호와 글을 작성한 유저 인덱스 번호가 일치하지 않습니다."
        });

    try {
        const [deletecontentsRow] = await bookroomDao.deletecontents(userIdx,bookIdx,contentsIdx)
        if (deletecontentsRow) {
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "글이 삭제되었습니다."
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

// . 글 신고 /books/:bookIdx/contents/:contentsIdx/report-contents
/**exports.postreport = async function (req, res) {
    var bookIdx = req.params['bookIdx'];
    var contentsIdx = req.params['contentsIdx'];
    const {
        reportReason
    } = req.body;
    const userIdx = req.verifiedToken.userIdx;

    //validation 처리
    if (reportReason.length<1)
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "신고 사유를 입력해주세요."
        });

    const checkbookroomIdxRow = await bookroomDao.checkbookroomIdx(bookIdx)
    var isEmptys = function (checkbookroomIdxRow){
        if (checkbookroomIdxRow === "" || checkbookroomIdxRow === null || checkbookroomIdxRow === undefined || (checkbookroomIdxRow !==null && typeof checkbookroomIdxRow === 'object' && !Object.keys(checkbookroomIdxRow).length) || checkbookroomIdxRow == '{}')
        {
            return true
        }
        else{
            return false
        }
    };

    if (isEmptys(checkbookroomIdxRow))
        return res.json({
            isSuccess: false,
            code: 2003,
            message: "해당 책방이 존재하지 않습니다."
        });

    const checkContentsContentsIdxRow = await bookroomDao.checkContentsContentsIdx(contentsIdx)
    // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우(먼저 비어있는지 확인하는 함수 선언)
    var isEmpty = function (checkContentsContentsIdxRow){
        if (checkContentsContentsIdxRow === "" || checkContentsContentsIdxRow === null || checkContentsContentsIdxRow === undefined || (checkContentsContentsIdxRow !==null && typeof checkContentsContentsIdxRow === 'object' && !Object.keys(checkContentsContentsIdxRow).length) || checkContentsContentsIdxRow == '{}')
        {
            return true
        }
        else{
            return false
        }
    };

    if (isEmpty(checkContentsContentsIdxRow))
        return res.json({
            isSuccess: false,
            code: 2004,
            message: "해당 글이 존재하지 않습니다."
        });

    const checkContentsUserIdxRow = await bookroomDao.checkContentsUserIdx(bookIdx,contentsIdx)

    if (userIdx == checkContentsUserIdxRow)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "당신의 유저 인덱스 번호와 글을 작성한 유저 인덱스 번호가 일치하여 신고가 불가능합니다."
        });

        try{
            await connection.beginTransaction(); // START Transaction

            const [insertreportRow] = await bookroomDao.insertreportTransaction(bookIdx,contentsIdx,userIdx,reportReason);

            const [insertreportTargetRow] = await bookroomDao.insertreportTarget(bookIdx,contentsIdx);

            if (insertreportRow) {
                return res.json({
                    isSuccess: true,
                    code: 1000,
                    message: "글이 신고되었습니다"
                });
            }
            await connection.commit(); // COMMIT

        } catch(err){
            await connection.rollback(); // ROLLBACK
            logger.error(`Transaction Query error\n: ${JSON.stringify(err)}`);
            return false;
        }
        finally {
            connection.release();
        }
    };**/



// 글 북마크 설정/해제
exports. patchContentsbookmark = async function (req, res) {
    var contentsIdx = req.params['contentsIdx'];
    const {bookIdx} = req.params;
    const userIdx = req.verifiedToken.userIdx;


    const checkContentsContentsIdxRow = await bookroomDao.checkContentsContentsIdx(contentsIdx)
    // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우(먼저 비어있는지 확인하는 함수 선언)
    var isEmpty = function (checkContentsContentsIdxRow){
        if (checkContentsContentsIdxRow === "" || checkContentsContentsIdxRow === null || checkContentsContentsIdxRow === undefined || (checkContentsContentsIdxRow !==null && typeof checkContentsContentsIdxRow === 'object' && !Object.keys(checkContentsContentsIdxRow).length) || checkContentsContentsIdxRow == '{}')
        {
            return true
        }
        else{
            return false
        }
    };

    if (isEmpty(checkContentsContentsIdxRow))
        return res.json({
            isSuccess: false,
            code: 2004,
            message: "해당 글이 존재하지 않습니다."
        });



    try {
        const [checkbookmarkRow] = await bookroomDao.checkbookmark(userIdx,contentsIdx)

        if (checkbookmarkRow.length == 0){

            const [insertbookmarkRow] = await bookroomDao.insertbookmark(userIdx,contentsIdx)
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "뷱마크 생성 완료"
            });
        }
else {
            const [updatebookmarkRow] = await bookroomDao.updatebookmark(userIdx, contentsIdx)
            if (checkbookmarkRow[0].status == 0) {
                return res.json({
                    isSuccess: true,
                    code: 1001,
                    message: "북마크 설정(on)"
                });
            } else if (checkbookmarkRow[0].status == 1) {
                return res.json({
                    isSuccess: true,
                    code: 1002,
                    message: "북마크 해제(off)"
                });
            }
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "북마크 설정을 실패하였습니다."
        });
    } catch (err) {
        logger.error(`App - patchContentsbookmark Query error\n: ${JSON.stringify(err)}`);
        return false;
    };
};





