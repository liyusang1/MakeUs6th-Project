const { pool } = require("../../../config/database");

// 로그인 이메일 체크
async function userEmailCheck(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `
                SELECT email, nickname 
                FROM Users 
                WHERE email = ?;
                `;
  const selectEmailParams = [email];
  const [emailRows] = await connection.query(
    selectEmailQuery,
    selectEmailParams
  );
  connection.release();

  return emailRows;
}

//닉네임 중복 체크
async function userNicknameCheck(nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectNicknameQuery = `
                SELECT email, nickname 
                FROM Users 
                WHERE nickname = ?;
                `;
  const selectNicknameParams = [nickname];
  const [nicknameRows] = await connection.query(
    selectNicknameQuery,
    selectNicknameParams
  );
  connection.release();
  return nicknameRows;
}

//유저정보 insert query
async function insertUserInfo(insertUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertUserInfoQuery = `
        INSERT INTO Users(email, password, nickname)
        VALUES (?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );
  connection.release();
  return insertUserInfoRow;
}

//로그인
async function selectUserInfo(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
                SELECT userIdx, email , password, nickname, status 
                FROM Users
                WHERE email = ?;
                `;

  let selectUserInfoParams = [email];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  connection.release();
  return [userInfoRows];
}

//마이 페이지 사용자 정보 가져오는 쿼리
async function getUserInfo(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getUserInfoQuery = `
  
         select ifnull(userImgUrl,-1) as userImgUrl,
         nickname,email from Users where userIdx = ?;

                `;

  const [userInfoRows] = await connection.query(
    getUserInfoQuery,
    userIdx
  );
  connection.release();
  return [userInfoRows];
}

//마이 페이지 내가 쓴 글 부분 가져오는 쿼리
async function getUserWriting(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getUserWritingQuery = `
  
   select distinct Community.bookIdx,bookName from Community
         left outer join Book on Community.bookIdx = Book.bookIdx
         where userIdx = ? and Community.status = 1 and Book.status =1;

                `;

  const [getUserWritingRows] = await connection.query(
    getUserWritingQuery,
    userIdx
  );
  connection.release();
  return [getUserWritingRows];
}

//마이 페이지 내가 북마크 한 글
async function getUserBookmarkWritingRows(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getUserBookmarkWritingQuery = `
  
  select distinct Community.bookIdx,bookName from CommunityBookMark
         inner join Community on Community.contentsIdx = CommunityBookMark.contentsIdx
         inner join Book on Community.bookIdx = Book.bookIdx

         where CommunityBookMark.userIdx = ? and CommunityBookMark.status = 1 
         and Book.status =1 and Community.status = 1;

                `;

  const [getUserBookmarkWritingRows] = await connection.query(
    getUserBookmarkWritingQuery,
    userIdx
  );
  connection.release();
  return [getUserBookmarkWritingRows];
}

//마이 페이지 내가 북마크 한 서점
async function getUserBookmarkBookstore(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getUserBookmarkBookstoreQuery = `
  
     select Bookstore.bookstoreIdx,storeName,
     ifnull(storeImageUrl,-1) as storeImgUrl

     from Bookstore
     left outer join (select BookstoreImage.bookstoreIdx,imageUrl as storeImageUrl
                      from BookstoreImage
                            inner join (select bookstoreIdx, max(imageIdx) as firstImageId
                                           from BookstoreImage
                                                group by bookstoreIdx) firstImage
                                       on BookstoreImage.imageIdx = firstImage.firstImageId where BookstoreImage.status = 1) bookStoreImages
                      on Bookstore.bookstoreIdx = bookStoreImages.bookstoreIdx
     inner join StoreBookMark on StoreBookMark.bookstoreIdx = Bookstore.bookstoreIdx

     where Bookstore.status=1 and StoreBookMark.status = 1 and StoreBookMark.userIdx = ?

                `;

  const [getUserBookmarkBookstoreRows] = await connection.query(
    getUserBookmarkBookstoreQuery,
    userIdx
  );
  connection.release();
  return [getUserBookmarkBookstoreRows];
}

