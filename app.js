const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const log4js = require('./utils/log4j')

const koajwt = require('koa-jwt')
const util = require('./utils/util')
const router = require('koa-router')()
const users = require('./routes/users')
const menus = require('./routes/menus')
const roles = require('./routes/roles')

// error handler
onerror(app)

require('./config/db')

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// 触发错误
// app.use(async () => {
//   // 没有传ctx，所以会报错，所以会走到 onerror
//   ctx.body = 'hello'
// })

// logger
app.use(async (ctx, next) => {
  log4js.info(`ctx.request.query: ${JSON.stringify(ctx.request.query)}`)
  log4js.info(`ctx.request.body: ${JSON.stringify(ctx.request.body)}`)
  await next().catch((err) => {
    if (err.status == '401') {
      ctx.status = 200
      ctx.body = util.fail('', 'Token认证失败', util.CODE.AUTH_ERROR)
    } else {
      throw err
    }
  })
})


// routes
app.use(koajwt({ secret: 'IMOOC' }).unless({
  path: [/^\/api\/users\/login/]
}))
router.prefix('/api')

const jwt = require('jsonwebtoken')
router.get('/leave/count', (ctx) => {
  // const token = ctx.request.headers.authorization.split(' ')[1]
  // const payload = jwt.verify(token, 'IMOOC')
  // ctx.body = payload
  ctx.body = 'hello'
})

router.use(users.routes(), users.allowedMethods())
router.use(menus.routes(), menus.allowedMethods())
router.use(roles.routes(), roles.allowedMethods())
app.use(router.routes(), router.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  log4js.error(`${err.stack}`)
});

module.exports = app
