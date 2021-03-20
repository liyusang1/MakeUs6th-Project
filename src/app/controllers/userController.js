const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const nodemailer = require('nodemailer');

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
            logger.error(`App - checkEmail error\n: ${err.message}`);
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
            logger.error(`App - myPage error\n: ${err.message}`);
            return res.status(2010).send(`Error: ${err.message}`);
        }
};

//비밀번호변경
exports.changePassword = async function (req, res) {

    //클라이언트로 부터 현재비밀번호, 변경 비밀번호, 변경 비밀번호 확인을 입력 받음
    const {currentPassword,newPassword,passwordCheck} = req.body;

    //JWT토큰으로 부터 유저인덱스, 이메일을 받음
    const {userIdx,email} = req.verifiedToken;

    if ((!currentPassword) || (!newPassword) || (!passwordCheck) ) return res.json({
        isSuccess: false,
        code: 2000,
        message: "currentPassword, newPassword, passwordCheck 를 모두 입력해 주세요."
    });
   
    try {
        const [userInfoRows] = await userDao.selectUserInfo(email)

        //입력받은 비밀번호를 해시화 해서 DB와 비교, 비밀번호 검증
        const hashedPassword = await crypto.createHash('sha512').update(currentPassword).digest('hex');
        if (userInfoRows[0].password !== hashedPassword) {
        
            return res.json({
                isSuccess: false,
                code: 3001,
                message: "현재 비밀번호를 확인해주세요."
            });
        }

        if (newPassword.length < 8 || newPassword.length > 20) return res.json({
            isSuccess: false,
            code: 2002,
            message: "비밀번호는 8자 이상 20자 이하로 입력해주세요"
        });

        if (newPassword!==passwordCheck) return res.json({
            isSuccess: false,
            code: 2001,
            message: "두 비밀번호가 맞지 않습니다."
        });
        
        //새로운 변경 비밀번호를 해시화
        const newHashedPassword = await crypto.createHash('sha512').update(newPassword).digest('hex');

        if(hashedPassword == newHashedPassword) return res.json({
            isSuccess: false,
            code: 2003,
            message: "변경전 비밀번호와 변경후 비밀번호가 같습니다."
        });
        
        const newInfoParams = [newHashedPassword,userIdx]; 
        const newUserInfoRows = await userDao.updateUserPasswordInfo(newInfoParams)

        return res.json({
            isSuccess: true,
            code: 1000,
            message: "비밀번호 변경 성공"
        });
        
    } catch (err) {
        logger.error(`App - changePassword error\n: ${JSON.stringify(err)}`);
        return res.status(2010).send(`Error: ${err.message}`);
    }
};

//프로필 관리
exports.profile = async function (req, res) {

    //유저인덱스
    const {userIdx} = req.verifiedToken;
   
         try {
           //사용자정보 가져오기
           const [userInfoRows] = await userDao.getUserInfo(userIdx);
 
           if(userInfoRows.length >= 0 )
             return res.json({
                 isSuccess: true,
                 code: 1000,
                 message: userInfoRows[0].nickname+"님의 프로필 관리 조회 성공",
                 result:userInfoRows    
             });
 
             return res.json({
                 isSuccess: false,
                 code: 3000,
                 message: "에러 발생"
             });
         } catch (err) {
             logger.error(`App - profile error\n: ${err.message}`);
             return res.status(2010).send(`Error: ${err.message}`);
         }
 };

