# db-drizzle: Drizzle database bindings for Node.js #

For detailed information about this and other Node.js
database bindings visit the [Node.js DB homepage] [homepage].

## INSTALL ##

    $ npm install db-drizzle

## QUICK START ##

    var drizzle = require('db-drizzle');
    new drizzle.Database({
        hostname: 'localhost',
        user: 'root',
        password: 'password',
        database: 'node'
    }).on('ready', function() {
        this.query().select('*').from('users').execute(function(error, rows) {
            if (error) {
                console.log('ERROR: ' + error);
                return;
            }
            console.log(rows.length + ' ROWS');
        });
    }).connect();

## LICENSE ##

This module is released under the [MIT License] [license].

[homepage]: http://nodejsdb.org
[license]: http://www.opensource.org/licenses/mit-license.php
