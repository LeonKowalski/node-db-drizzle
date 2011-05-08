# db-drizze: Drizzle database bindings for Node.js #

For detail information about this and other Node.js
database bindings visit the [Node DB homepage] [homepage].

## INSTALL ##

        $ npm install db-drizzle

## QUICK START ##

        require('db-drizzle');

        new Drizzle({
            hostname: 'localhost',
            user: 'root',
            password: 'password',
            database: 'node'
        }).on('ready', function() {
            this.query().select('*').from('users').execute(function(rows) {
                console.log(rows.length + ' ROWS');
            });
        }).connect();

## LICENSE ##

This module is released under the [MIT License] [license].

[homepage]: http://nodejsdb.org
[license]: http://www.opensource.org/licenses/mit-license.php
