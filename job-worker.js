var stdio = require('stdio');
var sqlite3_queue = require("./sqlite3-queue");
var async = require("async");

var ops = stdio.getopt({
    'poll-period' : {
        key : 'p',
        args : 1,
        description : 'Poll Period in milliseconds'
    },
    'busy-wait' : {
        key : 'w',
        args : 1,
        description : 'SQLite busy wait time in milliseconds'
    },
    'db' : {
        key : 'd',
        args : 1,
        mandatory : true,
        description : 'DB File'
    }
});

if (!ops['busy-wait'])
    ops['busy-wait'] = 500;
if (!ops['poll-period'])
    ops['poll-period'] = 3000;

new sqlite3_queue.Queue({
    file : ops['db']
}, function(err, queue) {

    var doPop = function() {
        queue.nonLockingPop(function(err, item) {
            var waitTime = ops['poll-period'];
            if (err) {
                console.error("[ERROR] " + err);
                if (err.code == 'SQLITE_BUSY')
                    waitTime = ops['busy-wait'];

            }
            if (item) {
                console.log("[INFO] Got command: " + item);

                var exec = require('child_process').exec, child;
                async.series([ function(callback) {
                    child = exec(item, function(error, stdout, stderr) {
                        console.log('stdout: ' + stdout);
                        console.log('stderr: ' + stderr);
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                        callback();
                    });
                } ], function(err, results) {
                    setTimeout(doPop, waitTime);
                });
            } else
                setTimeout(doPop, waitTime);
        });
    }
    doPop();

});
