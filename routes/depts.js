const router = require('koa-router')()
const util = require('./../utils/util')
const Dept = require('./../models/deptSchema')

router.prefix('/depts')

// 部门操作：创建、编辑、删除
router.post('/operate', async (ctx) => {
  const { _id, action, ...params } = ctx.request.body
  let info
  try {
    if (action == 'add') {
      await Dept.create(params)
      info = '创建成功'
    } else if (action == 'edit') {
      params.updateTime = new Date()
      await Dept.findByIdAndUpdate(_id, params)
      info = '编辑成功'
    } else if (action == 'delete') {
      await Dept.findByIdAndRemove(_id)
      await Dept.deleteMany({ parentId: { $all: [_id] } })
      info = '删除成功'
    }
    ctx.body = util.success('', info)
  } catch (error) {
    ctx.body = util.fail('', `操作失败:${error.message}`)
  }
})

module.exports = router
