const { pool } = require("../../../config/database");

/** 홈화면 **/
// 1. 책방 만들기
async function insertbookroom(bookName,authorName,bookImgUrl) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertbookroomQuery = `
    insert into Book(bookName,authorName,bookImgUrl)
    values (?,?,?);
    `;
  const insertbookroomParams = [bookName,authorName,bookImgUrl];
  const insertbookroomRow = await connection.query(
      insertbookroomQuery,
      insertbookroomParams
  );
  connection.release();
  return insertbookroomRow;
}
// 2. 책방 리스트 조회-최신순
async function selectbookroom(page,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectbookroomQuery = `
    select Book.bookIdx, bookImgUrl, bookName, authorName, concat(ifnull(count(Community.bookIdx),0),'개의 글') as contentsCount
    from Book
           LEFT JOIN Community on Community.bookIdx = Book.bookIdx
    group by bookIdx
    order by Book.createdAt desc
      limit ?,?;
    `;
  const selectbookroomParams = [Number(page),Number(limit)];
  const selectbookroomRow = await connection.query(
      selectbookroomQuery,
      selectbookroomParams
  );
  connection.release();
  return selectbookroomRow;
}

// 2. 책방 리스트 조회 - 인기순
async function selectbookroomPopular(page,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectbookroomPopularQuery = `
    select Book.viewCount,Book.bookIdx, bookImgUrl, bookName, authorName, concat(ifnull(count(Community.bookIdx),0),'개의 글') as contentsCount
    from Book
           left JOIN Community on Community.bookIdx = Book.bookIdx
    group by bookIdx
    order by Book.viewCount desc
      limit ?,?;
  `;
  const selectbookroomPopularParams = [Number(page),Number(limit)];
  const [selectbookroomPopularRow] = await connection.query(
      selectbookroomPopularQuery,
      selectbookroomPopularParams
  );
  connection.release();
  return selectbookroomPopularRow;
}

// 4. 책방검색
async function searchbookroom(bookName) {
  const connection = await pool.getConnection(async (conn) => conn);
  const searchbookroomQuery = `
    select Book.bookIdx, bookImgUrl, bookName, authorName
    from Book
    where bookName like concat('%',?,'%');
  `;

  const [searchbookroomRow] = await connection.query(
      searchbookroomQuery,
      bookName
  );
  connection.release();
  //console.log(searchbookroomRow);
  return searchbookroomRow;
}

//조회 할 때마다 viewCount+1 되는 쿼리

async function updateviewCount(bookIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateviewCountQuery =
      `update Book set viewCount = viewCount +1 where bookIdx = ?;`;
  const updateviewCountParams = [bookIdx];
  const updateviewCountRow= await connection.query(
      updateviewCountQuery,
      updateviewCountParams
  );
  connection.release();
  return updateviewCountRow;
}





// 6. 글 조회 - 최신순
async function selectbookcontents(bookIdx,page,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectbookcontentsQuery = `
    select Users.userIdx, ifnull(userImgUrl,-1) as userImgUrl, nickname, date_format(Community.createdAt,'%Y.%m.%d') as createAt,contents
    from Community
           inner join Users on Users.userIdx = Community.userIdx
    where bookIdx = ?
    order by Community.createdAt desc
    limit ?,?;
    `;

  const selectbookcontentsParams = [bookIdx,Number(page),Number(limit)];
  const selectbookcontentsRow = await connection.query(
      selectbookcontentsQuery,
      selectbookcontentsParams
  );

  connection.release();
  return selectbookcontentsRow;
}




// 6. 글 조회 - 북마크순
async function selectbookcontentsbookmark(bookIdx,page,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectbookcontentsbookmarkQuery = `
    select  bookIdx,Community.contentsIdx,CommunityBookMark.status,Users.userIdx, ifnull(userImgUrl,-1) as userImgUrl, nickname, date_format(Community.createdAt,'%Y.%m.%d') as createAt,contents
    from CommunityBookMark
           left join Community on Community.contentsIdx = CommunityBookMark.contentsIdx
           left join Users on Users.userIdx = Community.userIdx
    where CommunityBookMark.status=1 and bookIdx=?
      limit ?,?;
    `;

  const selectbookcontentsbookmarkParams = [bookIdx,Number(page),Number(limit)];
  const selectbookcontentsbookmarkRow = await connection.query(
      selectbookcontentsbookmarkQuery,
      selectbookcontentsbookmarkParams
  );
  connection.release();
  return selectbookcontentsbookmarkRow;
}

