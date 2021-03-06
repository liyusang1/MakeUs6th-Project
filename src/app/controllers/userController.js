const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const userDao = require('../dao/userDao');
const { constants } = require('buffer');


//회원가입 API
exports.signUp = async function (req, res) {
    const {
        email, password,passwordCheck,nickname
    } = req.body;

    if (!email) return res.json({isSuccess: false, code: 2000, message: "이메일을 입력해주세요"});

    if (email.length > 30) return res.json({
        isSuccess: false,
        code: 2001,
        message: "이메일은 30자리 미만으로 입력해주세요"
    });

    if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 2002, message: "이메일을 형식을 정확하게 입력해주세요"});

    if (!password) return res.json({isSuccess: false, code: 2003, message: "비밀번호를 입력 해주세요"});

    if (password.length < 8 || password.length > 20) return res.json({
        isSuccess: false,
        code: 2004,
        message: "비밀번호는 8자 이상 20자 이하로 입력해주세요"
    });

    if (!passwordCheck) return res.json({isSuccess: false, code: 2005, message: "비밀번호를 한번 더 입력해주세요"});

    if (passwordCheck !== password) return res.json({isSuccess: false, code: 2006, message: "비밀번호가 맞지 않습니다"});

    if (!nickname) return res.json({isSuccess: false, code: 2007, message: "닉네임을 입력 해주세요"});

    var englishCheck = /[a-zA-Z]/gi;

    if (!/^([가-힣]).{1,8}$/.test(nickname) || englishCheck.test(nickname))
    return res.json({
      isSuccess: false,
      code: 2008,
      message: "닉네임은 한글만 입력가능하고 2자 이상 8자 이하 이어야 합니다",
    });

    //특수문자 또는 공백 Validation
    var specialPattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
    var checkSpc = /[~!@#$%^&*()_+|<>?:{}]/gi;

    if (nickname.search(/\s/) != -1 ||specialPattern.test(nickname) == true ||checkSpc.test(nickname) ==true )
    return res.json({
        isSuccess: false,
        code: 2009,
        message: "닉네임에는 공백 또는 특수문자를 입력할 수 없습니다.",
      });

        try {
            // 이메일 중복 확인
            const emailRows = await userDao.userEmailCheck(email);
            if (emailRows.length > 0) {

                return res.json({
                    isSuccess: false,
                    code: 3000,
                    message: "사용 불가능한 이메일입니다"
                });
            }

            // 닉네임 중복 확인
            const nicknameRows = await userDao.userNicknameCheck(nickname);
            if (nicknameRows.length > 0) {
                return res.json({
                    isSuccess: false,
                    code: 3001,
                    message: "이미 사용중인 닉네임입니다"
                });
            }

            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            const insertUserInfoParams = [email, hashedPassword, nickname];
            
            const insertUserRows = await userDao.insertUserInfo(insertUserInfoParams);

            return res.json({
                isSuccess: true,
                code: 1000,
                message: "회원가입 성공"
            });
        } catch (err) {
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(2010).send(`Error: ${err.message}`);
        }
};

//로그인
exports.signIn = async function (req, res) {
    const {
        email, password
    } = req.body;

    if (!email) return res.json({isSuccess: false, code: 2000, message: "이메일을 입력해주세요."});

    if (email.length > 30) return res.json({
        isSuccess: false,
        code: 2001,
        message: "이메일은 30자리 미만으로 입력해주세요."
    });

    if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 2002, message: "이메일을 형식을 정확하게 입력해주세요"});

    if (!password) return res.json({isSuccess: false, code: 2003, message: "비밀번호를 입력 해주세요."});

        try {
            const [userInfoRows] = await userDao.selectUserInfo(email)

            if (userInfoRows.length < 1) {
               
                return res.json({
                    isSuccess: false,
                    code: 3000,
                    message: "존재하지 않는 아이디 입니다."
                });
            }

            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            if (userInfoRows[0].password !== hashedPassword) {
            
                return res.json({
                    isSuccess: false,
                    code: 3001,
                    message: "비밀번호를 확인해주세요."
                });
            }
            if (userInfoRows[0].status === 0) {
             
                return res.json({
                    isSuccess: false,
                    code: 3002,
                    message: "비활성화 된 계정입니다. 고객센터에 문의해주세요."
                });
            } 
            //토큰 생성
            let token = await jwt.sign({
                    userIdx: userInfoRows[0].userIdx,
                    nickname: userInfoRows[0].nickname,
                    email: userInfoRows[0].email,
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 365일
            );

            res.json({
                jwt: token,
                isSuccess: true,
                code: 1000,
                message: "로그인 성공 : "+userInfoRows[0].nickname
            });
            
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            return res.status(2010).send(`Error: ${err.message}`);
        }
};

// 토큰 검증
exports.check = async function (req, res) {
    res.json({
        isSuccess: true,
        code: 1000,
        message: "검증 성공",
        info: req.verifiedToken
    })
};

//이메일check API
exports.checkEmail = async function (req, res) {
    const {
        email
    } = req.query;

    if (!email) return res.json({isSuccess: false, code: 2000, message: "이메일을 입력해주세요"});

    if (email.length > 30) return res.json({
        isSuccess: false,
        code: 2001,
        message: "이메일은 30자리 미만으로 입력해주세요"
    });

    if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 2002, message: "이메일을 형식을 정확하게 입력해주세요"});

        try {
            // 이메일 중복 확인
            const emailRows = await userDao.userEmailCheck(email);
            if (emailRows.length > 0) {

                return res.json({
                    isSuccess: false,
                    code: 3000,
                    message: "사용 불가능한 이메일입니다"
                });
            }

            return res.json({
                isSuccess: true,
                code: 1000,
                message: email+"은 사용가능한 이메일 입니다."
            });
        } catch (err) {
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(2010).send(`Error: ${err.message}`);
        }
};

//마이페이지
exports.myPage = async function (req, res) {

   //유저인덱스
   const {userIdx} = req.verifiedToken;
  
        try {
          //사용자정보 가져오기
          const [userInfoRows] = await userDao.getUserInfo(userIdx);

          //마이페이스 내가 쓴 글
          const userWritingRows = await userDao.getUserWriting(userIdx);

          //마이페이스 내가 북마크 한 글
          const userBookmarkWritingRows = await userDao.getUserBookmarkWritingRows(userIdx);

          //마이페이스 내가 북마크 한 서점
          const userBookmarkBookstoreRows = await userDao.getUserBookmarkBookstore(userIdx);

          if(userInfoRows.length >= 0 && userWritingRows.length >=0 && 
             userBookmarkWritingRows.length >= 0 && userBookmarkBookstoreRows.length >=0)
            return res.json({
                isSuccess: true,
                code: 1000,
                message: userInfoRows[0].nickname+"님의 마이페이지 조회 성공",
                result: 
                {info:userInfoRows,writing:userWritingRows,
                 writingBookmark:userBookmarkWritingRows,bookstoreBookmark:userBookmarkBookstoreRows}
            });

            return res.json({
                isSuccess: false,
                code: 3000,
                message: "에러 발생"
            });
        } catch (err) {
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(2010).send(`Error: ${err.message}`);
        }
};