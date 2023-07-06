const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth-middleware.js');
const { Posts, Likes } = require('../models');

// 좋아요 API
router.post('/posts/:postId/like', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const userId = res.locals.user;

  const post = await Posts.findOne({ where: { postId } });

  if (!post) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 게시글입니다.' });
  }

  const likes = await Likes.findOne({
    where: { UserId: userId, PostId: post.postId },
  });

  if (!likes) {
    await Likes.create({ UserId: userId, PostId: post.postId });
    return res.status(200).json({ message: '게시물에 좋아요를 눌렀습니다.' });
  } else {
    await Likes.destroy({ where: { UserId: userId, PostId: post.postId } });
    return res.status(200).json({ message: '좋아요를 취소했습니다.' });
  }
});

module.exports = router;
