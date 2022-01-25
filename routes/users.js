const router = require('koa-router')()
const User = require('../models/userSchema')
const Counter = require('../models/counterSchema')
const util = require('../utils/util')
const jwt = require('jsonwebtoken')
const md5 = require('md5')

router.prefix('/users')

/**
 * 用户登录
 */
router.post('/login', async (ctx) => {
  try {
    const { userName, userPwd } = ctx.request.body
    /**
     * 数据库返回指定字段
     * 1. findOne({}, 'userId userName userEmail state role deptId roleList')
     * 2. findOne({}, {userName: 1, _id: 0})
     * 3. findOne({}).select('userId userName')
     */
    const res = await User.findOne(
      {
        userName,
        userPwd,
      },
      'userId userName userEmail state role deptId roleList'
    )
    const data = res._doc
    const token = jwt.sign(
      {
        data,
      },
      'IMOOC',
      { expiresIn: '1h' }
    )
    data.token = token
    if (res) {
      ctx.body = util.success(data)
    } else {
      ctx.body = util.fail('', '账号或密码不正确')
    }
  } catch (error) {
    ctx.body = util.fail('', error.message)
  }
})

// 获取全量用户列表
router.get('/all/list', async (ctx) => {
  try {
    const list = await User.find({}, 'userId userName userEmail')
    ctx.body = util.success(list)
  } catch (error) {
    ctx.body = util.fail('', error.message)
  }
})

/**
 * 用户列表
 */
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
        total,
      },
      list,
    })
  } catch (error) {
    ctx.body = util.fail('', `查询异常: ${error.message}`)
  }
})

/**
 * 用户批量删除
 */
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
    ctx.body = util.fail('', '删除失败')
  } catch (error) {
    ctx.body = util.fail('', `删除操作异常: ${error.message}`)
  }
})

/**
 * 用户新增/编辑
 */
router.post('/operate', async (ctx) => {
  const { userId, userName, userEmail, mobile, job, state, roleList, deptId, action } =
    ctx.request.body
  if (action === 'add') {
    if (!userName || !userEmail || !(deptId && deptId.length)) {
      ctx.body = util.fail('', '参数错误', util.CODE.PARAM_ERROR)
      return
    }
    // 通过counter表实现userId自增
    const doc = await Counter.findOneAndUpdate(
      { _id: 'userId' },
      { $inc: { sequence_value: 1 } },
      { new: true }
    )
    // 新增的时候要判断用户名邮箱不能与已有用户重复
    const res = await User.findOne({ $or: [{ userName }, { userEmail }] }, '_id userName userEmail')
    if (res) {
      ctx.body = util.fail(
        '',
        `系统检测到有重复的用户，信息如下：${res.userName} - ${res.userEmail}`
      )
    } else {
      try {
        const user = new User({
          userId: doc.sequence_value,
          userName,
          userPwd: md5('123456'), // 默认初始密码
          userEmail,
          role: 1, // 默认普通用户
          roleList,
          job,
          state,
          deptId,
          mobile,
        })
        user.save()
        ctx.body = util.success({}, '用户创建成功')
      } catch (error) {
        ctx.body = util.fail('', '用户创建失败')
      }
    }
  } else {
    if (!(deptId && deptId.length)) {
      ctx.body = util.fail('', '部门不能为空', util.CODE.PARAM_ERROR)
      return
    }
    try {
      await User.findOneAndUpdate({ userId }, { mobile, job, state, roleList, deptId })
      ctx.body = util.success({}, '更新成功')
    } catch (error) {
      ctx.body = util.fail('', `更新失败: ${error.message}`)
    }
  }
})

module.exports = router
