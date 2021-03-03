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