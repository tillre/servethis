var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    cwd = process.cwd(),
    mimetypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp3': 'audio/mpeg'
    };

module.exports = function(options) {
  var port = options.port || 8080,
      dir = options.dir || process.cwd(),
      server = http.createServer(function(req, res) {
        if (req.method !== 'GET') {
          res.writeHead(400);
          res.end();
          return;
        }
        var file = path.join(dir, req.url),
            ext = path.extname(file),
            data, files,
            mimetype = mimetypes[ext.toLowerCase()] || 'text/plain';

        fs.exists(file, function(exists) {
          if (!exists) {
            console.log('404 file not found: ' + file);
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('404 - not found');
            return;
          }

          var s = fs.createReadStream(file);
          s.on('error', function() {
            // if it cannot be read, but exists, it should be a dir
            fs.readdir(file, function(err, files) {
              if (err) {
                console.log('500 file: ' + file);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('500 - error');
                return;
              }
              console.log('200 list dir: ' + file);
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.write('<html><body>');
              res.write('<h3>' + file + '</h3>');
              res.write('<ul>');
              files.forEach(function(f) {
                res.write('<li>' + f + '</li>');
              });
              res.write('</ul>');
              res.end('</body></html>');
              return;
            })
          });

          s.once('fd', function() {
            console.log('200 file: ' + file + ' with mimetype: ' + mimetype);
            res.writeHead(200);
          });

          s.pipe(res);
        });
      });

  server.listen(port);
  console.log('serving: ' + dir + ' on: localhost:' + port);
  return server;
};
