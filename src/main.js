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
const rootPath =  path.join(process.cwd(), 'data/qrcode')
const background =  path.join(process.cwd(), 'data/background.jpg')

/**
 * 获取文件名
 */
const getFilename = function (ext, project) {
  let timestamp = _.now()
  let date = new Date(timestamp)
  let dir = rootPath + '/' + project + '/' + date.format('yyyyMMdd')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  let file = timestamp + '.' + ext
  return dir + '/' + file
}

/**
 * 生成二维码
 */
router.get('/qrcode', ctx => {
  // 检查参数
  let project = ctx.query.project
  if (_.isNil(project)) {
    ctx.body = 'error'
    return
  }

  // 生成二维码
  try {
    // 生成二维码对象
    let location = decodeURI(ctx.query.location)
    let img = qrcode.image(location)

    // 取保存文件名，并保存文件
    let filename = getFilename('png', project)
    img.pipe(fs.createWriteStream(filename))

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
  // 检查参数
  let project = ctx.query.project
  let qrpath = ctx.query.qrpath
  if (_.isNil(project) || _.trim(project) == '') {
    ctx.body = 'error'
    return
  }
  if (_.isNil(qrpath) || _.trim(qrpath) == '') {
    ctx.body = 'error'
    return
  }

  // draw
  try {
    // 取保存文件名，并保存文件
    let filename = getFilename('jpg')

    // 取qrpath，制作图片
    let qrpath = decodeURI(ctx.query.qrpath)
    images(background)
      .draw(images(rootPath + '/' + qrpath), 50, 50)
      .save(filename, {
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
app.listen(3200)

