# CouchBackup

```
 _____                  _    ______            _                
/  __ \                | |   | ___ \          | |               
| /  \/ ___  _   _  ___| |__ | |_/ / __ _  ___| | ___   _ _ __  
| |    / _ \| | | |/ __| '_ \| ___ \/ _` |/ __| |/ / | | | '_ \ 
| \__/\ (_) | |_| | (__| | | | |_/ / (_| | (__|   <| |_| | |_) |
 \____/\___/ \__,_|\___|_| |_\____/ \__,_|\___|_|\_\\__,_| .__/ 
                                                         | |    
                                                         |_|    
```

CouchBackup is a command-line utility that allows a CouchDB database to be backed-up to a text file. 
It comes with a companion command-line utility that can restore the backed up data.

** N.B. couchbackup does not do CouchDB replication, it simply pages throught the /_all_docs endpoint. Conflicts, deletions and revision history are discarded. Only the winning revisions (without the _rev) survive. **

## Installation

To install use npm:

    npm install -g couchbackup

## Usage

Either environement variables or command-line options can be used to specify the URL of the CouchDB or Cloudant instance, and the database to work with.

### The URL

To define the URL of the CouchDB instance set the COUCH_URL environment variable:

    export COUCH_URL=http://localhost:5984

or

    export COUCH_URL=https://myusername:mypassword@myhost.cloudant.com

Alternatively we can use the `--url` command-line parameter.

### The Database name

To define the name of the database to backup or restore, set the COUCH_DATABASE environment variable:

    export COUCH_DATABASE=animals

Alternatively we can use the `--db` command-line parameter

## Backup

To backup a database to a text file, use the `couchbackup` command, directing the output to a text file:

    couchbackup > backup.txt

Another way of backing up is to set the COUCH_URL environment variable only and supply the database name on the command-line:

    couchbackup --db animals > animals.txt
  
## Restore

Now we have our backup text file, we can restore it to an existing database using the `couchrestore`:

    cat animals.txt | couchrestore

or specifying the database name on the command-line:

    cat animals.txt | couchrestore --db animalsdb


## Compressed backups

If we want to compress the backup data before storing to disk, we can pipe the contents through `gzip`:

    couchbackup --db animals | gzip > animals.txt.gz

and restore the file with:

    cat animals.tar.gz | gunzip | couchdbrestore --db animals2

## What's in a backup file?

A backup file is a text file where each line contains a JSON encoded array of up to 500 objects e.g.

    [{"a":1},{"a":2}...]
    [{"a":501},{"a":502}...]


## Why use CouchBackup?

The easiest way to backup a CouchDB database is to copy the ".couch" file. This is fine on a single-node instance, but when running multi-node 
Cloudant or using CouchDB 2.0 or greater, the ".couch" file only contains a single shard of data. This utility allows simple backups of CouchDB
or Cloudant database using the HTTP API.

It's worth remembering that the CouchBackup isn't recording the full MVCC history of each document, only
the winning revision if each document - any unresolved conflicts will be lost in the backup. This is intentional
and would allow you to transfer the winning revisions from a heavily conflicted database to a new 
location very easily.

## Options reference


### Environment variables

* COUCH_URL - the URL of the CouchDB/Cloudant server e.g. http://127.0.0.1:5984
* COUCH_DATABASE - the name of the database to act upon e.g. mydb (default 'test')
* COUCH_PARALLELISM - the number of HTTP requests to perform in parallel when restoring a backup e.g. 10 (Default 5)
* COUCH_BUFFER_SIZE - the number of documents fetched and restored at once e.g. 100 (default 500)

### Command-line paramters

* --url - same as COUCH_URL environment variable
* --db - same as COUCH_DATABASE 
* --parallelism - same as COUCH_PARALLELISM
* --buffer - same as COUCH_BUFFER_SIZE

## Using programmatically

You can now use `couchbackup` programatically. First install the `couchbackup` into your project 
with `npm install --save couchbackup`. Then you can import the library into your code:


```
  var couchbackup = require('couchbackup');
```

Define some options, using an object that contains attributes with the same names as the environment 
variables used to configure the command-line utilities:

```
var opts = {
  "COUCH_URL": "http://127.0.0.1:5984",
  "COUCH_DATABASE": "mydb",
}
```

The you can backup data to a stream:


```
couchbackup.backupStream(process.stdout, opts, function() {
  // done!
});
``

or to a file

```
couchbackup.backupFile("backup.txt", opts, function() {
  // done!
});
``

Similarly, you can restore from a stream:

```
couchbackup.restoreStream(process.stdin, opts, function() {
  // done!
});
```

The `couchbackup` functions emit events:

* written - when a group of documents is backuped up or restored
* writecomplete - emitted once when all documents are backed up or restored
* writeerror - emitted when something goes wrong