// . 글 작성
async function postcontents(userIdx,bookIdx,contents) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postcontentsQuery = `
    insert into Community(userIdx,bookIdx,contents)
    values(?,?,?);
    `;
  const postcontentsParams = [userIdx,bookIdx,contents];
  const postcontentsRow = await connection.query(
      postcontentsQuery,
      postcontentsParams
  );
  connection.release();
  return postcontentsRow;
}

// JWT TOKEN에 해당하는 userIdx - Community(userIdx) 체크 select userIdx from Community where userIdx = ? and bookIdx=? and contentsIdx=?;
async function checkContentsUserIdx(bookIdx,contentsIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkContentsUserIdxQuery = `
    select userIdx from Community where bookIdx=? and contentsIdx=?;
    `;
  const checkContentsUserIdxParams = [bookIdx,contentsIdx];
  const [checkContentsUserIdxRow] = await connection.query(
      checkContentsUserIdxQuery,
      checkContentsUserIdxParams
  );
  connection.release();

  return checkContentsUserIdxRow[0]['userIdx'];
}

// contentsIdx 콘텐츠 인덱스 번호 데이터 확인
async function checkContentsContentsIdx(contentsIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkContentsContentsIdxQuery = `
    select contentsIdx from Community where contentsIdx=?;
    `;
  const checkContentsContentsIdxParams = [contentsIdx];
  const [checkContentsContentsIdxRow] = await connection.query(
      checkContentsContentsIdxQuery,
      checkContentsContentsIdxParams
  );
  connection.release();
  return checkContentsContentsIdxRow;
}
// bookIdx 콘텐츠 인덱스 번호 데이터 확인
async function checkbookroomIdx(bookIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkbookroomIdxQuery = `
    select bookIdx from Book where bookIdx=?;
    `;
  const checkbookroomIdxParams = [bookIdx];
  const [checkbookroomIdxRow] = await connection.query(
      checkbookroomIdxQuery,
      checkbookroomIdxParams
  );
  connection.release();
  return checkbookroomIdxRow;
}


// . 글 수정
async function updatecontents(contents,userIdx,bookIdx,contentsIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updatecontentsQuery = `
    update Community
    set contents=?
    where userIdx =? and bookIdx =? and contentsIdx=?;
    `;
  const updatecontentsParams = [contents,userIdx,bookIdx,contentsIdx];
  const updatecontentsRow = await connection.query(
      updatecontentsQuery,
      updatecontentsParams
  );
  connection.release();
  return updatecontentsRow;
}


// . 글 삭제
async function deletecontents(userIdx,bookIdx,contentsIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deletecontentsQuery = `
    delete from Community
    where userIdx =? and bookIdx = ?  and contentsIdx=?;
    `;
  const deletecontentsParams = [userIdx,bookIdx,contentsIdx];
  const deletecontentsRow = await connection.query(
      deletecontentsQuery,
      deletecontentsParams
  );
  connection.release();
  return deletecontentsRow;
}

// . 본문 검색 - 내용
async function searchcontents(bookIdx,contents) {
  const connection = await pool.getConnection(async (conn) => conn);
  const searchcontentsQuery = `
    select contentsIdx, bookIdx, Community.userIdx,userimgUrl, nickname,
           date_format(Community.createdAt,'%Y.%m.%d') as createdAt, contents
    from Community
           inner join Users on Users.userIdx = Community.userIdx
    where bookIdx=? and contents like concat('%',?,'%');
    `;

  const searchcontentsParams = [bookIdx,contents];
  const [searchcontentsRow] = await connection.query(
      searchcontentsQuery,
      searchcontentsParams
  );
  connection.release();
  return searchcontentsRow;
}

