const _ = require('lodash')
const Koa = require('koa')
const router = require('koa-router')()
const images = require('images')
const qrcode = require('qr-image')
const path =require('path')
const fs = require('fs')
const app = new Koa()
require('he-date-format')

/**
 * 定义生成图片的根目录
 * 定义背景图片路径
 */
const rootPath = './qrcode'
const background = './qrcode/back.jpg'

/**
 * 获取文件名
 */
const getFilename = function (ext) {
  let timestamp = _.now()
  let date = new Date(timestamp)
  let dir = rootPath + '/' + date.format('yyyyMMdd')
  let file = timestamp + '.' + ext
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  return dir + '/' + file
}

/**
 * 生成二维码
 */
router.get('/qrcode', ctx => {
  try {
    // 生成二维码对象
    let location = decodeURI(ctx.query.location)
    let img = qrcode.image(location)

    // 取保存文件名，并保存文件
    let file = getFilename('png')
    img.pipe(fs.createWriteStream(file))

    // 返回成功
    ctx.body = 'success'
  } catch (err) {
    ctx.body = 'error'
  }
})

/**
 * 绘图
 */
router.get('/draw', ctx => {
  try {
    // 取保存文件名，并保存文件
    let file = getFilename('jpg')

    // 取qrpath，制作图片
    let qrpath = decodeURI(ctx.query.qrpath)
    images(background)
      .draw(images(rootPath + '/' + qrpath), 50, 50)
      .save(file, {
        quality: 80
      })

    // 返回成功
    ctx.body = 'success'
  } catch (err) {
    ctx.body = 'err'
  }
})

/**
 * 监听
 */
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000)

