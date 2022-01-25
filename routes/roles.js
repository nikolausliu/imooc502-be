/**
 * 用户管理模块
 */
const router = require('koa-router')()
const Role = require('../models/roleSchema')
const util = require('../utils/util')
router.prefix('/roles')

// 查询所有角色列表
router.get('/allList', async (ctx) => {
  try {
    const list = await Role.find({}, "_id roleName")
    ctx.body = util.success(list);
  } catch (error) {
    ctx.body = util.fail('', `查询失败:${error.message}`)
  }
})

module.exports = router;