// . 본문 검색 - 내용 - Validation Check
async function checkContents(bookIdx,contents) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkContentsQuery = `
    select exists( select contentsIdx, bookIdx, Community.userIdx, contents
                   from Community
                          inner join Users on Users.userIdx = Community.userIdx
                   where bookIdx=? and contents like concat('%',?,'%')) as checkcontents
    `;

  const checkContentsParams = [bookIdx,contents];
  const [checkContentsRow] = await connection.query(
      checkContentsQuery,
      checkContentsParams
  );
  connection.release();
  return checkContentsRow[0]['checkcontents'];
}

// . 글 신고하기 new!
async function insertreport(contentsIdx,reportUserIdx,targetUserIdx,reportReason) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertreportQuery = `
    insert into Report(contentsIdx,reportUserIdx,targetUserIdx,reportReason)
    values (?,?,?,?);
    `;
  const insertreportParams = [contentsIdx,reportUserIdx,targetUserIdx,reportReason];
  const insertreportRow = await connection.query(
      insertreportQuery,
      insertreportParams
  );
  connection.release();
  return insertreportRow;
}

// . 글 신고하기 select targetUserIdx
async function getTargetUserIdx(bookIdx,contentsIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getTargetUserIdxQuery = `
    select userIdx from Community where bookIdx=? and contentsIdx=?;
    `;
  const getTargetUserIdxParams = [bookIdx,contentsIdx];
  const [getTargetUserIdxRow] = await connection.query(
      getTargetUserIdxQuery,
      getTargetUserIdxParams
  );
  connection.release();
  return getTargetUserIdxRow[0]['userIdx'];
}


// 글 북마크가 등록 되어 있는지 체크 쿼리 GET
async function checkbookmark(userIdx,contentsIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkbookmarkQuery = `
    select status from CommunityBookMark where userIdx=? and contentsIdx=?;
    `;
  const checkbookmarkParams = [userIdx,contentsIdx];
  const checkbookmarkRow = await connection.query(
      checkbookmarkQuery,
      checkbookmarkParams
  );
  connection.release();
  return checkbookmarkRow;
}

//1. X => 글 북마크 설정 쿼리 POST
async function insertbookmark(userIdx,contentsIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertbookmarkQuery = `
    insert into CommunityBookMark(userIdx,contentsIdx)
values (?,?);
    `;
  const insertbookmarkParams = [userIdx,contentsIdx];
  const insertbookmarkRow = await connection.query(
      insertbookmarkQuery,
      insertbookmarkParams
  );
  connection.release();
  return insertbookmarkRow;
}

// 2.O=> 글 북마크 상태 변경 쿼리 PATCH

async function updatebookmark(userIdx,contentsIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updatebookmarkQuery = `
    update CommunityBookMark
set status= if(status =1,0,1)
where userIdx =? and contentsIdx=?;
    `;
  const updatebookmarkParams = [userIdx,contentsIdx];
  const updatebookmarkRow = await connection.query(
      updatebookmarkQuery,
      updatebookmarkParams
  );
  connection.release();
  return updatebookmarkRow;
}


module.exports = {
  insertbookroom, // 1. 책방 만들기
  selectbookroom, // 2. 책방 리스트 조회 - 최신순
  selectbookroomPopular, // 3. 책방 리스트 조회 - 인기순
  searchbookroom, // 4. 책방 검색
  selectbookcontents, // 6. 글 조회 - 최신순
  selectbookcontentsbookmark, // . 글 조회 - 북마크순
  updatecontents, // 글 수정
  deletecontents, // 글 삭제
  searchcontents, // 본문 내용 검색
  checkContents, // 본문 내용 검색 - Validation check
  updateviewCount, //글 조회 하면 viewCount +1 되는 dao
  postcontents, // 글 작성
  checkContentsUserIdx, //contents userIdx 체크
  checkContentsContentsIdx, // contentsIdx 체크
  checkbookroomIdx, //bookIdx 체크
  insertreport, //신고하기
  getTargetUserIdx,
  checkbookmark,
  insertbookmark,
  updatebookmark
};
