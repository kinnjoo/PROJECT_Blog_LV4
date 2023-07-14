const express = require('express');
const router = express.Router();

const { Users, Posts, Comments } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware.js');

// 댓글 작성 API
router.post('/posts/:postId/commentId', authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.user;
    const { postId } = req.params;
    const { content } = req.body;

    const findPostId = await Posts.findOne({ where: { postId } });

    if (!content) {
      return res
        .status(412)
        .json({ errorMessage: '댓글 내용이 비어있습니다.' });
    }

    if (!findPostId) {
      return res
        .status(404)
        .json({ errorMessage: '존재하지 않는 게시글입니다.' });
    }

    await Comments.create({ content, userId, postId });
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
router.get('/posts/:postId/commentId', async (req, res) => {
  const { postId } = req.params;
  const findPostId = await Posts.findOne({ where: { postId } });

  if (!findPostId) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 게시글입니다.' });
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

// 댓글 수정 API
router.put(
  '/posts/:postId/commentId/:commentId',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = res.locals.user;
      const { commentId } = req.params;
      const { content } = req.body;

      const findCommentId = await Comments.findOne({
        where: { userId, commentId },
      });

      if (!content) {
        return res
          .status(412)
          .json({ errorMessage: '댓글 내용이 비어있습니다.' });
      }

      // DB에 댓글이 없거나 댓글을 작성한 유저가 아닐때
      if (!findCommentId) {
        return res
          .status(400)
          .json({ errorMessage: '잘못된 접근 방법입니다.' });
      }

      await Comments.update({ content }, { where: { commentId } });

      return res.status(200).json({ message: '댓글을 수정하였습니다.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        errorMessage: '예상치 못한 오류로 인해 댓글 수정에 실패했습니다.',
      });
    }
  },
);

// 댓글 삭제 API
router.delete(
  '/posts/:postId/commentId/:commentId',
  authMiddleware,
  async (req, res) => {
    const userId = res.locals.user;
    const { commentId } = req.params;

    const findCommentId = await Comments.findOne({
      where: { userId, commentId },
    });

    // DB에 댓글이 없거나 댓글을 작성한 유저가 아닐때
    if (!findCommentId) {
      return res.status(404).json({ errorMessage: '잘못된 접근 방법입니다.' });
    }

    await Comments.destroy({
      where: { commentId },
    });
    return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
  },
);

module.exports = router;
