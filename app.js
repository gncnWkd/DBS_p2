const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');

app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true,
  })
);

// EJS 설정
app.set('view engine', 'ejs');

// MySQL 연결 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'test',
  password: '0000',
  database: 'db_2020014975'
});

// DB 연결
db.connect((err) => {
  if (err) throw err;
  console.log('MySQL 연결 성공');
});

// localhost:8000 접속시 로그인페이지로
app.get('/', (req, res) => {
  res.render('login')
});

// localhost:8000 접속시 로그인페이지로
app.get('/home', (req, res) => {
  if(req.session.user) {
    res.render('home', {sessionInfo: req.session.user})
  } else {
    res.render('login')
  }
});

// 로그인 페이지 라우트
app.get('/login', (req, res) => {
  res.render('login');
});

//회원가입 페이지 라우트
app.get('/register', (req, res) => {
  res.render('register');
})

// 예수금 입금/출금 페이지 라우트
app.get('/balanceInputOutput', (req, res) => {
  res.render('balanceInputOutput');
})










// 로그인 기능
app.post('/login', (req, res) => {
  const {UserID, Password} = req.body;
  db.query('SELECT * FROM user WHERE UserID = ? AND Password = ?', [UserID, Password], (err, results) => {
    if(err) throw err;

    if(results.length > 0) {
      req.session.user = {
        UserID: results[0].UserID,
        Password: results[0].Password,
        Name: results[0].Name,
        Balance: results[0].Balance,
      };
      res.render('home', {sessionInfo: req.session.user});
    } else {
      res.send(`
        <html>
            <head>
                <title>로그인 실패</title>
            </head>
            <body>
                <h1>아이디나 비밀번호가 틀렸습니다.</h1>
                <p>3초 뒤 홈화면으로 돌아갑니다.</p>
                <script>
                    // 3000ms (3초) 뒤에 '/home' 경로로 리디렉트
                    setTimeout(() => {
                        window.location.href = '/home';
                    }, 3000);
                </script>
            </body>
        </html>`);
    }
  });
});

// 입금 기능
app.post('/input', (req, res) => {
  const {Money} = req.body;
  if(Money > 0) {
    db.query('UPDATE user SET Balance = user.Balance+? WHERE UserID = ?', [Money, req.session.user.UserID], (err, results) => {
      if(err) throw err;

      db.query('SELECT * FROM user WHERE UserID = ?', [req.session.user.UserID], (err, results) => {
        if(err) throw err;
        req.session.user.Balance = results[0].Balance;
        res.redirect('/home');
      });
    });
  } else {
    res.redirect('/home');
  }
});

// 출금 기능
app.post('/output', (req, res) => {
  const {Money} = req.body;
  if(Money <= req.session.user.Balance) {
    db.query('UPDATE user SET Balance = user.Balance-? WHERE UserID = ?', [Money, req.session.user.UserID], (err, results) => {
      if(err) throw err;

      db.query('SELECT * FROM user WHERE UserID = ?', [req.session.user.UserID], (err, results) => {
        if(err) throw err;
        req.session.user.Balance = results[0].Balance;
        res.redirect('/home');
      });
    });
  } else {
    res.send(`
      <html>
            <head>
                <title>잔액 부족</title>
            </head>
            <body>
                <h1>잔액이 부족합니다.</h1>
                <p>3초 뒤 홈화면으로 돌아갑니다.</p>
                <script>
                    // 3000ms (3초) 뒤에 '/home' 경로로 리디렉트
                    setTimeout(() => {
                        window.location.href = '/home';
                    }, 3000);
                </script>
            </body>
        </html>`);
  }
});

// 서버 시작
app.listen(3000, () => {
  console.log('서버가 http://localhost:3000에서 실행 중입니다.');
});