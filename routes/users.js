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

router.get('/list', async (ctx) => {
  const { userId, userName, state } = ctx.request.query
  const { page, skipIndex } = util.pager(ctx.request.query)
  const params = {}
  if (userId) params.userId = userId
  if (userName) params.userName = userName
  if (state && state != '0') params.state = state
  try {
    const query = User.find(params, { _id: 0, userPwd: 0 })
    const list = await query.skip(skipIndex).limit(page.pageSize)
    const total = await User.countDocuments(params)
    ctx.body = util.success({
      page: {
        ...page,
        total
      },
      list
    })
  } catch (error) {
    ctx.body = util.fail(`查询异常:${error.stack}`)
  }
})

router.post('/delete', async (ctx) => {
  const { userIds } = ctx.request.body
  /**
   * 方式1
   * const res = await User.updateMany({ $or: [{ userId: 10001 }, { userId: 10002 }] }, { state: 2 })
   */
  // const res = await User.updateMany({ $or: userIds.map(userId => ({ userId })) }, { state: 2 })
  /**
   * 方式2
   * const res = await User.updateMany({ userId: { $in: [10001, 10002] } }, { state: 2 })
   */
  try {
    const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 })
    if (res.nModified) {
      ctx.body = util.success(res, `共删除成功${res.nModified}条`)
      return
    }
    ctx.body = util.fail('删除失败')
  } catch (error) {
    ctx.body = util.fail(`删除操作异常:${error.stack}`)
  }
})

module.exports = router
