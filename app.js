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

// localhost:3000 접속시 로그인페이지로
app.get('/', (req, res) => {
  if(req.session.user) {
    res.render('home', {sessionInfo: req.session.user})
  } else {
    res.render('login')
  }
});

// 홈 페이지 라우트
app.get('/home', (req, res) => {
  if(req.session.user) {
    res.render('home', {sessionInfo: req.session.user})
  } else {
    res.render('login')
  }
});

// 로그인 페이지 라우트
app.get('/login', (req, res) => {
  if(req.session.user) {
    res.send(`
        <html>
            <head>
                <title>이미 로그인 중</title>
            </head>
            <body>
                <h1>이미 로그인되어있습니다.</h1>
                <p>3초 뒤 홈 화면으로 돌아갑니다.</p>
                <script>
                    // 3000ms (3초) 뒤에 '/home' 경로로 리디렉트
                    setTimeout(() => {
                        window.location.href = '/home';
                    }, 3000);
                </script>
            </body>
        </html>`);
  } else {
    res.render('login');
  }
});

// 회원가입 페이지 라우트
app.get('/register', (req, res) => {
  if(req.session.user) {
    res.send(`
        <html>
            <head>
                <title>이미 로그인 중</title>
            </head>
            <body>
                <h1>이미 로그인되어있습니다.</h1>
                <p>3초 뒤 홈 화면으로 돌아갑니다.</p>
                <script>
                    // 3000ms (3초) 뒤에 '/home' 경로로 리디렉트
                    setTimeout(() => {
                        window.location.href = '/home';
                    }, 3000);
                </script>
            </body>
        </html>`);
  } else {
    res.render('register');
  }
})

// 회원탈퇴 페이지 라우트
app.get('/deleteAccount', (req, res) => {
  if(req.session.user) {
    res.render('deleteAccount')
  } else {
    res.render('login');
  }
})

// 예수금 입금/출금 페이지 라우트
app.get('/balanceInputOutput', (req, res) => {
  if(req.session.user) {
    res.render('balanceInputOutput');
  } else {
    res.render('login')
  }
})

// 보유 주식 현황 페이지 라우트
app.get('/myStockList', (req, res) => {
  if(req.session.user) {
    db.query('select holding.StockName, Quantity, CurrentPrice, Price From user inner join Holding on user.UserID = holding.UserID inner join stock on holding.StockName = stock.StockName inner join transaction on holding.UserID = transaction.UserID AND holding.StockName = transaction.StockName Where user.UserID = ?', [req.session.user.UserID], (err, results) => {
      res.render('myStockList', {myStockList: results, sessionInfo: req.session.user});
    });
  } else {
    res.redirect('login')
  }
});

// 내 주식 거래 내역 페이지 라우트
app.get('/myTransaction', (req, res) => {
  if(req.session.user) {
    db.query('SELECT * FROM transaction WHERE UserID = ?', [req.session.user.UserID], (err, results) => {
      if(err) throw err;

      res.render('myTransaction', {myTransactionList: results, sessionInfo: req.session.user})
    });
    
  } else {
    res.redirect('login')
  }
});

// 종목 목록 페이지 라우트
app.get('/stockList', (req, res) => {
  if(req.session.user) {
    db.query('SELECT * FROM Stock', (err, results) => {
      if(err) throw err;

      res.render('stockList', {stockList: results});
    });
  } else {
    res.redirect('login');
  }
});

