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

main_router.use("/main.js",async function(req,res,next){
    res.send("main.js forbidden\n")
})

var toSend = function(temp){

    for(var i in temp){
        this[i] = temp[i]
    }

    this.data = ""

    this.contents = []

    this.point = []

    this.getfile = async function(temp){
        return (await asyncalize(fs.readFile)(temp))[1].toString()
    }

    this.write = async function(temp){
        this.data += temp
    }
    this.eval = async function(temp){
        await eval(`(async function(){${temp}})`).call(this)
    }

    this.add_doc = async function(doc){
        var temp_doc = `?>${doc}<?`
        var htmls=temp_doc.match(/\?>[\s\S]*?<\?/g) || []
        var jss=temp_doc.match(/<\?([\s\S]*?)\?>/g) || []
        this.contents.push({htmls,jss})
        return this.contents.length-1
    }

    this.content = async function(temp){
        this.point.push(this.point[0])
        this.point.shift()
    }

    this.include = async function(temp){
        var doc = await this.getfile(temp)
        this.point.unshift(await this.add_doc(doc))
    }

    this.from= async function(temp){
        var doc = await this.getfile(temp)
        this.point.unshift(await this.add_doc(doc))
    }

    this.render = async function(){
        var now
        var length
        while(this.point.length){
            now = this.point[0];
            if(this.contents[now].htmls.length)
                try{await this.write(this.contents[now].htmls.shift().slice(2,-2))
                }catch(e){await this.write(`Error: ${e}`)}
            if(this.contents[now].jss.length)
                try{await this.eval(this.contents[now].jss.shift().slice(2,-2))
                }catch(e){await this.write(`Error: ${e}`)}
            if(this.contents[now].htmls.length==0 && this.contents[now].jss.length==0)
                this.point.shift()
        }
    }
}
 
main_router.use(/.*\.jsg/,async function(req,res,next){
    var to_send=new toSend()
    to_send.point.unshift(await to_send.add_doc(await to_send.getfile(req.baseUrl.substr(1))))
    await to_send.render()
    res.send(to_send.data)
})

main_router.use(static_router)

var root_router = 0?static_router:main_router

app.use("/",root_router)

app.listen(3000)
