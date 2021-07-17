const {pool} = require("../../../config/database");

//모든 서점 가져오기
async function getAllBookstoreInfo(pagingParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getAllBookstoreInfoQuery = `

        select Bookstore.bookstoreIdx,
               storeName,
               location,
               ifnull(storeImageUrl, -1) as storeImgUrl

        from Bookstore
                 left outer join (select BookstoreImage.bookstoreIdx, imageUrl as storeImageUrl
                                  from BookstoreImage
                                           inner join (select bookstoreIdx, min(imageIdx) as firstImageId
                                                       from BookstoreImage
                                                       group by bookstoreIdx) firstImage
                                                      on BookstoreImage.imageIdx = firstImage.firstImageId
                                  where BookstoreImage.status = 1) bookStoreImages
                                 on Bookstore.bookstoreIdx = bookStoreImages.bookstoreIdx
        where Bookstore.status = 1 limit ?,?

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

        select Bookstore.bookstoreIdx,
               storeName,
               location,
               ifnull(storeImageUrl, -1) as storeImgUrl

        from Bookstore
                 left outer join (select BookstoreImage.bookstoreIdx, imageUrl as storeImageUrl
                                  from BookstoreImage
                                           inner join (select bookstoreIdx, min(imageIdx) as firstImageId
                                                       from BookstoreImage
                                                       group by bookstoreIdx) firstImage
                                                      on BookstoreImage.imageIdx = firstImage.firstImageId
                                  where BookstoreImage.status = 1) bookStoreImages
                                 on Bookstore.bookstoreIdx = bookStoreImages.bookstoreIdx

        where SUBSTRING_INDEX(SUBSTRING_INDEX(Bookstore.location, " ", 2), " ", -1) in (?)
          and Bookstore.status = 1 limit ?,?

    `;

    const [getSpecificBookstoreInfoRows] = await connection.query(
        getSpecificBookstoreInfoQuery,
        bookstoreInfoParams
    );
    connection.release();

    return getSpecificBookstoreInfoRows;
}

//서점 인덱스 체크
async function bookstoreIdxCheck(bookstoreIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const bookstoreIdxCheckQuery = `

        select bookstoreIdx
        from Bookstore
        where bookstoreIdx = ?
          and status = 1;

    `;

    const [bookstoreIdxCheckRows] = await connection.query(
        bookstoreIdxCheckQuery,
        bookstoreIdx
    );
    connection.release();

    return bookstoreIdxCheckRows;
}

//서점 이미지 가져오기
async function getBookstoreImages(bookstoreIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getBookstoreImagesQuery = `

        select imageIdx, imageUrl
        from BookstoreImage

             -- 서점전체리스트와 중복된 사진이 처음에 안나오도록 정렬기준 변경
        where bookstoreIdx = ?
          and status = 1
        order by imageIdx desc;

    `;

    const [getBookstoreImagesRows] = await connection.query(
        getBookstoreImagesQuery,
        bookstoreIdx
    );
    connection.release();

    return getBookstoreImagesRows;
}

//서점 상세정보 가져오기
async function getBookstoreDetail(bookstoreDetailParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getBookstoreDetailQuery = `

        select storeName,
               ifnull(location, -1)    as location,

               ifnull(isBookMark, 0)   as isBookMark,

               ifnull(storeTime, -1)   as storeTime,
               ifnull(siteAddress, -1) as siteAddress,
               ifnull(phoneNumber, -1) as phoneNumber,
               ifnull(storeInfo, -1)   as storeInfo

        from Bookstore

                 -- 북마크 관련 쿼리
                 left outer join (select storemarkIdx, StoreBookMark.bookstoreIdx, count(*) as isBookMark
                                  from StoreBookMark
                                  where userIdx = ?
                                    and status = 1
                                  group by storemarkIdx) BookMark
                                 on Bookstore.bookstoreIdx = BookMark.bookstoreIdx

        where Bookstore.bookstoreIdx = ?
          and status = 1;

    `;

    const [getBookstoreDetailRows] = await connection.query(
        getBookstoreDetailQuery,
        bookstoreDetailParams
    );
    connection.release();

    return getBookstoreDetailRows;
}

//DB에서 북마크 체크
async function getBookmarkCheck(bookmarkParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getBookmarkCheckQuery = `

        select status
        from StoreBookMark
        where userIdx = ?
          and bookstoreIdx = ?;

    `;

    const [getBookmarkCheckRows] = await connection.query(
        getBookmarkCheckQuery,
        bookmarkParams
    );
    connection.release();

    return getBookmarkCheckRows;
}

//DB에 북마크 새로 생성 쿼리
async function postBookmark(bookmarkParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const postBookmarkQuery = `

  -- 북마크 생성
  insert into StoreBookMark(userIdx,bookstoreIdx,status)
  values (?,?,1);
                `;

    const [postBookmarkRows] = await connection.query(
        postBookmarkQuery,
        bookmarkParams
    );
    connection.release();

    return postBookmarkRows;
}

//북마크 상태 수정 쿼리
async function patchBookmark(bookmarkParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const patchBookmarkQuery = `

  -- 북마크 상태 수정
  update StoreBookMark
  SET status= if(status = 1, 0, 1)
  where userIdx = ? and bookstoreIdx = ?;

                `;

    const [patchBookmarkRows] = await connection.query(
        patchBookmarkQuery,
        bookmarkParams
    );
    connection.release();

    return patchBookmarkRows;
}

module.exports = {
    getAllBookstoreInfo,
    getSpecificBookstoreInfo,
    bookstoreIdxCheck,
    getBookstoreImages,
    getBookstoreDetail,
    getBookmarkCheck,
    postBookmark,
    patchBookmark
};