//비밀번호 변경
async function updateUserPasswordInfo(newInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateUserPasswordQuery = `
  
       update Users
       set password = ? where userIdx = ?;

                `;

  const [updateUserPasswordRows] = await connection.query(
    updateUserPasswordQuery,
    newInfoParams
  );
  connection.release();
  return [updateUserPasswordRows];
}

//닉네임 변경
async function updateNickname(updateNicknameParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateNicknameQuery = `
  
        update Users set nickname = ? where userIdx = ?

                `;

  const [updateNicknameRows] = await connection.query(
    updateNicknameQuery,
    updateNicknameParams
  );
  connection.release();
  return [updateNicknameRows];
}

//프로필 이미지 변경
async function updateImage(updateImageParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateImageQuery = `
  
        update Users set userImgUrl = ? where userIdx = ?;

                `;

  const [updateImageRows] = await connection.query(
    updateImageQuery,
    updateImageParams
  );
  connection.release();
  return [updateImageRows];
}

//회원탈퇴
async function patchUserStatus(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const patchUserStatusQuery = `
  
         update Users set status = 0 where userIdx = ?;

                `;

  const [patchUserStatusRows] = await connection.query(
    patchUserStatusQuery,
    userIdx
  );
  connection.release();
  return [patchUserStatusRows];
}

//bookIdx 체크
async function checkBookIdx(bookIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkBookIdxQuery = `
  
         select bookIdx from Book where bookIdx = ?;

                `;

  const [checkBookIdxRows] = await connection.query(
    checkBookIdxQuery,
    bookIdx
  );
  connection.release();
  return checkBookIdxRows;
}

//내가 쓴글 조회
async function getUserWritingInfo(getUserWritingParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getUserWritingInfoQuery = `
  
  select
    ifnull(userImgUrl,-1)as userImgUrl,Users.userIdx,nickname,
     CASE
       WHEN TIMESTAMPDIFF(HOUR, Community.createdAt, now()) > 23
          THEN IF(TIMESTAMPDIFF(DAY, Community.createdAt, now()) > 7, date_format(Community.createdAt, '%Y-%m-%d'),
                  concat(TIMESTAMPDIFF(DAY, Community.createdAt, now()), " 일 전"))
       WHEN TIMESTAMPDIFF(HOUR, Community.createdAt, now()) < 1
          THEN concat(TIMESTAMPDIFF(MINUTE, Community.createdAt, now()), " 분 전")
       ELSE concat(TIMESTAMPDIFF(HOUR, Community.createdAt, now()), " 시간 전")
       END AS createdAt,

  ifnull(isBookMark,0) as isBookMark,
   Community.contentsIdx,contents
     from Community
       inner join Users on Users.userIdx = Community.userIdx

       left outer join (select communityBookMarkIdx,CommunityBookMark.contentsIdx, count(*) as isBookMark from CommunityBookMark where userIdx = ? and status = 1
       group by communityBookMarkIdx) BookMark
       on Community.contentsIdx = BookMark.contentsIdx

       where bookIdx = ? and Users.userIdx = ?
       order by Community.createdAt desc ;

                `;

  const [getUserWritingInfoRows] = await connection.query(
    getUserWritingInfoQuery,
    getUserWritingParams
  );
  connection.release();
  return getUserWritingInfoRows;
}

//bookname 전달 쿼리
async function getBookName(bookIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getBookNameQuery = `
  
         select bookName from Book where bookIdx = ?;

                `;

  const [getBookNameRows] = await connection.query(
    getBookNameQuery,
    bookIdx
  );
  connection.release();
  return getBookNameRows;
}

module.exports = {
  userEmailCheck,
  userNicknameCheck,
  insertUserInfo,
  selectUserInfo,
  getUserInfo,
  getUserWriting,
  getUserBookmarkWritingRows,
  getUserBookmarkBookstore,
  updateUserPasswordInfo,
  updateNickname,
  updateImage,
  patchUserStatus,
  checkBookIdx,
  getUserWritingInfo,
  getBookName
};
