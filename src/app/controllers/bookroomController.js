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
    const userIdx = req.verifiedToken.userIdx;
    const {
        bookName,authorName,bookImgUrl
    } = req.body;

    if (!bookName) return res.json({isSuccess: false, code: 2000, message: "책 제목을 입력해주세요."});
    if (!authorName) return res.json({isSuccess: false, code: 2001, message: "저자를 입력해주세요."});
    if (!bookImgUrl) return res.json({isSuccess: false, code: 2002, message: "책 표지 사진을 첨부해주세요."});

    if (bookName.length > 20 ) return res.json({isSuccess: false, code: 2003, message: "책 이름은 20자 이하로 작성하여야 합니다."});
    if (authorName.length > 20 ) return res.json({isSuccess: false, code: 2004, message: "저자 이름은 20자 이하로 작성하여야 합니다."});

    const checkBookNameRow = await bookroomDao.checkBookName(bookName)
    if(checkBookNameRow.length != 0)
    return res.json({
        isSuccess: false,
        code: 3001,
        message: "해당 책방이 이미 존재 합니다."});

    try {
        const checkPostBookRoomRow = await bookroomDao.checkPostBookRoom(userIdx)
        if (checkPostBookRoomRow>=5)
            return res.json({
                isSuccess: false,
                code: 3000,
                message: "하루에 6개 이상 책방을 등록할 수 없습니다."});

        const [insertbookroomRow] = await bookroomDao.insertbookroom(bookName,authorName,bookImgUrl,userIdx)

        //책방 idx를 제공함 2021-03-20
        const findBookIdParams = [bookName,authorName,bookImgUrl,userIdx];
        const findBookroomRows = await bookroomDao.findBookroom(findBookIdParams)
        //

        if (insertbookroomRow) {
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "책방 개설이 완료되었습니다.",
                bookIdx:findBookroomRows[0].bookIdx
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
   if((!page) || (!limit))
       return res.json({
           isSuccess: false,
           code: 2001,
           message: "page와 limit을 입력해 주세요."
      });

    // 2. limit 값은 1부터 시작
    if (limit < 1)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요"
        });

    try {
        const [selectbookroomRow] = await bookroomDao.selectbookroom(page,limit)

        // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우
        if(selectbookroomRow.length<1) {
            return res.json({
                isSuccess: false,
                code: 3000,
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
   if((!page) || (!limit))
   return res.json({
       isSuccess: false,
       code: 2001,
       message: "page와 limit을 입력해 주세요."
    });

    // 2. limit 값은 1부터 시작
         if (limit < 1)
             return res.json({
                 isSuccess: false,
                code: 2002,
                 message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요"
            });

    try {
        const selectbookroomPopular = await bookroomDao.selectbookroomPopular(page,limit)

        // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우
        if(selectbookroomPopular.length<1) {
            return res.json({
                isSuccess: false,
                code: 3000,
                message: "책방이 더 이상 존재하지 않습니다."
            });
        }

        if (selectbookroomPopular) {
            return res.json({
                result:selectbookroomPopular,
                isSuccess: true,
                code: 1000,
                message: "책방 리스트 인기순 조회 성공입니다."
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "책방 리스트 인기순 조회 실패입니다."
        });
    } catch (err) {
        logger.error(`App - getbookroomPopular Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

// 4. 책방 검색
exports.searchbookroom = async function (req, res) {
    const {bookName} = req.query;
    const {page,limit} = req.query;

    //페이징 validation 처리
    if((!page) || (!limit))
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "page와 limit을 입력해 주세요."
        });

    // 2. limit 값은 1부터 시작
    if (limit < 1)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요"
        });

    //원하는 값이 안들어올 경우 에러 처리 해주세요
    if (!bookName)
        return res.json({
            isSuccess: false,
            code: 2003,
            message: "bookName을 입력해주세요."
        });

    try {
        const searchbookroomRow = await bookroomDao.searchbookroom(bookName,page,limit)

        // 3. 해당 페이지 요청했을 때 값이 더이상 없는 경우
        if(searchbookroomRow.length<1) {
            return res.json({
                isSuccess: false,
                code: 3000,
                message: "검색한 단어가 포함된 책방이 존재하지 않습니다."
            });
        }

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
    const userIdx = req.verifiedToken.userIdx;

    //페이징 validation 처리
   if((!page) || (!limit))
   return res.json({
       isSuccess: false,
       code: 2001,
       message: "page와 limit을 입력해 주세요."
  });

    // 2. limit 값은 1부터 시작
    if (limit < 1)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요"
        });
    const checkbookroomIdxRow = await bookroomDao.checkbookroomIdx(bookIdx)

    if (checkbookroomIdxRow.length<1)
        return res.json({
            isSuccess: false,
            code: 3000,
            message: "해당 책방이 존재하지 않습니다."
        });

    try {
        const selectbookroomCombine = await bookroomDao.selectbookcontents(userIdx,bookIdx,page,limit)

        if (selectbookroomCombine) {
            const [updateviewCountRow] = await bookroomDao.updateviewCount(bookIdx) // 글 조회가 되면 viewCount+1 쿼리 실행
            return res.json({
                result:selectbookroomCombine,
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
    const bookIdx = req.params['bookIdx'] //path variable
    const {page,limit} = req.query; //페이징 처리 쿼리스트링

    const userIdx = req.verifiedToken.userIdx;

    //페이징 validation 처리
    if((!page) || (!limit))
    return res.json({
        isSuccess: false,
        code: 2001,
        message: "page와 limit을 입력해 주세요."
   });

    // 2. limit 값은 1부터 시작
    if (limit < 1)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요"
        });

    const checkbookroomIdxRow = await bookroomDao.checkbookroomIdx(bookIdx)
 
    if (checkbookroomIdxRow.length<1)
        return res.json({
            isSuccess: false,
            code: 3000,
            message: "해당 책방이 존재하지 않습니다."
        });

    try {

        const selectbookroomCombine = await bookroomDao.selectbookcontentsbookmark(userIdx,bookIdx,page,limit)

        if (selectbookroomCombine) {
            const [updateviewCountRow] = await bookroomDao.updateviewCount(bookIdx) // 글 조회가 되면 viewCount+1 쿼리 실행

            return res.json({
                result:selectbookroomCombine,
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
    const bookIdx = req.params['bookIdx'] //path variable
    const userIdx = req.verifiedToken.userIdx;

    const {
        contents
    } = req.body;

    //validation 처리
    if (!contents)
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
    const {bookIdx} = req.params;
    const {contentsIdx} = req.params;

    //validation 처리
    if (!contents)
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "수정할 내용을 입력해주세요."
        });

    const checkbookroomIdxRow = await bookroomDao.checkbookroomIdx(bookIdx)

    if (checkbookroomIdxRow.length<1)
        return res.json({
            isSuccess: false,
            code: 3000,
            message: "해당 책방이 존재하지 않습니다."
        });

    const checkContentsContentsIdxRow = await bookroomDao.checkContentsContentsIdx(contentsIdx)
 
    if (checkContentsContentsIdxRow.length<1)
        return res.json({
            isSuccess: false,
            code: 3001,
            message: "해당 글이 존재하지 않습니다."
        });

    try {
        const checkContentsUserIdxRow = await bookroomDao.checkContentsUserIdx(bookIdx,contentsIdx)

        if (userIdx != checkContentsUserIdxRow)
            return res.json({
                isSuccess: false,
                code: 3002,
                message: "당신의 유저 인덱스 번호와 글을 작성한 유저 인덱스 번호가 일치하지 않습니다."
            });

        const [updatecontentsRow] = await bookroomDao.updatecontents(contents,userIdx,bookIdx,contentsIdx)
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
    const bookIdx = req.params['bookIdx'];
    const contentsIdx = req.params['contentsIdx'];

    const checkbookroomIdxRow = await bookroomDao.checkbookroomIdx(bookIdx)

    if (checkbookroomIdxRow.length<1)
        return res.json({
            isSuccess: false,
            code: 3000,
            message: "해당 책방이 존재하지 않습니다."
        });

    const checkContentsContentsIdxRow = await bookroomDao.checkContentsContentsIdx(contentsIdx)

    if (checkContentsContentsIdxRow.length<1)
        return res.json({
            isSuccess: false,
            code: 3001,
            message: "해당 글이 존재하지 않습니다."
        });

    const checkContentsUserIdxRow = await bookroomDao.checkContentsUserIdx(bookIdx,contentsIdx)

        if (userIdx != checkContentsUserIdxRow)
        return res.json({
            isSuccess: false,
            code: 3002,
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
    const userIdx = req.verifiedToken.userIdx;
    const bookIdx = req.params['bookIdx'];
    const {contents} = req.query;

    const {page,limit} = req.query;

    //페이징 validation 처리
    if((!page) || (!limit))
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "page와 limit을 입력해 주세요."
        });

    // 2. limit 값은 1부터 시작
    if (limit < 1)
        return res.json({
            isSuccess: false,
            code: 2002,
            message: "페이지 당 불러올 정보의 개수를 1부터 입력해주세요"
        });


    //내용 값을 입력하지 않았을 때
    if (contents.length<1)
        return res.json({
            isSuccess: false,
            code: 2003,
            message: "본문 내용을 입력해주세요."
        });

    const checkContentsRow= await bookroomDao.checkContents(bookIdx,contents)
    //console.log(checkContentsRow);
    //bookIdx에 해당되는 본문 내용이 없는 경우
    if (checkContentsRow == '0')
        return res.json({
            isSuccess: false,
            code: 3000,
            message: "해당 책방에 대한 본문 내용이 존재하지 않습니다."
        });

    try {
        const searchcontentsRow = await bookroomDao.searchcontents(bookIdx,contents,page,limit)

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
exports.postreport = async function (req, res) {
    const {
        reportReason
    } = req.body;
    const userIdx = req.verifiedToken.userIdx;
    const bookIdx = req.params['bookIdx'];
    const contentsIdx = req.params['contentsIdx'];

    //validation 처리
    if (!reportReason)
        return res.json({
            isSuccess: false,
            code: 2001,
            message: "신고 사유를 입력해주세요."
        });

    if (reportReason.length>490)
    return res.json({
        isSuccess: false,
        code: 2002,
        message: "신고 사유는 500자 이하로 입력해 주세요."
    });

    const checkbookroomIdxRow = await bookroomDao.checkbookroomIdx(bookIdx)

    if (checkbookroomIdxRow.length<1)
        return res.json({
            isSuccess: false,
            code: 3000,
            message: "해당 책방이 존재하지 않습니다."
        });

    const checkContentsContentsIdxRow = await bookroomDao.checkContentsContentsIdx(contentsIdx)

    if (checkContentsContentsIdxRow.length<1)
        return res.json({
            isSuccess: false,
            code: 3001,
            message: "해당 글이 존재하지 않습니다."
        });

    try {
        //이미 신고했는지 확인
        const checkParams = [contentsIdx,userIdx]
        const checkReportRows =  await bookroomDao.checkReport(checkParams)

        if (checkReportRows.length>0)
        return res.json({
            isSuccess: false,
            code: 3004,
            message: "이미 신고를 한 글입니다."
        });
        //이미 신고를 했다면 다시 신고 불가 2021-03-30

        const checkContentsUserIdxRow = await bookroomDao.checkContentsUserIdx(bookIdx,contentsIdx)
        if (checkContentsUserIdxRow == 0)
            return res.json({
                isSuccess: false,
                code: 3002,
                message: "해당 책방 인덱스 번호와 글 인덱스 번호가 일치하지 않습니다.(행 불일치)"
            });

        if (userIdx == checkContentsUserIdxRow)
            return res.json({
                isSuccess: false,
                code: 3003,
                message: "당신의 유저 인덱스 번호와 글을 작성한 유저 인덱스 번호가 일치하여 신고가 불가능합니다."
            });

        const getTargetUserIdxRow= await bookroomDao.getTargetUserIdx(bookIdx,contentsIdx)
        //console.log(getTargetUserIdxRow);
        const targetUserIdx = getTargetUserIdxRow;

        const [insertreportRow] = await bookroomDao.insertreport(contentsIdx,userIdx,targetUserIdx,reportReason)

        if (insertreportRow) {
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "글이 신고되었습니다"
            });
        }
        return res.json({
            isSuccess: false,
            code: 2000,
            message: "글 신고를 실패하였습니다."
        });
    } catch (err) {
        logger.error(`App - postreport Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

// 글 북마크 설정/해제
exports. patchContentsbookmark = async function (req, res) {
    const contentsIdx = req.params['contentsIdx'];
    const userIdx = req.verifiedToken.userIdx;

    const checkContentsContentsIdxRow = await bookroomDao.checkContentsContentsIdx(contentsIdx)
  
    if (checkContentsContentsIdxRow.length<1)
        return res.json({
            isSuccess: false,
            code: 3001,
            message: "해당 글이 존재하지 않습니다."
        });

    try {
        const [checkbookmarkRow] = await bookroomDao.checkbookmark(userIdx,contentsIdx)

        if (checkbookmarkRow.length == 0){
            const [insertbookmarkRow] = await bookroomDao.insertbookmark(userIdx,contentsIdx)
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "북마크가 추가되었습니다."
            });
        }
else {
            const [updatebookmarkRow] = await bookroomDao.updatebookmark(userIdx, contentsIdx)
            if (checkbookmarkRow[0].status == 0) {
                return res.json({
                    isSuccess: true,
                    code: 1001,
                    message: "북마크 설정(ON)"
                });
            } else if (checkbookmarkRow[0].status == 1) {
                return res.json({
                    isSuccess: true,
                    code: 1002,
                    message: "북마크 해제(OFF)"
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
    }
};








