node-sqlite3-jobqueue
=====================

node-sqlite3-jobqueue is a nodejs utility for adding command line statements to a sqlite3 based queue, and worker processes for executing them

It was produced for personal and learning purposes (i.e. non-production use), but is shared here in the hopes that may be useful.


# Usage

Queue one or more command line tasks to be executed via:
```
node job-add.js --db /tmp/job.sqlite.db --cmd <command>
```
e.g.,
```
node job-add.js --db /tmp/job.sqlite.db --cmd "wget http://nodejs.org/api/all.html"
```


Then pull in one or more instances of the workers to carry out the tasks:
```
node job-worker.js --poll-period 3000 --busy-wait 500 --db /tmp/job.sqlite.db
```

`sqlite3-queue.js` contains the basic sqlite3 based queue.




# To Dos

* investigate if sqlite3 (or other nodejs sqlite libraries) allow setting of the lock timeout values to reduce chances of SQLITE_BUSY scenarios in heavy usages.
* add bulk job adding commands
* use `child_process#spawn` instead of `child_process#exec` and stream outputs for better task progress tracking.
* add proper test harness
* package for npm (yet another job/queue/worker package).


# License

node-sqlite3-jobqueue is available under the GPLv3.


# Dependencies

Developed with:
* [nodejs](http://nodejs.org/) v0.10
* [sqlite3](https://www.npmjs.org/package/sqlite3) 2.2.0
* [async](https://www.npmjs.org/package/async) 0.6.2
* [stdio](https://www.npmjs.org/package/stdio) 0.1.5

