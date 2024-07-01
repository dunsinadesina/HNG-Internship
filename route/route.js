const express = require('express');
const router = express.Router();
const controller = require('../controller/stage1');

router.get('/hello', controller.greetVisitor);

module.exports = router;