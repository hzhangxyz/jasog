var storage = sessionStorage

var clear_data = async () => {
    storage.clear()
}

var get_data = async (n) => {
    if(storage.hasOwnProperty(n)){
        return storage.getItem(n)
    }else{
        var value = await (await fetch(n)).text()
        storage.setItem(n,value)
        return value
    }
}

var _html = async (n) => {
    var to_insert = await get_data(n)
    var config = JSON.parse(to_insert.match(/^\s*<!--([\s\S]*?)\s*-->/)[1])
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

var html = async (n) => {
    [doc, ans] = await _html(n)
    for(var i in ans){
        this[i] = ans[i]
    }
    document.write(doc)
    return [doc,ans]
}

var json = async (n,m = window) => {
    data = JSON.parse(await get_data(n))
    for(var i in data){
        m[i] = data[i]
    }
    return data
}