//닉네임 변경
exports.changeNickname = async function (req, res) {

    //유저인덱스
    const {userIdx} = req.verifiedToken;

    //변경할 닉네임을 입력받음
    const {nickname} = req.body;

    if (!nickname) return res.json({isSuccess: false, code: 2000, message: "닉네임을 입력 해주세요"});

    var englishCheck = /[a-zA-Z]/gi;

    if (!/^([가-힣]).{1,8}$/.test(nickname) || englishCheck.test(nickname))
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "닉네임은 한글만 입력가능하고 2자 이상 8자 이하 이어야 합니다",
    });

    //특수문자 또는 공백 Validation
    var specialPattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
    var checkSpc = /[~!@#$%^&*()_+|<>?:{}]/gi;

    if (nickname.search(/\s/) != -1 ||specialPattern.test(nickname) == true ||checkSpc.test(nickname) ==true )
    return res.json({
        isSuccess: false,
        code: 2002,
        message: "닉네임에는 공백 또는 특수문자를 입력할 수 없습니다.",
      });

         try {
             //사용자정보 가져오기
             const [userInfoRows] = await userDao.getUserInfo(userIdx);
             let currentNickname = userInfoRows[0].nickname

             //변경전 닉네임과 변경 후 닉네임이 같은 지 체크
             if (currentNickname == nickname) {
                  return res.json({
                     isSuccess: false,
                     code: 2003,
                    message: "변경전 닉네임과 변경후 닉네임이 같습니다."
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

              const updateNicknameParams = [nickname,userIdx];
              const updateNicknameRows = await userDao.updateNickname(updateNicknameParams);
 
             return res.json({
                 isSuccess: true,
                 code: 1000,
                 message: currentNickname +" 에서 "+nickname+" 으로 닉네임 변경 완료"
             });
         } catch (err) {
             logger.error(`App - changeNickname error\n: ${err.message}`);
             return res.status(2010).send(`Error: ${err.message}`);
         }
 };

 
//프로필 이미지 변경
exports.patchImage = async function (req, res) {

    //유저인덱스
    const {userIdx} = req.verifiedToken;

    //변경할 이미지 url를 받음
    const {image} = req.body;

    if(!image) return res.json({
      isSuccess: false,
      code: 2000,
      message: "변경할 이미지의 URL을 입력해 주세요.",
    });
   
         try {
           //이미지 업데이트
           const updateImageParams = [image,userIdx];
           const updateImageRows = await userDao.updateImage(updateImageParams);
 
             return res.json({
                 isSuccess: true,
                 code: 1000,
                 message: "프로필 이미지 변경 완료"
             });
         } catch (err) {
             logger.error(`App - patchImage error\n: ${err.message}`);
             return res.status(2010).send(`Error: ${err.message}`);
         }
 };

//프로필 이미지 삭제
exports.deleteImage = async function (req, res) {

    //유저인덱스
    const {userIdx} = req.verifiedToken;

         try {
             //사용자정보 가져오기 이미 프로필 이미지가 없다면 삭제 불가
             const [userInfoRows] = await userDao.getUserInfo(userIdx);

             if(userInfoRows[0].userImgUrl == -1 || userInfoRows[0].userImgUrl == null)
              return res.json({
                isSuccess: false,
                code: 3000,
                message: "삭제할 프로필 이미지가 없습니다."
            });

             //이미지 url를 -1로 변경 
             const updateImageParams = [-1,userIdx];
             const updateImageRows = await userDao.updateImage(updateImageParams);
 
             return res.json({
                 isSuccess: true,
                 code: 1000,
                 message: "프로필 이미지 삭제 완료"
             });
         } catch (err) {
             logger.error(`App - deleteImage error\n: ${err.message}`);
             return res.status(2010).send(`Error: ${err.message}`);
         }
 };

//회원탈퇴
exports.patchUserStatus = async function (req, res) {

    //유저인덱스
    const {userIdx} = req.verifiedToken;

         try {
             
             const patchUserStatusRows = await userDao.patchUserStatus(userIdx);
 
             return res.json({
                 isSuccess: true,
                 code: 1000,
                 message: "회원 탈퇴 완료"
             });
         } catch (err) {
             logger.error(`App - patchUserStatus error\n: ${err.message}`);
             return res.status(2010).send(`Error: ${err.message}`);
         }
 };

//내가쓴글조회
//특정 bookIdx에서 내가 쓴 글만 조회 하는 기능
exports.getUserWriting = async function (req, res) {

    //page,limit 
    const {page,limit} = req.query;

    //유저인덱스
    const {userIdx} = req.verifiedToken;

    //path variable로 bookIdx받음
    const {bookIdx} = req.params;

    if (!/^([0-9]).{0,10}$/.test(bookIdx))
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "bookIdx는 숫자로 입력해야 합니다.",
    });

    if((!page) || (!limit)) return res.json({
        isSuccess: false,
        code: 2002,
        message: "page와 limit을 입력해 주세요.",
      });
     
         try {
             
             const checkBookIdxRows = await userDao.checkBookIdx(bookIdx);
             if(checkBookIdxRows.length ==0)
             return res.json({
                isSuccess: false,
                code: 2000,
                message: "해당하는 인덱스의 책이 존재 하지 않습니다."
            });

            const getUserWritingParams = [userIdx,bookIdx,userIdx,Number(page),Number(limit)];

            //유저가 쓴글을 가져옴
            const getUserWritingInfoRows = await userDao.getUserWritingInfo(getUserWritingParams);
            //책 이름 정보 가져옴
            const getBookNameRows = await userDao.getBookName(bookIdx);
 
            if(getUserWritingInfoRows.length > 0 )
             return res.json({
                 isSuccess: true,
                 code: 1000,
                 result : {book:getBookNameRows,writing:getUserWritingInfoRows},
                 message: "내가 쓴글 조회 완료"
             });

             return res.json({
                isSuccess: false,
                code: 4000,
                message: "해당 인덱스에는 내가 쓴글이 없습니다."
            });
         } catch (err) {
             logger.error(`App - getUserWriting error\n: ${err.message}`);
             return res.status(2010).send(`Error: ${err.message}`);
         }
 };


 //내가 북마크 한 글 조회
 //특정 bookIdx에서 내가 북마크하는 글만 조회 하는 기능
exports.getUserBookmarkWriting= async function (req, res) {

    //page,limit 
    const {page,limit} = req.query;

    //유저인덱스
    const {userIdx} = req.verifiedToken;

    //path variable로 bookIdx받음
    const {bookIdx} = req.params;

    if (!/^([0-9]).{0,10}$/.test(bookIdx))
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "bookIdx는 숫자로 입력해야 합니다.",
    });

    if((!page) || (!limit)) return res.json({
        isSuccess: false,
        code: 2002,
        message: "page와 limit을 입력해 주세요.",
      });

         try {
             
             const checkBookIdxRows = await userDao.checkBookIdx(bookIdx);
             if(checkBookIdxRows.length ==0)
             return res.json({
                isSuccess: false,
                code: 2000,
                message: "해당하는 인덱스의 책이 존재 하지 않습니다."
            });

            const getUserWritingParams = [userIdx,bookIdx,Number(page),Number(limit)];

            //유저가 북마크 한 글을 가져옴
            const getBookmarkWritingInfoRows = await userDao.getBookmarkWritingInfo(getUserWritingParams);
            //책 이름 정보 가져옴
            const getBookNameRows = await userDao.getBookName(bookIdx);
 
            if(getBookmarkWritingInfoRows.length > 0 )
             return res.json({
                 isSuccess: true,
                 code: 1000,
                 result : {myUserIdx:userIdx,book:getBookNameRows,writing:getBookmarkWritingInfoRows},
                 message: "내가 북마크 한 글 조회 완료"
             });

             return res.json({
                isSuccess: false,
                code: 4000,
                message: "해당 인덱스에는 내가 북마크 한 글이 없습니다."
            });
         } catch (err) {
             logger.error(`App - getUserBookmarkWriting error\n: ${err.message}`);
             return res.status(2010).send(`Error: ${err.message}`);
         }
 };

