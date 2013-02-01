pmap.Storage = function() {}

pmap.Storage.prototype = {

    /**
     *  get a value from the specified table.
     *  @throws Error when table is not exists.
     *  @returns a value registered in the table as the name.
     */
    get: function (table, name) {},

    /**
     *  set a value to the specified table.
     *  @throws Error when table is not exists.
     */
    set: function (table, name, value) {}

}
