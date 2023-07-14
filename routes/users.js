const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { Users } = require('../models');
const secretKey = require('../config/secretKey.json');

// 회원 가입 API
router.post('/signup', async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;

  // 닉네임 : 알파벳 대소문자(a~z, A~Z), 숫자(0~9), 최소 3자 이상
  const checkNickname = /^[a-zA-Z0-9]{3,}$/;

  // DB에 존재하는 닉네임 확인
  const isExistUser = await Users.findOne({ where: { nickname } });

  // 닉네임 : 형식 checkNickname으로 확인, DB에 존재하는지 확인
  // 패스워드 : 4자 이상, 닉네임 포함하지 않음
  // 3가지 항목 입력하지 않을시 오류
  if (!nickname || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }

  if (!checkNickname.test(nickname)) {
    return res
      .status(412)
      .json({ errorMessage: '닉네임의 형식이 올바르지 않습니다.' });
  }

  if (password.includes(nickname)) {
    return res
      .status(412)
      .json({ errorMessage: '패스워드에 닉네임이 포함되어 있습니다.' });
  } else if (password.length < 4) {
    return res
      .status(412)
      .json({ errorMessage: '패스워드 형식이 올바르지 않습니다.' });
  } else if (password !== confirmPassword) {
    return res
      .status(412)
      .json({ errorMessage: '패스워드가 일치하지 않습니다.' });
  }

  if (isExistUser) {
    return res.status(412).json({ errorMessage: '중복된 닉네임입니다.' });
  }

  // DB에 회원가입 정보 저장하기
  const user = new Users({ nickname, password });
  await user.save();

  return res.status(201).json({ message: '회원 가입에 성공하였습니다.' });
});

// 로그인 API
router.post('/login', async (req, res) => {
  const { nickname, password } = req.body;

  // 닉네임 일치하는 유저 찾기
  const user = await Users.findOne({ where: { nickname } });

  // 닉네임 일치하지 않거나 패스워드 일치하지 않을때
  if (!user || user.password !== password) {
    return res
      .status(412)
      .json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
  }

  // JWT 생성
  const token = jwt.sign({ userId: user.userId }, secretKey.key);

  res.cookie('Authorization', `Bearer ${token}`);
  console.log(token);
  res.status(200).json({ message: '로그인되었습니다.' });
});

module.exports = router;
