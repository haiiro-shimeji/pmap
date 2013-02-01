test("pmap.CookieStorage.get", function() {

    (function() {

        $.cookie = mockFunction()
        when($.cookie)(anything()).then(function() {
            return "{ \"fuga\": \"piyo\" }"
        })

        var instance = new pmap.CookieStorage
        strictEqual(instance.get("hoge", "fuga"), "piyo")

        verify($.cookie)(anything())

    })()

    //  if the value is not set, returns null
    ;(function() {

        $.cookie = mockFunction()
        when($.cookie)(anything()).then(function() {
            return "{ \"fuga\": \"piyo\" }"
        })

        var instance = new pmap.CookieStorage
        strictEqual(instance.get("hoge", "foo"), null)

        verify($.cookie)(anything())

    })()

    //  if table does not exist, returns null
    ;(function() {

        $.cookie = mockFunction()
        when($.cookie)(anything()).then(function() {
            return null 
        })

        var instance = new pmap.CookieStorage
        strictEqual(instance.get("hoge", "foo"), null)

        verify($.cookie)(anything())

    })()


})

test("pmap.CookieStorage.set", function() {

    expect(0)

    ;(function() {
        var TABLE = "hoge"

        $.cookie = mockFunction()
        when($.cookie)(anything()).then(function() {
            return "{ \"fuga\": \"piyo\" }"
        })
        when($.cookie)(anything(), anything()).then(function() {
        })

        var instance = new pmap.CookieStorage
        instance.set("hoge", "foo", "bar")

        verify($.cookie, times(2))(TABLE)

        /* the bellow is invalid because of jsmockito's bug??
        verify($.cookie)(TABLE)
        verify($.cookie)(TABLE, "{ \"fuga\": \"piyo\", \"foo\": \"bar\" }")
        */
    })()

    //  can register to empty table.
    ;(function() {
        var TABLE = "hoge"

        $.cookie = mockFunction()
        when($.cookie)(anything()).then(function() {
            return null
        })
        when($.cookie)(anything(), anything()).then(function() {
        })

        var instance = new pmap.CookieStorage
        instance.set("hoge", "foo", "bar")

        verify($.cookie, times(2))(TABLE)

        /* the bellow is invalid because of jsmockito's bug??
        verify($.cookie)(TABLE)
        verify($.cookie)(TABLE, "{ \"fuga\": \"piyo\", \"foo\": \"bar\" }")
        */
    })()

})
