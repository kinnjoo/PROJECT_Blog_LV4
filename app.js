const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

const usersRouter = require('./routes/users.js');
const postsRouter = require('./routes/posts.js');
const commentsRouter = require('./routes/comments.js');
const likesRouter = require('./routes/likes.js');

app.use(express.json());
app.use(cookieParser());

app.use('/api', [usersRouter, postsRouter, commentsRouter, likesRouter]);

app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});
