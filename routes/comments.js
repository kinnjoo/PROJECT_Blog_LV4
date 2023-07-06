const express = require('express');
const router = express.Router();

const { Users, Posts, Comments } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware.js');

const { Op } = require('sequelize');

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
        .json({ errorMessage: '존재하지 않는 게시글입니다.' });
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
router.put('/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.user;
    const { commentId } = req.params;
    const { content } = req.body;

    const findCommentId = await Comments.findOne({ where: { commentId } });

    if (!findCommentId) {
      return res
        .status(404)
        .json({ errorMessage: '존재하지 않는 댓글입니다.' });
    } else if (userId !== findCommentId.UserId) {
      return res
        .status(403)
        .json({ errorMessage: '댓글 수정 권한이 없습니다.' });
    } else if (!content) {
      return res
        .status(412)
        .json({ errorMessage: '댓글 내용이 비어있습니다.' });
    }

    await Comments.update(
      { content },
      { where: { [Op.and]: [{ commentId }] } },
    );

    return res.status(200).json({ message: '댓글을 수정하였습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errorMessage: '예상치 못한 오류로 인해 댓글 수정에 실패했습니다.',
    });
  }
});

// 댓글 삭제 API
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
  const userId = res.locals.user;
  const { commentId } = req.params;

  const findCommentId = await Comments.findOne({ where: { commentId } });

  if (!findCommentId) {
    return res.status(404).json({ errorMessage: '존재하지 않는 댓글입니다.' });
  } else if (userId !== findCommentId.UserId) {
    return res.status(403).json({ errorMessage: '댓글 삭제 권한이 없습니다.' });
  }

  await Comments.destroy({
    where: { [Op.and]: [{ commentId }] },
  });
  return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
});

module.exports = router;
