var express = require('express');
var app = express();
var app2 = express();
var http = require('http');
var http2 = require('http').createServer(app2);
var url = require('url');
var fs = require('fs');
const socketIo = require("socket.io");
var cors = require('cors')
var path = require('path');
var public = path.join(__dirname, 'public');
var upload = require("express-fileupload");
var Datastore = require('nedb')
const db = new Datastore({ filename: 'C:/SMV_venue_client/schedules.db', autoload: true });
const log = require('error-log-file')
var mac = '00:00:00:00:00:00';

app.use(cors())
app.use(upload())

app.use('/admin', express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.get('/', function (req, res) {
    res.send('Server UP!')
})
app.get('/admin/config', function (req, res) {
    res.sendFile(path.join(public, '/config/config.html'));
});
app.get('/admin/schedule', function (req, res) {
    res.sendFile(path.join(public, '/schedule/schedule.html'));
});

app.get('/admin/screen_off.php', function (req, res) {
    off();
    res.send('off')
})

app.get('/admin/reboot.php', function (req, res) {
    res.send('restart')
    restart();
})

app.get('/admin/filedata', function (req, res) {
    fs.readFile('config.xml', "utf8", function read(err, data) {
        if (err) throw err;
        if (data == '') {
            res.send('empty');
        }
        else {
            res.send(JSON.parse(data))
        }
    });
})

app.get('/admin/signage', function (req, res) {
    openlink();
})

app.get('/admin/download/success_log', function (req, res) {
    var date = new Date();
    const file = `${public}/log/` + date.getFullYear() + `_success_log.txt`;
    res.download(file); // Set disposition and send it.
});

app.get('/admin/download/error_log', function (req, res) {
    var date = new Date();
    const file = `${public}/log/` + date.getFullYear() + `_error_log.txt`;
    res.download(file); // Set disposition and send it.
});

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('socket connected')
    //server check
    var intervalServer = setInterval(function () {
        fs.readFile('config.xml', "utf8", function read(err, data) {
            if (err) throw err;
            if (data == '') {
                //console.log("empty")
                var emitdata = {
                    isreacheable: 'empty',
                    IP: ''
                }
                socket.emit("isreacheble", emitdata)
            }
            else {
                var jsonData = JSON.parse(data);
                if (jsonData.serIP == '') {
                    //console.log("empty")
                    var emitdata = {
                        isreacheable: 'empty',
                        IP: ''
                    }
                    socket.emit("isreacheble", emitdata)
                } else {
                    const isReachable = require('is-reachable');

                    (async () => {

                        if (await isReachable(jsonData.serIP)) {
                            var emitdata = {
                                isreacheable: 'Reachable',
                                IP: jsonData.serIP
                            }
                            socket.emit("isreacheble", emitdata)
                        } else {
                            var emitdata = {
                                isreacheable: 'Unreachable',
                                IP: jsonData.serIP
                            }
                            socket.emit("isreacheble", emitdata)
                        }
                    })();
                }
            }
        });
    }, 11000);
    //server check

    var intervalServer = setInterval(function () {

    }, 11000);
    socket.on("disconnect", function () {
        console.log("socket disconnected");
        //clearInterval(intervalNetwork);
        clearInterval(intervalServer);
    });
})

app.post('/upload', function (req, res) {
    if (req.files) {
        console.log(req.files.filename); // the uploaded file object

        var file = req.files.filename,
            fn = file.name;
        if (fn == 'SMV_venue_client.zip') {
            file.mv("./upload/" + fn, function (err) {
                if (err) {
                    console.log(err)
                    res.end("upload file error occured")
                }
                else {
                    //res.end("Success upload")
                    res.sendFile(path.join(public, '/uploadSuc/upload.html'));
                }
            });
        }
        else {
            res.end("Incorrect file for update. Correct example : SMV_venue_client.zip")
        }

    }
});

var child_process = require('child_process');

app.post('/overritePatchfile', function (req, res) {
    var child_process = require('child_process');

    child_process.exec('C:/SMV_venue_client_update.bat ', function (error, stdout, stderr) {
        console.log(stdout);
        console.log(error);
        console.log(stderr)
    });
});

