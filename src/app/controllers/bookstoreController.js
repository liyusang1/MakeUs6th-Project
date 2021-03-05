const { flags } = require('regex-email');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const bookstoreDao = require('../dao/bookstoreDao');

//서점 전체조회
exports.getAllBookstore = async function (req, res) {
    
//페이징 쿼리스트링으로 받음
const { page,limit } = req.query;
  
  if (!/^([0-9]).{0,5}$/.test(page))
  return res.json({
    isSuccess: false,
    code: 2001,
    message: "page는 숫자로만 입력을 해야합니다.",
  });

  if (!/^([0-9]).{0,5}$/.test(limit))
  return res.json({
    isSuccess: false,
    code: 2002,
    message: "limit는 숫자로만 입력을 해야합니다.",
  });

  try {
    const pagingParams = [Number(page),Number(limit)];
    const allBookstoreRows = await bookstoreDao.getAllBookstoreInfo(pagingParams)

    if (allBookstoreRows.length >= 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "조회 성공",
        result: allBookstoreRows,
      });
    }
    return res.json({
      isSuccess: true,
      code: 3000,
      message: "에러 발생.",
    });
  } catch (err) {
    // await connection.rollback(); // ROLLBACK
    // connection.release();
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
}

//특정 지역 서점 조회
exports.getBookstore = async function (req, res) {
    
  //페이징 쿼리스트링으로 받음,locationfilter 받음(중복 허용)
  const { page,limit,locationfilter } = req.query;

  //쿼리스트링으로 입력 받은 locationfilter값에 따라 지역 할당
  let location = [];

    if (!/^([0-9]).{0,5}$/.test(page))
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "page는 숫자로만 입력을 해야합니다.",
    });
  
    if (!/^([0-9]).{0,5}$/.test(limit))
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "limit는 숫자로만 입력을 해야합니다.",
    });

    if (!locationfilter)
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "최소 하나 이상의 locationfilter 값을 입력해 주세요.",
    });

    //console.log(locationfilter[0].length);

///locationfilter Validation
    if(locationfilter[0].length ==1){

    if (!/^([가-힣]).{1,8}$/.test(locationfilter))
    return res.json({
      isSuccess: false,
      code: 2005,
      message: "locationfilter는 2자 이상 9자 이하의 한글로 구성되어야 합니다.",
    });
  }
    else {
    for(let i=0; i<locationfilter.length; i++){

      if (!/^([가-힣]).{1,8}$/.test(locationfilter[i])){

    return res.json({
      isSuccess: false,
      code: 2004,
      message: "locationfilter는 2자 이상 9자 이하의 한글로 구성되어야 합니다.",
    });
   }

  }
}

//하나인 경우에는 location에 하나만 push, 그렇지 않으면 전부 push
    if(locationfilter[0].length ==1)
    location.push(locationfilter)
    else
    {
      for(let i=0; i<locationfilter.length; i++)
      location.push(locationfilter[i])
    }

    try {
      const bookstoreInfoParams = [location,Number(page),Number(limit)];
      const specificBookstoreRows = await bookstoreDao.getSpecificBookstoreInfo(bookstoreInfoParams)
  
      if (specificBookstoreRows.length >= 0) {
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "조회 성공",
          result: specificBookstoreRows,
          
        });
      }
      return res.json({
        isSuccess: false,
        code: 3000,
        message: "에러 발생.",
      });
    } catch (err) {
    
      logger.error(`App - SignUp Query error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
    }
  }

//서점 상세조회
exports.bookstoreDetail = async function (req, res) {
    
  //페이징 쿼리스트링으로 받음
  const { bookstoreIdx } = req.params;

  //유저인덱스
  const {userIdx} = req.verifiedToken;
    
    if (!/^([0-9]).{0,10}$/.test(bookstoreIdx))
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "bookstoreIdx는 숫자로 입력해야 합니다.",
    });

    const bookstoreIdxCheckRows = await bookstoreDao.bookstoreIdxCheck(bookstoreIdx)
    if (bookstoreIdxCheckRows.length == 0) 
      return res.json({
        isSuccess: false,
        code: 3001,
        message: "해당하는 인덱스의 서점이 존재하지 않습니다.",
      });

    try {
      //서점 이미지
      const bookstoreImagesRows = await bookstoreDao.getBookstoreImages(bookstoreIdx)

      //서점 상세 정보
      const bookstoreDetailParams = [userIdx,bookstoreIdx];
      const bookstoreDetailRows = await bookstoreDao.getBookstoreDetail(bookstoreDetailParams)
  
      if ( (bookstoreImagesRows.length >= 0) && (bookstoreDetailRows.length >=0) ) {
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "서점 조회 성공",
          result: {images:bookstoreImagesRows,bookStoreInfo:bookstoreDetailRows}
        });
      }
      return res.json({
        isSuccess: false,
        code: 3000,
        message: "에러 발생.",
      });
    } catch (err) {
      // await connection.rollback(); // ROLLBACK
      // connection.release();
      logger.error(`App - SignUp Query error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
    }
  }