#!/usr/local/bin/node

const Koa = require('koa')
const Router = require('koa-router')
const koaStatic = require('koa-static')
const koaBody = require('koa-body')
const {readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, statSync, linkSync, mkdirSync} = require('fs')
const path = require('path')

const app = new Koa
const router = new Router

app.use(koaStatic('public'))

app.use(koaBody({ multipart: true }))

router.get('/data', function (ctx) {
  if (!existsSync('data')) {
    mkdirSync('data')
    mkdirSync('data/audios')
    writeFileSync('data/data.json',  '{}')
  }
  ctx.body = readFileSync('data/data.json')
})

router.put('/data', function (ctx) {
  writeFileSync('data/data.json', JSON.stringify(ctx.request.body))
  ctx.body = ''
})

router.get('/audios-map', function (ctx) {
  let files = readdirSync('data/audios')
  ctx.body = files.map(f => [parseInt(path.parse(`data/audios/${f}`).name), undefined])
})

router.get('/audios/:thingId.wav', function (ctx) {
  const path = `data/audios/${ctx.params.thingId}.wav`
  if (existsSync(path)) {
    ctx.set('content-type', 'audio/wav')
    ctx.body = readFileSync(path)
  }
})

router.put('/audio/:thingId', function (ctx) {
  copyFileSync(ctx.request.files.audio.path, `data/audios/${ctx.params.thingId}.wav`)
  ctx.body = ''
})

app.use(router.routes())

const port = 8006
app.listen(port, function () {
  console.log(`Listening on http://localhost:${port}/`)
})
