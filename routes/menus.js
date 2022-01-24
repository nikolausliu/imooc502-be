const router = require('koa-router')()
const Menu = require('../models/menuSchema')
const util = require('../utils/util')

router.prefix('/menus')

router.get('/list', async (ctx) => {
  const { menuName, menuState } = ctx.request.query
  const params = {}
  if (menuName) params.menuName = menuName
  if (menuState) params.menuState = menuState
  const rootList = await Menu.find(params) || []
  ctx.body = util.success(rootList)
})

router.post('/operate', async (ctx) => {
  const { _id, action, ...params } = ctx.request.body
  console.log('=>', params)
  let res, info
  try {
    if (action === 'add') {
      res = await Menu.create(params)
      info = '创建成功'
    } else if (action === 'edit') {
      params.updateTime = new Date()
      res = await Menu.findByIdAndUpdate(_id, params)
      info = '编辑成功'
    } else {
      res = await Menu.findByIdAndRemove(_id)
      await Menu.deleteMany({ parentId: { $all: [_id] } })
      info = '删除成功'
    }
    ctx.body = util.success('', info)
  } catch (error) {
    ctx.body = util.fail('', `操作失败: ${error.message}`)
  }
})

module.exports = router