app.post('/writefile', (request, response) => {
    console.log(request.body)
    //wf(request.body);

    fs.writeFile("config.xml", JSON.stringify(request.body), function (err) {
        if (err) {
            response.json({
                msg: 0
            });
            response.end();
            return console.log(err);
        } else {
            console.log("The file was saved!");
            response.json({
                msg: 1
            });
            response.end();
        }
    });

})

app.post('/off', (request, response) => {
    off();
})

app.post('/restart', (request, response) => {
    restart();
})

app.post('/fetchdata', (request, response) => {
    fs.readFile('config.xml', "utf8", function read(err, data) {
        if (err) throw err;
        if (data == '') {
            //console.log("empty")
            var nodata = {
                empty: 'empty'
            }
            response.json(nodata);
            response.end();
        }
        else {
            response.json(JSON.parse(data));
            response.end();
        }
        console.log(data)
    });
})

app.post('/setschedule', (request, response) => {
    const cron = require('node-cron')
    cron.schedule("* * * * *", () => {
        console.log("logs every minute");
    })
})

app.post('/writeschedule', (request, response) => {
    // var Datastore = require('nedb'), db = new Datastore({ filename: 'C:/SMV_venue_client/schedules.db', autoload: true });

    console.log(request.body)
    db.insert(request.body, function (err, newDoc) {   // Callback is optional
        console.log(err)
        console.log(newDoc)
        if (err) {
            response.json({
                msg: 0
            });
            response.end();
            return console.log(err);
        } else {
            if (request.body.cat == 'dsr' || request.body.cat == 'dss') {
                setcron(request.body.cat, request.body.Hcron, request.body.Mcron, request.body.Daycron)
            } else {
                setCustomcron(request.body.cat, request.body.Daycron)
            }
            console.log("The shcedule was saved!");
            response.json({
                msg: 1
            });
            response.end();
        }
    });

})

app.post('/readschedule', (request, response) => {
    console.log(request.body)
    // var Datastore = require('nedb'), db = new Datastore({ filename: 'C:/SMV_venue_client/schedules.db', autoload: true });
    db.find({ cat: request.body.cat }, { schtime: 1 }, function (err, docs) {
        console.log(docs)
        response.json(docs);
        response.end();
    });
})

app.post('/deleteschedule', (request, response) => {
    console.log('delete: ID :' + request.body._id)
    // var Datastore = require('nedb'), db = new Datastore({ filename: 'C:/SMV_venue_client/schedules.db', autoload: true });
    db.remove({ _id: request.body._id }, {}, function (err, numRemoved) {
        if (err) { response.json({ msg: err }); response.end(); }
        else {
            response.json({ msg: numRemoved });
            response.end();
        }
    });
})

app.post('/login', (request, response) => {
    // console.log(request.body)//@dmin888
    if (request.body.id == "admin" && request.body.pw == "@dmin888") {
        response.json({
            res: true
        });
        response.end();
    }
    else {
        response.json({
            res: false
        });
        response.end();
    }
})

app.post('/network', (request, response) => {
    var network = require('network');
    network.get_interfaces_list(function (err, list) {

        //console.log(list)
        response.json(list)
        response.end();
    })
})

app.post('/isreacheble', (request, response) => {
    fs.readFile('config.xml', "utf8", function read(err, data) {
        if (err) throw err;
        if (data == '') {
            //console.log("empty")
            var nodata = {
                empty: 'empty'
            }
            response.json(nodata);
            response.end();
        }
        else {
            const isReachable = require('is-reachable');

            (async () => {
                if (await isReachable(data.serIP)) {
                    var data = {
                        isreacheable: 'reachable'
                    }
                    response.json(data);
                    response.end();
                } else {
                    var data = {
                        isreacheable: 'unreachable'
                    }
                    response.json(data);
                    response.end();
                }
            })();
        }
    });
})

app.post('/autorestart', (request, response) => {
    setTimeout(function () { restart(); }, 600000);
})

