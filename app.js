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
    resave: false,
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

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL 연결 성공');
});

app.get('/', (req, res) => {
  res.render('login');
});


// 로그인 페이지 라우트
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
})

app.post('/login', (req, res) => {
  const {UserID, Password} = req.body;
  db.query('SELECT * FROM user WHERE UserID = ? AND Password = ?', [UserID, Password], (err, results) => {
    if(err) throw err;

    if(results.length > 0) {
      req.session.UserID = results[0].id;
      res.send('로그인 성공');
    } else {
      res.send('로그인 실패');
    }
  });
  
});

// 서버 시작
app.listen(3000, () => {
  console.log('서버가 http://localhost:3000에서 실행 중입니다.');
});