const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

const usersRouter = require('./routes/users.js');
const postsRouter = require('./routes/posts.js');

app.use(express.json());
app.use(cookieParser());

app.use('/', [usersRouter, postsRouter]);

app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});
