pmap.CookieStorage = function() {}

pmap.CookieStorage.prototype = new pmap.Storage

pmap.CookieStorage.prototype.get = function (table, name) {

    var results = Enumerable.from(JSON.parse($.cookie(table)))
                    .where(function(x) { return name == x.key })
                    .select(function(x) { return x.value })
                    .toArray()

    if (0 < results.length) {
        return results[0]
    } else {
        return null
    }

}

pmap.CookieStorage.prototype.set = function (table, name, value) {

    var results = JSON.parse($.cookie(table)) || {}

    if (null == value) {
        delete results[name]
    } else {
        results[name] = value
    }

    $.cookie(table, JSON.stringify(results))

}
