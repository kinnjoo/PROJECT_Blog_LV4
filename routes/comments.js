const express = require('express');
const router = express.Router();

const { Users, Posts, Comments } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware.js');

// 댓글 작성 API
router.post('/comments/:postId', authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.user;
    const { postId } = req.params;
    const { content } = req.body;

    const findPostId = await Posts.findOne({ where: { postId } });

    if (!findPostId) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    } else if (!content) {
      return res
        .status(412)
        .json({ errorMessage: '댓글 내용이 비어있습니다.' });
    }

    await Comments.create({ content, UserId: userId, PostId: postId });
    return res.status(201).json({ message: '댓글을 작성하였습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errorMessage: '예상치 못한 오류로 인해 댓글 작성에 실패했습니다.',
    });
    return;
  }
});

// 댓글 조회 API
router.get('/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  const findPostId = await Posts.findOne({ where: { postId } });

  if (!findPostId) {
    return res
      .status(404)
      .json({ errorMessage: '게시글이 존재하지 않습니다.' });
  }

  const commentList = await Comments.findAll({
    attributes: ['commentId', 'content', 'createdAt', 'updatedAt'],
    where: { postId },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Users,
        attributes: ['nickname'],
      },
    ],
  });
  return res.status(200).json({ comments: commentList });
});

module.exports = router;
