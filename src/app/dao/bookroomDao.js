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


// 6. 글 조회 - 최신순
async function selectbookcontents(bookIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectbookcontentsQuery = `
    select Users.userIdx, userImgUrl, nickname, date_format(Community.createdAt,'%Y.%m.%d') as createAt,contents
    from Community
           inner join Users on Users.userIdx = Community.userIdx
    where bookIdx = ?
    order by Community.createdAt asc;
    `;

  const selectbookcontentsParams = [bookIdx];
  const selectbookcontentsRow = await connection.query(
      selectbookcontentsQuery,
      selectbookcontentsParams
  );
  connection.release();
  return selectbookcontentsRow;
}


// . 글 수정
async function updatecontents(contents,userIdx,bookIdx,contentsIdx,) {
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
  console.log(updatecontentsRow);
  return updatecontentsRow;
}


// . 글 삭제
async function deletecontents(bookIdx,userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deletecontentsQuery = `
    delete from Community
    where bookIdx = ? and userIdx =?;
    `;
  const deletecontentsParams = [bookIdx,userIdx];
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




module.exports = {
  insertbookroom, // 1. 책방 만들기
  selectbookroom, // 2. 책방 리스트 조회 - 최신순
  selectbookroomPopular, // 3. 책방 리스트 조회 - 인기순
  searchbookroom, // 4. 책방 검색
  selectbookcontents, // 6. 글 조회 - 최신순
  updatecontents, // 글 수정
  deletecontents, // 글 삭제
  searchcontents, // 본문 내용 검색
  checkContents // 본문 내용 검색 - Validation check

};