app.post('/getServerSchedule', (request, response) => {
    //mac = '00:0E:C6:DC:52:23'
    const options = {
        hostname: '119.73.206.46',
        port: 7890,
        path: '/Management/Device/Fetch?mac_address=' + mac,
        method: 'GET'
    }
    const req = http.request(options, (res) => {

        req.on('error', (error) => {
            console.error(error)
        })

        res.on('data', (d) => {
            try {
                const jsondata = JSON.parse(d);
                // console.log(jsondata.data.list[0].screen_off)
                // console.log(jsondata.data.list[0].screen_on)
                response.json({ on: jsondata.data.list[0].screen_on, off: jsondata.data.list[0].screen_off, mac: mac });
                response.end();
            } catch (e) {
                errlog('getServerSchedule :' + e)
                // console.log(e)
            }
        })
    })

    req.end()
})

function off() {
    scclog('off() :Display off successfully')
    //require('child_process').spawn('cmd.exe', ['/C', "powershell (Add-Type '[DllImport(\"user32.dll\")]^public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -Pas)::SendMessage(-1,0x0112,0xF170,2)"]);
    var spawn = require('child_process').spawn,
        ls = spawn('cmd.exe', ['/C', "powershell (Add-Type '[DllImport(\"user32.dll\")]^public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -Pas)::SendMessage(-1,0x0112,0xF170,2)"]);

    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    ls.on('exit', function (code) {
        console.log('child process exited with code ' + code);
    });

}

function on() {
    var spawn = require('child_process').spawn,
        ls = spawn('cmd.exe', ['/C', "powershell (Add-Type '[DllImport(\"user32.dll\")]^public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -Pas)::SendMessage(-1,0x0112,0xF170,-1)"]);

    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    ls.on('exit', function (code) {
        console.log('child process exited with code ' + code);
    });

    var spawn = require('child_process').spawn,
        ls = spawn('cmd.exe', ['/C', "rundll32 user32.dll,SetCursorPos"]);

    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    ls.on('exit', function (code) {
        console.log('child process exited with code ' + code);
    });

}

function restart() {
    scclog('restart() :Reboot successfully')
    var spawn = require('child_process').spawn,
        ls = spawn('cmd.exe', ['/C', "shutdown /r /f /t 0"]);

    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    ls.on('exit', function (code) {
        console.log('child process exited with code ' + code);
    });
}

function servercheck() {

    //   var cnt =0;
    var hdnisrestart = 0;
    var intervalNetwork = setInterval(function () {
        var network = require('network');
        network.get_interfaces_list(function (err, list) {
            //console.log(list)
            // console.log(cnt++)
            var isWifiDC = 0;
            var isLanDC = 0;
            Object.keys(list).forEach(function (key) {
                if (list[key].name == 'Wi-Fi') {
                    if (list[key].ip_address == null) { isWifiDC = 1 };
                }
                if (list[key].name.startsWith('Ethe')) {
                    if (list[key].ip_address == null) { isLanDC = 1 };

                    mac = list[key].mac_address

                }
            })
            // console.log('isLanDC :' + isLanDC)
            // console.log('isWifiDC :' + isWifiDC)
            // console.log('hdnisrestart.value :' + hdnisrestart)
            if (isWifiDC == 1 && isLanDC == 1 && hdnisrestart == 0) {
                // console.log('autorestart')
                hdnisrestart = 1;
                const open = require('open');
                (async () => {
                    // Opens the url in the default browser
                    await open('http://localhost/admin/');
                })();
                setTimeout(function () { restart(); }, 600000);
            }
        })
    }, 11000);


}

