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
// 2. 책방 리스트 조회
async function selectbookroom() {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectbookroomQuery = `
    select Book.bookIdx, bookImgUrl, bookName, authorName, concat(ifnull(count(Community.bookIdx),0),'개의 글') as contentsCount
    from Book
           LEFT JOIN Community on Community.bookIdx = Book.bookIdx
    group by bookIdx
    order by Book.createdAt asc;
    `;
  const selectbookroomRow = await connection.query(
      selectbookroomQuery
  );
  connection.release();
  return selectbookroomRow;
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

module.exports = {
  insertbookroom, // 1. 책방 만들기
  selectbookroom, // 2. 책방 리스트 조회
  searchbookroom, // 4. 책방 검색
  selectbookcontents // 6. 글 조회 - 최신순
};
