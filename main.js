var express = require('express')
var fs = require("fs")

var asyncalize = (func) => function(){
    return new Promise(
            (callback)=>func(...arguments,function(){callback(arguments)})
            )
}

var app = express()

var static_router = express.static("jasog")

var main_router = express.Router()

//var include 
//var from
//var content
//var write

main_router.use("/main.js",async function(req,res,next){
    res.send("main.js forbidden\n")
})

var toSend = function(temp){
    for(var i in temp){
        this[i]=temp[i]
    }
    this.data=""
    this.write=async function(temp){
        this.data += temp
    }
    this.eval=async function(temp){
        await eval(`(async function(){${temp}})`).call(this)
    }
    this.include=async function(temp){
        var doc = (await asyncalize(fs.readFile)(temp))[1].toString()
            await render.call(this,doc)
    }
    this.content=async function(temp){
    }
    this.from=async function(temp){
        
    }
    this.callback=[]
}
 

main_router.use(/.*\.jsg/,async function(req,res,next){
    doc = (await asyncalize(fs.readFile)(req.baseUrl.substr(1)))[1].toString()
    var to_send=new toSend()
    res.send(await render.call(to_send,doc))
})

var render = async function(doc){
    var temp_doc = `?>${doc}<?`
    var htmls = temp_doc.match(/\?>[\s\S]*?<\?/g)
    var jss = temp_doc.match(/<\?([\s\S]*?)\?>/g)
    var length = jss?jss.length:0
    for(var i=0;i<length;i++){
        try{await this.write(htmls[i].slice(2,-2))
        }catch(e){await this.write(`Error: ${e}`)}
        try{await this.eval(jss[i].slice(2,-2))
        }catch(e){await this.write(`Error: ${e}`)}
    }
    await this.write(htmls[i].slice(2,-2))
    if(this.callback.length)await this.callback.pop()()
    return this.data
}

main_router.use(static_router)

var root_router = 0?static_router:main_router

app.use("/",root_router)

app.listen(3000)
