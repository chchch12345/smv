
function DefaultSetMac(ethmac) {
    const iden = ethmac;
    const serIP = '';
    const serIPcus = '';
    const isSerdefault = '1';
    const isSchdefault = '1';
    const data = { iden: iden, serIP: serIP, serIPcus: serIPcus, isSerdefault: isSerdefault, isSchdefault: isSchdefault };
    console.log(data)

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    fetch('/writefile', options).then(function (response) {
        return response.json()
    })
        .then(function (data) {
            console.log('writefilemsg : ' + data.msg)
        })
    return true;
}

function autoRestart() {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    fetch('/autorestart', options);


    return true;
}

function Setdefault() {
    getday();
    getmonth();
    startTime();
    PressEnter();

    var isemptyfile = 0;
    var ethmac = '';
    var ident = '';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch('/fetchdata', options).then(function (response) {
        return response.json()
    })
        .then(function (data) {
            console.log(data)
            if (data.empty) {
                //console.log(data.empty)
                //console.log(isemptyfile)
                isemptyfile = 1;
            } else {

                ident = data.iden;
                document.getElementById('lblserurl').innerHTML = data.serIP;
            }
        })
    fetch('/network', options).then(function (response) {
        return response.json()
    })
        .then(function (data) {
            console.log(data)
            Object.keys(data).forEach(function (key) {
                console.log(key, data[key]);
                if (data[key].name == 'Wi-Fi') {
                    console.log(data[key].mac_address);
                    console.log(data[key].ip_address);
                    document.getElementById('lblwifimac').innerHTML = data[key].mac_address;
                    document.getElementById('lblwifiip').innerHTML = data[key].ip_address == null ? '0.0.0.0' : data[key].ip_address;
                    document.getElementById('lblwifistatus').innerHTML = data[key].ip_address == null ? 'Disconnected' : 'Connected';
                    if (data[key].ip_address == null) { document.getElementById('lblwifistatus').style.color = "red" }
                    else { document.getElementById('lblwifistatus').style.color = "green" }
                }
                if (data[key].name.startsWith('Ethe')) {
                    console.log(data[key].mac_address);
                    console.log(data[key].ip_address);
                    ethmac = data[key].mac_address;
                    document.getElementById('lblethmac').innerHTML = data[key].mac_address;
                    document.getElementById('lblethip').innerHTML = data[key].ip_address == null ? '0.0.0.0' : data[key].ip_address;
                    document.getElementById('lblethstatus').innerHTML = data[key].ip_address == null ? 'Disconnected' : 'Connected';
                    if (data[key].ip_address == null) { document.getElementById('lblethstatus').style.color = "red" }
                    else { document.getElementById('lblethstatus').style.color = "green" }

                    console.log(isemptyfile)
                    if (isemptyfile) {
                        DefaultSetMac(ethmac)
                        document.getElementById('lblidentity').innerHTML = ethmac;
                    } else {
                        document.getElementById('lblidentity').innerHTML = ident;
                    }
                }

            });
        })

    var socket = io();
    socket.on("autoupdate", function (data) {
        //console.log(data)
        var isWifiDC = 0;
        var isLanDC = 0;
        Object.keys(data).forEach(function (key) {
            if (data[key].name == 'Wi-Fi') {
                document.getElementById('lblwifimac').innerHTML = data[key].mac_address;
                document.getElementById('lblwifiip').innerHTML = data[key].ip_address == null ? '0.0.0.0' : data[key].ip_address;
                document.getElementById('lblwifistatus').innerHTML = data[key].ip_address == null ? 'Disconnected' : 'Connected';
                if (data[key].ip_address == null) { document.getElementById('lblwifistatus').style.color = "red" }
                else { document.getElementById('lblwifistatus').style.color = "green" }
                //countdown
                // if (data[key].ip_address == null) { isWifiDC = 1 };
            }
            if (data[key].name.startsWith('Ethe')) {
                ethmac = data[key].mac_address;
                document.getElementById('lblethmac').innerHTML = data[key].mac_address;
                document.getElementById('lblethip').innerHTML = data[key].ip_address == null ? '0.0.0.0' : data[key].ip_address;
                document.getElementById('lblethstatus').innerHTML = data[key].ip_address == null ? 'Disconnected' : 'Connected';
                if (data[key].ip_address == null) { document.getElementById('lblethstatus').style.color = "red" }
                else { document.getElementById('lblethstatus').style.color = "green" }
                //countdown
                // if (data[key].ip_address == null) { isLanDC = 1 };
            }
        })
        // if (isWifiDC == 1 && isLanDC == 1 && hdnisrestart.value == 0) {
        //     console.log('autorestart')
        //     hdnisrestart.value = 1;
        //     autoRestart();
        // }
    })

    socket.on("isreacheble", function (data) {
        if (data.isreacheable == 'empty') {
            document.getElementById('lblisreacheble').innerHTML = '';
            document.getElementById('lblserurl').innerHTML = '';
        } else {
            document.getElementById('lblisreacheble').innerHTML = data.isreacheable;
            document.getElementById('lblserurl').innerHTML = data.IP;
            if (data.isreacheable == 'Reachable') { document.getElementById('lblisreacheble').style.color = "green" }
            else { document.getElementById('lblisreacheble').style.color = "red" }
        }
        // console.log(data.isreacheable);

    })

    return true;
};

function login() {
    const idpost = txtid.value;
    const pwpost = txtpw.value;
    const data = { id: idpost, pw: pwpost };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    fetch('/login', options).then(function (response) {
        return response.json()
    })
        .then(function (data) {
            console.log(data.res)

            if (data.res == true) {
                window.location.href = location + 'config'
            }
            else {
                alert("Invalid Login !")
            }
        })


    return true;
}

function PressEnter() {
    var input = document.getElementById("txtpw");
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("btnlogin").click();
        }
    });
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('divtime').innerHTML =
        h + ":" + m;
    var t = setTimeout(startTime, 500);
}
function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10+ ":" + s
    return i;
}
function getday() {
    var d = new Date();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var n = weekday[d.getDay()];
    document.getElementById("divdayname").innerHTML = n;
}
function getmonth() {
    var month = new Array();
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "Apr";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "Aug";
    month[8] = "Sept";
    month[9] = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";

    var d = new Date();
    var n = month[d.getMonth()];
    var dd = d.getDate();
    document.getElementById("divmonth").innerHTML = n;
    document.getElementById("divday").innerHTML = dd;
}
