var stdio = require('stdio');
var sqlite3_queue = require("./sqlite3-queue");

var ops = stdio.getopt({
    'db' : {
        key : 'd',
        args : 1,
        mandatory : true,
        description : 'DB File'
    },
    'cmd' : {
        key : 'c',
        args : 1,
        mandatory : true,
        description : 'Command to run'
    }
});

new sqlite3_queue.Queue({
    file : ops['db']
}, function(err, queue) {
    queue.push(ops['cmd'], function(err) {
        if (err)
            console.error(err);
    });
});