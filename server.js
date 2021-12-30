#!/usr/local/bin/node

const Koa = require('koa')
const Router = require('koa-router')
const koaStatic = require('koa-static')
const {readFileSync} = require('fs')

const app = new Koa
const router = new Router

app.use(koaStatic('public'))

router.get('/data', function (ctx) {
  ctx.body = readFileSync('data/data.json')
})

app.use(router.routes())

const port = 8006
app.listen(port, function () {
  console.log(`Listening on http://localhost:${port}/`)
})