function openlink() {
    const open = require('open');
    const sendkeys = require('sendkeys-js')
    var seturl = '';
    fs.readFile('config.xml', "utf8", function read(err, data) {
        if (err) throw err;
        //console.log(JSON.parse(data))
        var jsondata;
        if (data != '') {
            jsondata = JSON.parse(data);
            if (jsondata.isdefault == '1') {
                if (jsondata.serIP != '') { seturl = jsondata.serIP }
                else { seturl = 'http://localhost/admin' }
            } else {
                if (jsondata.serIPcus != '') { seturl = jsondata.serIPcus }
                else { seturl = 'http://localhost/admin' }
            }
        } else { seturl = 'http://localhost/admin' }


        (async () => {//http://119.73.206.46:7890/Web/displaySignage.html#/init/b8aeed78f1cb
            await open(seturl);
            // for win
            if (seturl == 'http://localhost/admin') { } else { sendkeys.send('{f11}') }
        })();
    });
}

function setcron(cat, Hcron, Mcron, Daycron) {
    const cron = require('node-cron')
    var setcronstr = Mcron + ' ' + Hcron + ' * ' + ' * ' + Daycron;
    console.log('cat :' + cat)
    console.log(setcronstr)
    var valid = cron.validate(setcronstr);
    console.log('valid : ' + valid)
    if (cat == 'dsr') {
        console.log('display off schedule')
        cron.schedule(setcronstr, () => {
            off();
        })
    }
    if (cat == 'dss') {
        console.log('restart schedule')
        cron.schedule(setcronstr, () => {
            restart();
        })
    }


}

function setCustomcron(cat, Daycron) {
    var schedule = require('node-schedule');
    var date = new Date(Daycron);
    console.log('cat :' + cat)
    console.log(date)
    if (cat == 'csr') {
        console.log('custom display off schedule')
        schedule.scheduleJob(date, function () {
            off();
        });
    }
    if (cat == 'css') {
        console.log('custom restart schedule')
        schedule.scheduleJob(date, function () {
            // console.log('restartING')
            restart();
        });
    }

}

function server_start_cron() {
    fs.readFile('config.xml', "utf8", function read(err, data) {
        if (err) throw err;
        try {
            var jsondata = JSON.parse(data);
            // console.log(jsondata.isSchdefault)
            if (jsondata.isSchdefault == '0') {
                const cron = require('node-cron')
                var schedule = require('node-schedule');
                // var Datastore = require('nedb'), db = new Datastore({ filename: 'C:/SMV_venue_client/schedules.db', autoload: true });
                db.find({ cat: 'dsr' }, { Hcron: 1, Mcron: 1, Daycron: 1 }, function (err, docs) {
                    console.log(docs)
                    Object.keys(docs).forEach(function (key) {
                        var setcronstr = docs[key].Mcron + ' ' + docs[key].Hcron + ' * ' + ' * ' + docs[key].Daycron;
                        console.log(setcronstr)
                        var valid = cron.validate(setcronstr);
                        console.log('valid set : ' + docs[key]._id)
                        cron.schedule(setcronstr, () => {
                            off();
                        })
                    });
                });

                db.find({ cat: 'dss' }, { Hcron: 1, Mcron: 1, Daycron: 1 }, function (err, docs) {
                    console.log(docs)
                    Object.keys(docs).forEach(function (key) {
                        var setcronstr = docs[key].Mcron + ' ' + docs[key].Hcron + ' * ' + ' * ' + docs[key].Daycron;
                        console.log(setcronstr)
                        var valid = cron.validate(setcronstr);
                        console.log('valid set : ' + docs[key]._id)
                        cron.schedule(setcronstr, () => {
                            restart();
                        })
                    });
                });

                db.find({ cat: 'csr' }, { Daycron: 1 }, function (err, docs) {
                    console.log(docs)
                    Object.keys(docs).forEach(function (key) {
                        var date = new Date(docs[key].Daycron);
                        console.log('valid set cust :' + date)
                        schedule.scheduleJob(date, function () {
                            off();
                        });
                    });
                });


                db.find({ cat: 'css' }, { Daycron: 1 }, function (err, docs) {
                    console.log(docs)
                    Object.keys(docs).forEach(function (key) {
                        var date = new Date(docs[key].Daycron);
                        console.log('valid set cust :' + date)
                        schedule.scheduleJob(date, function () {
                            // console.log('restartING')
                            restart();
                        });
                    });
                });
            }

        } catch (e) {
            errlog('server_start_cron :' + e)
            // console.log(e)
        }
    });
}
async function errlog(msg) {
    var date = new Date();
    var fileN = date.getFullYear() + '_error_log.txt';
    await log(msg, { fileName: fileN })
}
async function scclog(msg) {
    var date = new Date();
    var fileN = date.getFullYear() + '_success_log.txt';
    await log(msg, { fileName: fileN })
}

