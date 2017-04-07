var express = require('express')
var toSend = require("./render.js")

var app = express()

var static_router = express.static(".")

var main_router = express.Router()

main_router.use(/.*\.jsg/,async function(req,res,next){
    var to_send=new toSend()
    to_send.point.unshift(await to_send.add_doc(await to_send.getfile(req.baseUrl.substr(1))))
    await to_send.render()
    res.type('html')
    res.send(to_send.data)
})

main_router.use(static_router)

var root_router = (process.argv[2]==0)?static_router:main_router

app.use("/",root_router)

app.listen(3000)
