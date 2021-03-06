
var backup = require('./includes/backup.js'),
  restore = require('./includes/restore.js'),
  debug = require('debug')('couchbackup'),
  fs = require('fs');

module.exports = {
  backupStream: function(writeStream, opts, callback) {
    return backup(opts.COUCH_URL, opts.COUCH_DATABASE, opts.COUCH_BUFFER_SIZE)
      .on("written", function(obj) {
        debug(" backed up docs: ", obj.total);
        writeStream.write(JSON.stringify(obj.data) + "\n");
      })
      .on("writecomplete", function(obj) {
        debug("Backup complete - written" + JSON.stringify(obj));
        callback(null,obj);
      });
    
  },
  restoreStream: function(readStream, opts, callback) {
    return restore(opts.COUCH_URL, opts.COUCH_DATABASE, opts.COUCH_BUFFER_SIZE, opts.COUCH_PARALLELISM, readStream)
      .on("written", function(obj) {
        debug(" written ", obj.total);
      })
      .on("writecomplete", function(obj) {
        debug("restore complete");
        callback(null, obj);
      });
  },
  backupFile:  function(filename, opts, callback) {
    return this.backupStream(fs.createWriteStream(filename), opts, callback);
  },
  restoreFile: function(filename, opts, callback) {
    return this.restoreStream(fs.createReadStream(filename), opts, callback);
  }
}