function CheckserverSchedule() {
    // var intervalServerSchedule = setInterval(function () {
    //mac = '00:0E:C6:DC:52:23'
    setTimeout(function () {
        console.log(mac)
        const options = {
            hostname: '119.73.206.46',
            port: 7890,
            path: '/Management/Device/Fetch?mac_address=' + mac,
            method: 'GET'
        }
        const req = http.get(options, (res) => {

            

            res.on('data', (d) => {
                try {
                    const jsondata = JSON.parse(d);
                    // console.log(jsondata.data.list[0].screen_off)
                    // console.log(jsondata.data.list[0].screen_on)
                    var dtcurrent = new Date()
                    var dtoff = new Date(jsondata.data.list[0].screen_off);
                    var dton = new Date(jsondata.data.list[0].screen_on);
                    var valid = (dtcurrent > dtoff)
                    var valid1 = (dtcurrent < dton);
                    if (valid && valid1) { off() }
                } catch (e) {
                    errlog('CheckserverSchedule :' + e)
                    // console.log(e)
                }
            })
        })
		
		req.on('error', (error) => {
                console.error(error)
        })

        req.end()
    }, 30000);
    // }, 12000);
}

function serverDellastYearSccLog() {
    var del = require('delete');
    var date = new Date();
    var fileN = date.getFullYear() - 1 + '_success_log.txt';
    var path = 'public/log/' + fileN
    // console.log(fileN)
    // async
    del([path], function (err, deleted) {
        if (err) throw err;
        // deleted files
        console.log(deleted);
    });

    var fileE = date.getFullYear() + '_error_log.txt'
    var pathE = './public/log/' + fileE;

    fs.access(pathE, fs.F_OK, (err) => {
        if (err) {
            console.log('create errlog');
            errlog('')
            return;
        }
        // console.log('exist')
        // file exists
    });


}

server.listen(80, function () {
    scclog('server.listen :Server has started successfully')
    servercheck();
    server_start_cron();
    serverDellastYearSccLog();
    CheckserverSchedule();
    //openlink();
});

var last_update = new Date();

app2.all('/heartbeat', function (req, res) {
        
	
	if(mac) {
		const options = {
			hostname: '119.73.206.46',
			port: 7890,
			path: '/InterfaceAPI/STB/Heartbeat?mac_address=' + mac,
			method: 'GET'
		}
		
		const req = http.get(options, (res) => {

			

			res.on('data', (d) => {
				try {
					console.log(JSON.parse(d));
					
					last_update = new Date();
					console.log("Last update", last_update);
					
					response.end();
				} catch (e) {
					// console.log(e)
				}
			})
		})
		
		req.on('error', (error) => {
				//console.error(error)
			})
		
		req.end();
	}
	
	res.json({"result": "ok"});
});

setInterval(function () {
	var now = new Date();
	var diffMs = now - last_update;
	var diffMins = ((diffMs % 86400000) % 3600000) / 60000; // minutes
	
	var data = fs.readFileSync('config.xml');
	
	try {
		data = JSON.parse(data);
	} catch (e) {}
	//console.log("mins", diffMins);

	// var chrome = null;
	// try {
		// chrome = execSync('pgrep chrome').toString();
  	// } catch(ex) {}

	if(data && data.isSerdefault && diffMins > 5) {
		// if(execSync("cat /var/www/config/auto_reboot").toString().trim() == "true" 
			// && chrome) 
			
			
		child_process.exec('shutdown -r');
	}
}, 60000);


http2.listen(30000, function () {
    console.log('Express server listening on port 30000');
});