// 종목 검색 페이지 라우트
app.get('/stockSearch', (req, res) => {
  if(req.session.user) {
    db.query('SELECT * FROM Stock', (err, results) => {
      if(err) throw err;

      res.render('stockSearch', {stockList: results});
    });
  } else {
    res.redirect('login');
  }
});




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
                <p>3초 뒤 로그인 화면으로 돌아갑니다.</p>
                <script>
                    // 3000ms (3초) 뒤에 '/login' 경로로 리디렉트
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                </script>
            </body>
        </html>`);
    }
  });
});

// 로그아웃 기능
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.send(`
    <html>
        <head>
            <title>로그아웃</title>
        </head>
        <body>
            <h1>로그아웃 완료</h1>
            <p>3초 뒤 로그인 화면으로 돌아갑니다.</p>
            <script>
                // 3000ms (3초) 뒤에 '/login' 경로로 리디렉트
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            </script>
        </body>
    </html>`);
});

// 회원가입 기능
app.post('/register', (req, res) => {
  const {UserID, Password, Name} = req.body;
  db.query('SELECT * FROM user WHERE UserID = ?', [UserID], (err, results) => {
    if(err) throw err;

    if(results.length <= 0) {
      db.query('INSERT INTO user VALUE(?, ?, ?, 0)', [UserID, Password, Name], (err, results) => {
        if(err) throw err;

        res.send(`
          <html>
              <head>
                  <title>회원가입 성공</title>
              </head>
              <body>
                  <h1>회원가입에 성공하였습니다.</h1>
                  <a href = "/login">로그인 페이지</a>
              </body>
          </html>`);
      });
      
    } else {
      res.send(`
        <html>
            <head>
                <title>회원가입 실패</title>
            </head>
            <body>
                <h1>이미 존재하는 아이디입니다.</h1>
                <a href = "/register">회원가입 페이지</a>
            </body>
        </html>`);
    }
  });
});

// 회원탈퇴 기능
app.post('/deleteAccount_YES', (req, res) => {
  db.query('DELETE FROM user WHERE UserID = ?', [req.session.user.UserID], (err, results) => {
    if(err) throw err;

    req.session.destroy();
    res.send(`
      <html>
          <head>
              <title>회원탈퇴 성공</title>
          </head>
          <body>
              <h1>회원탈퇴하였습니다.</h1>
              <p>3초 뒤 로그인 화면으로 돌아갑니다.</p>
                <script>
                    // 3000ms (3초) 뒤에 '/login' 경로로 리디렉트
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                </script>
          </body>
      </html>`);
  });
});

// 회원탈퇴 취소시
app.post('/deleteAccount_NO', (req, res) => {
  res.redirect('/home');
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

// 종목 검색 기능
app.post('/stockSearch', (req, res) => {
  const {StockName} = req.body;
  db.query('SELECT * FROM Stock WHERE StockName LIKE ?', ['%'+StockName+'%'], (err, results) => {
    if(err) throw err;

    res.render('stockList', {stockList: results});
  });
});

// 보유 주식 검색 기능
app.post('/myStockSearch', (req, res) => {
  const {StockName} = req.body;
  db.query('WITH temp AS (select holding.StockName, Quantity, CurrentPrice, Price From user inner join Holding on user.UserID = holding.UserID inner join stock on holding.StockName = stock.StockName inner join transaction on holding.UserID = transaction.UserID AND holding.StockName = transaction.StockName Where user.UserID = ?) SELECT * FROM temp WHERE StockName LIKE ?', [req.session.user.UserID, '%'+StockName+'%'], (err, results) => {
    if(err) throw err;

    res.render('myStockList', {myStockList: results, sessionInfo: req.session.user});
  })
});

// 내 주식 거래 내역 검색 기능
app.post('/myTransactionSearch', (req, res) => {
  var {TransactionStockName, TransactionStartDate, TransactionEndDate} = req.body;
  if(TransactionStartDate == '') {
    TransactionStartDate = '1900-01-01';
  }
  if(TransactionEndDate == '') {
    TransactionEndDate = new Date();
  }
  db.query('SELECT * FROM transaction WHERE StockName LIKE ? AND Date <= ? AND Date >= ? AND UserID = ?', ['%'+TransactionStockName+'%', TransactionEndDate, TransactionStartDate, req.session.user.UserID], (err, results) => {
    if(err) throw err;

    res.render('myTransaction', {myTransactionList: results, sessionInfo: req.session.user});
  })
});

// 서버 시작
app.listen(3000, () => {
  console.log('서버가 http://localhost:3000에서 실행 중입니다.');
});