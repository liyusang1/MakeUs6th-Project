const { pool } = require("../../../config/database");

//모든 서점 가져오기
async function getAllBookstoreInfo(pagingParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getAllBookstoreInfoQuery = `

  select Bookstore.bookstoreIdx,storeName,location,
  ifnull(storeImageUrl,-1) as storeImgUrl

     from Bookstore
     left outer join (select BookstoreImage.bookstoreIdx,imageUrl as storeImageUrl
                      from BookstoreImage
                            inner join (select bookstoreIdx, min(imageIdx) as firstImageId
                                           from BookstoreImage
                                                group by bookstoreIdx) firstImage
                                       on BookstoreImage.imageIdx = firstImage.firstImageId where BookstoreImage.status = 1) bookStoreImages
                      on Bookstore.bookstoreIdx = bookStoreImages.bookstoreIdx
  where Bookstore.status=1                    
  limit ?,?

                `;

  const [getAllBookstoreInfoRows] = await connection.query(
    getAllBookstoreInfoQuery,
    pagingParams
  );
  connection.release();

  return getAllBookstoreInfoRows;
}

//특정 서점 가져오기
async function getSpecificBookstoreInfo(bookstoreInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getSpecificBookstoreInfoQuery = `

  select Bookstore.bookstoreIdx,storeName,location,
    ifnull(storeImageUrl,-1) as storeImgUrl

       from Bookstore
       left outer join (select BookstoreImage.bookstoreIdx,imageUrl as storeImageUrl
                        from BookstoreImage
                              inner join (select bookstoreIdx, min(imageIdx) as firstImageId
                                             from BookstoreImage
                                                  group by bookstoreIdx) firstImage
                                         on BookstoreImage.imageIdx = firstImage.firstImageId where BookstoreImage.status = 1) bookStoreImages
                        on Bookstore.bookstoreIdx = bookStoreImages.bookstoreIdx

where SUBSTRING_INDEX(SUBSTRING_INDEX(Bookstore.location, " ", 2), " ", -1) in (?) and Bookstore.status = 1
limit ?,?

                `;

  const [getSpecificBookstoreInfoRows] = await connection.query(
    getSpecificBookstoreInfoQuery,
    bookstoreInfoParams
  );
  connection.release();

  return getSpecificBookstoreInfoRows;
}


module.exports = {
  getAllBookstoreInfo,
  getSpecificBookstoreInfo
};


