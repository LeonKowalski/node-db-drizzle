/* Escape & Query building tests */

require("./drizzle");

var assert = require("assert");
var drizzle = new Drizzle();

assert.equal("test", drizzle.escape("test"));
assert.equal("\\\"string\\\" test", drizzle.escape("\"string\" test"));
assert.equal("\\'string\\' test", drizzle.escape("\'string\' test"));
assert.equal("test \\\"string\\\"", drizzle.escape("test \"string\""));
assert.equal("test \\'string\\'", drizzle.escape("test \'string\'"));
assert.equal("test \\\"string\\\" middle", drizzle.escape("test \"string\" middle"));
assert.equal("test \\'string\\' middle", drizzle.escape("test \'string\' middle"));

drizzle.query("SELECT * FROM users", {
    start: function (query) {
        assert.equal("SELECT * FROM users", query);
        return false;
    }
}).execute();

assert.throws(
    function () {
        drizzle.query("SELECT * FROM users WHERE id = ?").execute();
    },
    /Wrong number of values/
);

assert.throws(
    function () {
        drizzle.query("SELECT * FROM users WHERE id = ?", {}).execute();
    },
    /Wrong number of values/
);

assert.throws(
    function () {
        drizzle.query("SELECT * FROM users WHERE id = ?", [], {}).execute();
    },
    /Wrong number of values/
);

drizzle.query("SELECT * FROM users WHERE id = ?", 
    [ 2 ],
    {
        start: function (query) {
            assert.equal("SELECT * FROM users WHERE id = 2", query);
            return false;
        }
    }
).execute();

