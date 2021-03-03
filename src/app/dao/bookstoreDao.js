const { pool } = require("../../../config/database");

//모든 서점 가져오기
async function getAllBookstoreInfo(pagingParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getAllBookstoreInfoQuery = `

  select storeName,location,
  ifnull(storeImageUrl,-1) as storeImgUrl

     from Bookstore
     left outer join (select BookstoreImage.bookstoreIdx,imageUrl as storeImageUrl
                      from BookstoreImage
                            inner join (select bookstoreIdx, min(imageIdx) as firstImageId
                                           from BookstoreImage
                                                group by bookstoreIdx) firstImage
                                       on BookstoreImage.imageIdx = firstImage.firstImageId where BookstoreImage.status = 1) bookStoreImages
                      on Bookstore.bookstoreIdx = bookStoreImages.bookstoreIdx
  limit ?,?

                `;

  const [getAllBookstoreInfoRows] = await connection.query(
    getAllBookstoreInfoQuery,
    pagingParams
  );
  connection.release();

  return getAllBookstoreInfoRows;
}

module.exports = {
  getAllBookstoreInfo,
};