//비밀 번호 찾기
exports.findPassword = async function (req, res) {

    //클라이언트로 부터 찾고자 하는 이메일을 입력 받음
    const {email,nickname} = req.body;

    if (!email) return res.json({
        isSuccess: false,
        code: 2000,
        message: "이메일을 입력해 주세요."
    });

    if (!nickname) return res.json({isSuccess: false, code: 2001, message: "닉네임을 입력 해주세요"});

    var englishCheck = /[a-zA-Z]/gi;

    if (!/^([가-힣]).{1,8}$/.test(nickname) || englishCheck.test(nickname))
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "유효하지 않은 닉네임 형식 입니다.",
    });

    if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 2003, message: "이메일 형식을 정확하게 입력해주세요"});

    //DB에 존재하는 유저의 이메일인지 검토
    const [userInfoRows] = await userDao.selectUserInfo(email)
        
    if (userInfoRows.length == 0) return res.json({
        isSuccess: false,
        code: 3001,
        message: "가입되지 않은 이메일 입니다."
    });

    if (userInfoRows[0].nickname != nickname) return res.json({
        isSuccess: false,
        code: 3002,
        message: "올바르지 않은 닉네임 입니다. 가입하실 때 입력한 닉네임을 입력해 주세요."
    });

    //비밀번호를 랜덤 생성 할 변수
    var variable = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(",");

    //생성된 랜덤 비밀번호 저장, 이를 해시화 해서 DB에 넣을 것임
    var randomPassword = createRandomPassword(variable, 8);

    //비밀번호 랜덤 생성 함수
    function createRandomPassword(variable, passwordLength) {
        var randomString = "";
          for (var j=0; j<passwordLength; j++) 
            randomString += variable[Math.floor(Math.random()*variable.length)];
            return randomString
        }

    try {
        if (userInfoRows.length != 0){

        var userIdx = userInfoRows[0].userIdx
     
        //임시 비밀번호를 해시화
        const hashedPassword = await crypto.createHash('sha512').update(randomPassword).digest('hex');
        
        //해시화된 비밀번호를 DB에 저장
        const newInfoParams = [hashedPassword,userIdx]; 
        const newUserInfoRows = await userDao.updateUserPasswordInfo(newInfoParams)

        //유저에게 메일 전송
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            // 이메일을 보낼 계정 데이터 값 입력
            auth: { 
              user: 'bindingcom@gmail.com',
              pass: secret_config.gmailPassword,
            },
          });
        // 옵션값 설정
         const emailOptions = { 
              from: 'bindingcom@gmail.com',
              to:email,
              subject: 'Binding에서 ' + userInfoRows[0].nickname+ '님께 임시비밀번호를 알려드립니다.',
              html: 
              "<h1 >Binding에서 새로운 비밀번호를 알려드립니다.</h1> <h2> 비밀번호 : " + randomPassword + "</h2>"
              +'<h3 style="color: crimson;">임시 비밀번호로 로그인 하신 후, 반드시 비밀번호를 수정해 주세요.</h3>'
              +'<img src="https://firebasestorage.googleapis.com/v0/b/mangoplate-a1a46.appspot.com/o/mailImg.png?alt=media&token=75e07db2-5aa6-4cb2-809d-776ba037fdec">'		
              ,
            };
            //전송
            transporter.sendMail(emailOptions, res); 
        
        return res.json({
            isSuccess: true,
            code: 1000,
            message: "임시비밀번호를 "+email+"으로 발송했습니다. 확인해 주세요."
        });
    }
     
    return res.json({
        isSuccess: false,
        code: 3000,
        message: "에러 발생"
    });
        
    } catch (err) {
        logger.error(`App - findPassword error\n: ${JSON.stringify(err)}`);
        return res.status(2010).send(`Error: ${err.message}`);
    }
};