drizzle.query("SELECT * FROM users WHERE id = ? AND created > ?", 
    [ 2, "2011-03-09 12:00:00" ],
    {
        start: function (query) {
            assert.equal("SELECT * FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
            return false;
        }
    }
).execute();

drizzle.query("SELECT * FROM users WHERE id = ? AND created > ?", 
    [ 2, new Date(2011, 2, 9, 12, 0, 0) ],
    {
        start: function (query) {
            assert.equal("SELECT * FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
            return false;
        }
    }
).execute();

drizzle.query("SELECT * FROM users WHERE id IN ?", 
    [ [1, 2] ],
    {
        start: function (query) {
            assert.equal("SELECT * FROM users WHERE id IN (1,2)", query);
            return false;
        }
    }
).execute();

drizzle.query("SELECT * FROM users WHERE role IN ?", 
    [ ["admin", "moderator"] ],
    {
        start: function (query) {
            assert.equal("SELECT * FROM users WHERE role IN ('admin','moderator')", query);
            return false;
        }
    }
).execute();

drizzle.query("SELECT * FROM users WHERE name IN ?", 
    [ ["John Doe", "Jane O'Hara"] ],
    {
        start: function (query) {
            assert.equal("SELECT * FROM users WHERE name IN ('John Doe','Jane O\\'Hara')", query);
            return false;
        }
    }
).execute();

drizzle.query("SELECT * FROM users WHERE name = ?", 
    [ "Jane O'Hara" ],
    {
        start: function (query) {
            assert.equal("SELECT * FROM users WHERE name = 'Jane O\\'Hara'", query);
            return false;
        }
    }
).execute();

var created = new Date();
drizzle.query("INSERT INTO users(username,name,age,created,approved) VALUES ?", 
    [ ["jane", "Jane O'Hara", 32, created, true] ],
    {
        start: function (query) {
            var sCreated = created.getFullYear() + "-";
            sCreated += (created.getMonth() < 9 ? "0" : "") + (created.getMonth() + 1) + "-";
            sCreated += (created.getDate() < 10 ? "0" : "") + created.getDate() + " ";
            sCreated += (created.getHours() < 10 ? "0" : "") + created.getHours() + ":";
            sCreated += (created.getMinutes() < 10 ? "0" : "") + created.getMinutes() + ":";
            sCreated += (created.getSeconds() < 10 ? "0" : "") + created.getSeconds();

            assert.equal("INSERT INTO users(username,name,age,created,approved) VALUES ('jane','Jane O\\'Hara',32,'" + sCreated + "',1)", query);
            return false;
        }
    }
).execute();

drizzle.query("INSERT INTO users(username,name,age,created,approved) VALUES ?", 
    [
        [ "john", "John Doe", 32, new Date(1978,6,13,18,30,0), true ],
    ],
    {
        start: function (query) {
            assert.equal("INSERT INTO users(username,name,age,created,approved) VALUES ('john','John Doe',32,'1978-07-13 18:30:00',1)", query);
            return false;
        }
    }
).execute();

drizzle.query("INSERT INTO users(username,name,age,created,approved) VALUES ?", 
    [ [
        [ "john", "John Doe", 32, new Date(1978,6,13,18,30,0), true ],
    ] ],
    {
        start: function (query) {
            assert.equal("INSERT INTO users(username,name,age,created,approved) VALUES ('john','John Doe',32,'1978-07-13 18:30:00',1)", query);
            return false;
        }
    }
).execute();

drizzle.query("INSERT INTO users(username,name,age,created,approved) VALUES ?", 
    [ [
        [ "john", "John Doe", 32, new Date(1978,6,13,18,30,0), true ],
        [ "jane", "Jane O'Hara", 29, new Date(1980,8,18,20,15,0), false ],
        [ "mark", "Mark Doe", 28, new Date(1981,5,15,16,02,30), true ]
    ] ],
    {
        start: function (query) {
            assert.equal("INSERT INTO users(username,name,age,created,approved) VALUES " +
                "('john','John Doe',32,'1978-07-13 18:30:00',1)," +
                "('jane','Jane O\\'Hara',29,'1980-09-18 20:15:00',0)," +
                "('mark','Mark Doe',28,'1981-06-15 16:02:30',1)"
            , query);
            return false;
        }
    }
).execute();

drizzle.query("SELECT *, 'Use ? mark' FROM users WHERE id = ? AND created > ?", 
    [ 2, "2011-03-09 12:00:00" ],
    {
        start: function (query) {
            assert.equal("SELECT *, 'Use ? mark' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
            return false;
        }
    }
).execute();

drizzle.query("SELECT *, 'Use ? mark', ? FROM users WHERE id = ? AND created > ?", 
    [ "Escape 'quotes' for safety", 2, "2011-03-09 12:00:00" ],
    {
        start: function (query) {
            assert.equal("SELECT *, 'Use ? mark', 'Escape \\'quotes\\' for safety' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
            return false;
        }
    }
).execute();

drizzle.query("SELECT *, 'Use ? mark', Unquoted\\?mark, ? FROM users WHERE id = ? AND created > ?", 
    [ "Escape 'quotes' for safety", 2, "2011-03-09 12:00:00" ],
    {
        start: function (query) {
            assert.equal("SELECT *, 'Use ? mark', Unquoted?mark, 'Escape \\'quotes\\' for safety' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
            return false;
        }
    }
).execute();

drizzle.query("\\?SELECT *, 'Use ? mark', Unquoted\\?mark, ? FROM users WHERE id = ? AND created > ?", 
    [ "Escape 'quotes' for safety", 2, "2011-03-09 12:00:00" ],
    {
        start: function (query) {
            assert.equal("?SELECT *, 'Use ? mark', Unquoted?mark, 'Escape \\'quotes\\' for safety' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
            return false;
        }
    }
).execute();

assert.throws(
    function () {
        drizzle.query().select();
    },
    /Argument .* is mandatory/
);

drizzle.query().select("*").execute({
    start: function(query) {
        assert.equal("SELECT *", query);
        return false;
    }
});

assert.throws(
    function () {
        drizzle.query().select({});
    },
    /Argument .* must be a valid string/
);

assert.throws(
    function () {
        drizzle.query().select([]);
    },
    /No fields .*/
);

assert.throws(
    function () {
        drizzle.query().select([1]);
    },
    /Incorrect value .*/
);

drizzle.query().select(["id", "user", {"number": 1}, {"date": new Date(1978,6,13,18,30,0)}]).execute({
    start: function(query) {
        assert.equal("SELECT `id`,`user`,1 AS `number`,'1978-07-13 18:30:00' AS `date`", query);
        return false;
    }
});

drizzle.query().select(["id", "user", {"number": 1, "date": new Date(1978,6,13,18,30,0)}]).execute({
    start: function(query) {
        assert.equal("SELECT `id`,`user`,1 AS `number`,'1978-07-13 18:30:00' AS `date`", query);
        return false;
    }
});

drizzle.query().select(["id", "user", {"string": "Hello 'world'"}]).execute({
    start: function(query) {
        assert.equal("SELECT `id`,`user`,'Hello \\'world\\'' AS `string`", query);
        return false;
    }
});
