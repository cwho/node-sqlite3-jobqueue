'use strict';

var sqlite3 = require("sqlite3").verbose();
var async = require("async");

function Queue(params, callback) {
    this.parameters = {};
    if (params && typeof params == "object") {
        // copy parameters
        this.parameters.file = params.file;
    }

    var queue = this;
    try {
        this.db = new sqlite3.Database(this.parameters.file);
        this.db.run("CREATE TABLE IF NOT EXISTS queue (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT)", function(err) {
            if (callback) {
                callback(err, queue);
            } else if (err) {
                throw err;
            }
        });
    } catch (err) {
        if (callback) {
            callback(err, queue);
        } else if (err) {
            throw err;
        }
    }
}

Queue.prototype.close = function(callback) {
    this.db.close(function(err) {
        if (callback) {
            callback(err);
        } else if (err) {
            throw err;
        }
    });
};

Queue.prototype.push = function(data, callback) {
    this.db.run("INSERT INTO queue (item) VALUES (?)", data, function(err) {
        if (callback) {
            callback(err, data);
        } else if (err) {
            throw err;
        }
    });
};

Queue.prototype.nonLockingPop = function(callback) {
    var db = this.db;
    db.get("SELECT rowid as id, item FROM queue ORDER BY id LIMIT 1", function(err, row) {
        if (row) {
            db.run("DELETE FROM queue where rowid = ?", row.id, function(err) {
                if (!err) {
                    if (this.changes && this.changes > 0) {
                        callback(err, row.item);
                    } else {
                        err = new Error("A collision occurred with another pop");
                        err.code = "SQLITE_BUSY";
                        callback(err, null);
                    }
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });

};

Queue.prototype.lockingPop = function(callback) {
    var transaction_started = false;
    var item = null;
    var id = null;
    var db = this.db;
    async.series([ function(callbackF) {
        db.run("BEGIN EXCLUSIVE", function(err) {
            if (!err) {
                transaction_started = true;
            }
            callbackF(err);
        });
    }, function(callbackF) {
        db.get("SELECT rowid as id, item FROM queue ORDER BY id LIMIT 1", function(err, row) {
            if (row) {
                id = row.id;
                item = row.item;
            }
            callbackF(err);
        });
    }, function(callbackF) {
        if (id) {
            db.run("DELETE FROM queue WHERE rowid = ?", id, function(err) {
                callbackF(err);
            });
        } else {
            callbackF();
        }
    }, function(callbackF) {
        db.run("COMMIT", function(err) {
            callbackF(err);
        });
    }, ], function(err, results) {
        if (err && transaction_started) {
            db.run("ROLLBACK");
        }
        if (callback) {
            callback(err, item);
        } else if (err) {
            throw err;
        }
    });
};

module.exports.Queue = Queue;
