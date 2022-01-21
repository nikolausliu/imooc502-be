const router = require('koa-router')()
const Menu = require('../models/menuSchema')
const util = require('../utils/util')

router.prefix('/menus')

router.post('/operate', async (ctx) => {
  const { _id, action, ...params } = ctx.request.body
  console.log('=>', params)
  let res, info
  try {
    if (action === 'add') {
      res = await Menu.create(params)
      info = '创建成功'
    } else if (action === 'edit') {
      info = '编辑成功'
    } else {
      info = '删除成功'
    }
  } catch (error) { }
  ctx.body = util.success('', info)
})

module.exports = router
