const router = require('koa-router')()
const User = require('../models/userSchema')
const util = require('../utils/util')
const jwt = require('jsonwebtoken')

router.prefix('/users')

router.post('/login', async (ctx) => {
  try {
    const { userName, userPwd } = ctx.request.body
    /**
     * 数据库返回指定字段
     * 1. findOne({}, 'userId userName userEmail state role deptId roleList')
     * 2. findOne({}, {userName: 1, _id: 0})
     * 3. findOne({}).select('userId userName')
     */
    const res = await User.findOne({
      userName,
      userPwd
    }, 'userId userName userEmail state role deptId roleList')
    const data = res._doc
    const token = jwt.sign({
      data,
    }, 'IMOOC', { expiresIn: '1h' })
    data.token = token
    if (res) {
      ctx.body = util.success(data)
    } else {
      ctx.body = util.fail('账号或密码不正确')
    }
  } catch (error) {
    ctx.body = util.fail(error.msg)
  }
})

module.exports = router
