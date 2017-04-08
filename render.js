var Render = function(temp){

    for(var i in temp){
        this[i] = temp[i]
    }

    this.data = ""

    this.contents = []

    this.point = []

    this.asyncalize = (func) => function(){
        return new Promise(
                (callback)=>func(...arguments,function(){callback(arguments)})
                )
    }

    if(typeof module == "undefined"){
        this.getfile = async function(temp){
            var storage = sessionStorage
            if(storage.hasOwnProperty(temp)){
                return storage.getItem(temp)
            }else{
                var value = await (await fetch(temp)).text();
                storage.setItem(temp,value);
                return value
            }
        }
    }else{
        this.getfile = async function(temp){
            var fs = require("fs")
            return (await this.asyncalize(fs.readFile)(temp))[1].toString()
        }
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
        var a = this.point.pop()
        var b = this.point.pop()
        this.point.unshift(a)
        this.point.unshift(b)
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

if (typeof module == "undefined"){
    var open_url = async function(temp){
        var render = new Render()
        render.point.unshift(
            await render.add_doc(
                await render.getfile(temp)
            )
        )
        await render.render()
        document.body.innerText=""
        document.write(render.data)
    }
}else{
    module.exports = Render
}
