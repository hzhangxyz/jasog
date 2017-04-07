var _html = async function(n) {
    var to_insert = await get_data(n)
    try{var config = JSON.parse(to_insert.match(/^\s*<!--([\s\S]*?)\s*-->/)[1])
    }catch(e){var config = {}}
    if(!config.hasOwnProperty("layout")){
        return [to_insert,config]
    }else{
        var [doc,ans] = await _html(config.layout)
        for(var i in config){
            ans[i] = config[i]
        }
        return [doc.replace(/<!--\s*[cC][oO][nN][tT][eE][nN][tT]\s*-->/,to_insert),ans]
    }
}

var _async_eval_for_print = async function(code,data){
    print = data[0]
    var to_eval = `(async (data)=>{
        print = data[0]
        ${code}
    })([print])`
    await eval(to_eval)
}

var storage = sessionStorage

var clear_data = async function() {
    storage.clear()
}

var clear_body = async function() {
    try{document.body.innerText = ""
    }catch(e){}
}

var get_data = async function(n) {
    if(storage.hasOwnProperty(n)){
        return storage.getItem(n)
    }else{
        var value = await (await fetch(n)).text()
        storage.setItem(n,value)
        return value
    }
}

var html = async function(n,m = window){
    var [doc, ans] = await _html(n)
    for(var i in ans){
        m[i] = ans[i]
    }
    var print = new Proxy(function(){},{
        apply: function(target, thisArg, argumentsList){
            target.data += argumentsList.join("")
        }
    })
    print.data = ""
    var temp_doc = `?>${doc}<?`
    var htmls = temp_doc.match(/\?>[\s\S]*?<\?/g)
    var jss = temp_doc.match(/<\?([\s\S]*?)\?>/g)
    var length = jss?jss.length:0
    for(var i=0;i<length;i++){
        try{print(htmls[i].slice(2,-2))
        }catch(e){print(`Error: ${e}`)}
        try{await _async_eval_for_print(jss[i].slice(2,-2),[print])
        }catch(e){print(`Error: ${e}`)}
    }
    print(htmls[i].slice(2,-2))
    return [print.data,ans]
}

var json = async function(n,m = window) {
    data = JSON.parse(await get_data(n))
    for(var i in data){
        m[i] = data[i]
    }
    return data
}

var include = async function(n, print) {
    var data = await html(n)
    print(data[0])
}

var link = async function(n) {
    var data = await html(n)
    clear_body()
    document.write(data[0])
}
