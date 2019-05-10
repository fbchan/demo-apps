var express = require('express');
var app = express();

var os = require("os");
//os.hostname();

// view engine setup
app.set('views', 'views');
app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/feature', function (req, res) {
  // res.send('Hello World');
  res.sendfile('feature.html');
});

// serve static files from the `public` folder
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  
    remote_ip = req.connection.remoteAddress;
    if (remote_ip.substr(0, 7) == "::ffff:") {
      remote_ip = remote_ip.substr(7)
    }
    
    local_ip = req.connection.localAddress;
    if (local_ip.substr(0, 7) == "::ffff:") {
      local_ip = local_ip.substr(7)
    }
    
  res.render('index', {
    title: 'Apps Services Platform',
    hostname: 'HOSTNAME : ' + os.hostname(),
    host_header: 'HOST HEADER ==> ' + req.header('host'),
    user_agent: 'USER AGENT ==> ' + req.header('user-agent'),
    remote_address: 'REMOTE ADDRESS ==> ' + remote_ip + "  :  " + req.connection.remotePort,
    local_address: 'LOCAL ADDRESS ==> ' + local_ip + " : " + req.connection.localPort,
    x_forwarded_for: 'X-FORWARDED-FOR ==> ' +  req.headers['x-forwarded-for']

  });
  //console.log(req.headers);
});

const server = app.listen(8080, '0.0.0.0', () => {
  console.log(`Express running → SERVER ${server.address().address}, PORT ${server.address().port}`);
});
