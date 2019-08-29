var dsrbtn = { dsrbtn1: 0, dsrbtn2: 0, dsrbtn3: 0, dsrbtn4: 0, dsrbtn5: 0, dsrbtn6: 0, dsrbtn7: 0 };
var dssbtn = { dssbtn1: 0, dssbtn2: 0, dssbtn3: 0, dssbtn4: 0, dssbtn5: 0, dssbtn6: 0, dssbtn7: 0 };


function backConfig() {
    window.location.href = '../config';

    return true;
}

function logout() {

    window.location.href = '../';

    return true;
}

function Setdefault() {
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
            if (data.isSchdefault == 1) {
                document.body.className = 'freeze'
            }
        })

    fetch('/getServerSchedule', options).then(function (response) {
        return response.json()
    })
        .then(function (data) {
            var list = document.createElement('ul');
            var item = document.createElement('li');
            item.style.fontFamily = 'monospace';
            item.style.fontWeight = 'bold';
            item.style.padding = '5px';
            item.style.color = 'lightslategray';
            var item2 = document.createElement('li');
            item2.style.fontFamily = 'monospace';
            item2.style.fontWeight = 'bold';
            item2.style.padding = '5px';
            item2.style.color = 'lightslategray';
            // Set its contents:
            item.appendChild(document.createTextNode("Screen Off - " + data.off));
            list.appendChild(item);
            item2.appendChild(document.createTextNode("Screen On - " + data.on));
            list.appendChild(item2);

            document.getElementById('SPFSlist').appendChild(list);
            console.log(data)
        })


    document.getElementById('csrtxttime').value = new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0].substring(0, 16)
    document.getElementById('csstxttime').value = new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0].substring(0, 16)
    var dt = new Date();
    var m = dt.getMinutes();
    var h = dt.getHours();
    m = (m < 10) ? '0' + m : m;
    h = (h < 10) ? '0' + h : h;
    var dthm = h + ":" + m;
    document.getElementById("dsrtxttime").defaultValue = dthm;
    document.getElementById("dsstxttime").defaultValue = dthm;
    console.log("dthm : " + dthm);

    FooRead('dsr');
    FooRead('dss');
    FooRead('csr');
    FooRead('css');
}

function colorchange(id) {
    var background = document.getElementById(id).style.backgroundColor;
    if (background == "paleturquoise") {
        document.getElementById(id).style.background = "lightsteelblue";
        Object.keys(dsrbtn).forEach(function (key) { if (key == id) { dsrbtn[key] = 0 } });
    } else {
        document.getElementById(id).style.background = "paleturquoise";
        Object.keys(dsrbtn).forEach(function (key) { if (key == id) { dsrbtn[key] = 1 } });
    }
}


function colorchange2(id) {
    var background = document.getElementById(id).style.backgroundColor;
    if (background == "paleturquoise") {
        document.getElementById(id).style.background = "lightsteelblue";
        Object.keys(dssbtn).forEach(function (key) { if (key == id) { dssbtn[key] = 0 } });
    } else {
        document.getElementById(id).style.background = "paleturquoise";
        Object.keys(dssbtn).forEach(function (key) { if (key == id) { dssbtn[key] = 1 } });
    }
}

function Adddsr() {
    // console.log(processObj(dsrbtn, dsrtxttime.value));
    // console.log(dsrbtn)
    // console.log(dsrtxttime.value)
    // console.log('dsr' + Math.trunc(Math.random() * 10000))
    var h = dsrtxttime.value.split(':')[0];
    var m = dsrtxttime.value.split(':')[1];
    if (processObjValid(dsrbtn)) {
        FooSet('dsr' + Math.random() * 100000, 'dsr', processObj(dsrbtn, dsrtxttime.value), h, m, processObjCronDay(dsrbtn))
    } else {
        alert('Please select atleast a week.')
    }

}

function FooRead(CAT) {
    const cat = CAT;
    const data = { cat: cat };
    console.log(CAT)
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch('/readschedule', options)
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            console.log(data)
            if (CAT == 'dsr') {
                if (document.getElementById('DSRlist').children.length > 0) {
                    var myNode = document.getElementById("DSRlist");
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild);
                    }
                }
                document.getElementById('DSRlist').appendChild(makeUL(CAT, data));
            }
            if (CAT == 'dss') {
                if (document.getElementById('DSSlist').children.length > 0) {
                    var myNode = document.getElementById("DSSlist");
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild);
                    }
                }
                document.getElementById('DSSlist').appendChild(makeUL(CAT, data));
            }
            if (CAT == 'csr') {
                if (document.getElementById('CSRlist').children.length > 0) {
                    var myNode = document.getElementById("CSRlist");
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild);
                    }
                }
                document.getElementById('CSRlist').appendChild(makeUL(CAT, data));
            }
            if (CAT == 'css') {
                if (document.getElementById('CSSlist').children.length > 0) {
                    var myNode = document.getElementById("CSSlist");
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild);
                    }
                }
                document.getElementById('CSSlist').appendChild(makeUL(CAT, data));
            }
        })


    return true;
}

function FooSet(ID, CAT, DT, H, M, listDay) {
    const schID = ID;
    const schtime = DT;
    const cat = CAT;
    const Hcron = H;
    const Mcron = M;
    const Daycron = listDay;
    const data = { _id: schID, cat: cat, schtime: schtime, Hcron: Hcron, Mcron: Mcron, Daycron: Daycron };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch('/writeschedule', options).then(function (response) {
        return response.json()
    })
        .then(function (data) {
            console.log('writefilemsg : ' + data.msg)
            if (data.msg == 1) {
                FooRead(CAT);
                alert("The schedule was saved!")
            } else { alert("error!") }
        })


    return true;
}

function processObj(theobj, time) {
    var strsave = '';
    Object.keys(theobj).forEach(function (key) {
        if (key.substr(6) == '7' && theobj[key] == 1) { strsave += 'Su, ' }
        if (key.substr(6) == '1' && theobj[key] == 1) { strsave += 'Mo, ' }
        if (key.substr(6) == '2' && theobj[key] == 1) { strsave += 'Tu, ' }
        if (key.substr(6) == '3' && theobj[key] == 1) { strsave += 'We, ' }
        if (key.substr(6) == '4' && theobj[key] == 1) { strsave += 'Th, ' }
        if (key.substr(6) == '5' && theobj[key] == 1) { strsave += 'Fr, ' }
        if (key.substr(6) == '6' && theobj[key] == 1) { strsave += 'Sa, ' }
    });
    var h = time.split(':')[0];
    var m = time.split(':')[1];
    // var [h, m] = time.split(":");
    var timestr = (h % 12 + 12 * (h % 12 == 0)) + ":" + m
    timestr = h >= 12 ? timestr + ' PM' : timestr + ' AM';
    // console.log(time);
    // strsave = strsave.replace(/,\s*$/, "");
    strsave = strsave + timestr
    return strsave;
}

function processObjCronDay(theobj) {
    var strsave = '';
    Object.keys(theobj).forEach(function (key) {
        if (key.substr(6) == '7' && theobj[key] == 1) { strsave += 'Sun,' }
        if (key.substr(6) == '1' && theobj[key] == 1) { strsave += 'Mon,' }
        if (key.substr(6) == '2' && theobj[key] == 1) { strsave += 'Tue,' }
        if (key.substr(6) == '3' && theobj[key] == 1) { strsave += 'Wed,' }
        if (key.substr(6) == '4' && theobj[key] == 1) { strsave += 'Thu,' }
        if (key.substr(6) == '5' && theobj[key] == 1) { strsave += 'Fri,' }
        if (key.substr(6) == '6' && theobj[key] == 1) { strsave += 'Sat,' }
    });

    strsave = strsave.replace(/,\s*$/, "");
    return strsave;
}

function processObjValid(theobj) {
    var Validsave = false;
    Object.keys(theobj).forEach(function (key) {
        if (key.substr(6) == '7' && theobj[key] == 1) { Validsave = true }
        if (key.substr(6) == '1' && theobj[key] == 1) { Validsave = true }
        if (key.substr(6) == '2' && theobj[key] == 1) { Validsave = true }
        if (key.substr(6) == '3' && theobj[key] == 1) { Validsave = true }
        if (key.substr(6) == '4' && theobj[key] == 1) { Validsave = true }
        if (key.substr(6) == '5' && theobj[key] == 1) { Validsave = true }
        if (key.substr(6) == '6' && theobj[key] == 1) { Validsave = true }
    });
    return Validsave;
}

function makeUL(cat, array) {
    // Create the list element:
    var list = document.createElement('ul');

    Object.keys(array).forEach(function (key) {
        console.log(array[key].schtime)
        var button = document.createElement("button");
        button.innerHTML = 'X';
        button.setAttribute('style', 'color:red !important; font-weight:bold; box-shadow:none;background: transparent !important; margin-top:-3%;max-height:27px; float:right; ');
        button.onclick = function () {
            console.log(button.parentElement.lastChild.value)
            button.parentNode.parentNode.removeChild(button.parentNode);
            //button.parentElement.remove()
            FooDelete(cat, button.parentElement.lastChild.value)
            return;
        };
        var input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("value", array[key]._id);

        var item = document.createElement('li');
        item.style.fontFamily = 'monospace';
        item.style.fontWeight = 'bold';
        item.style.padding = '5px';
        item.style.color = 'lightslategray';
        // Set its contents:
        item.appendChild(document.createTextNode(array[key].schtime));
        item.appendChild(button);
        item.appendChild(input);

        // Add it to the list:
        list.appendChild(item);
    });
    return list;
}

function FooDelete(CAT, ID) {
    const schID = ID;
    const cat = CAT;
    const data = { _id: schID, cat: cat };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch('/deleteschedule', options).then(function (response) {
        return response.json()
    })
        .then(function (data) {
            console.log('writefilemsg : ' + data.msg)
            if (data.msg == 1) {
                //FooRead(CAT);
            } else { alert("error!") }
        })
    return true;
}


function Adddss() {
    // console.log(processObj(dssbtn, dsstxttime.value));
    // console.log(dssbtn)
    // console.log(dsstxttime.value)
    // console.log('dss' + Math.trunc(Math.random() * 10000))
    var h = dsstxttime.value.split(':')[0];
    var m = dsstxttime.value.split(':')[1];
    if (processObjValid(dssbtn)) {
        FooSet('dss' + Math.random() * 100000, 'dss', processObj(dssbtn, dsstxttime.value), h, m, processObjCronDay(dssbtn))
    } else {
        alert('Please select atleast a week.')
    }
}


function Addcsr() {
    // yyyy  m  d  hh mm
    console.log(csrtxttime.value)
    try {
        var datelo = csrtxttime.value.split('T')[0];
        var timelo = csrtxttime.value.split('T')[1];
        var y = datelo.split('-')[0];
        var mm = datelo.split('-')[1].replace(/^0+/, '');
        var d = datelo.split('-')[2].replace(/^0+/, '');

        var h = timelo.split(':')[0].replace(/^0+/, '');
        var m = timelo.split(':')[1].replace(/^0+/, '');
        if (y != null && mm != null && d != null && h != null && m != null) {
            var timestr = (h % 12 + 12 * (h % 12 == 0)) + ":" + m
            timestr = h >= 12 ? timestr + ' PM' : timestr + ' AM';
            // console.log(y +', '+mm+', '+ d+', '+ h+', '+m+' 0')
            // console.log(datelo + ', ' + timestr)
            var forcron = new Date(y, mm - 1, d, h, m, 0);
            // var dateB = new Date(forcron);
            // console.log(forcron)
            // console.log(dateB)
            var display = datelo + ', ' + timestr
            var forcron = new Date(y, mm - 1, d, h, m, 0);
            FooSet('csr' + Math.random() * 100000, 'csr', display, h, m, forcron)
        } else {
            alert('Please select a valid date and time.')
        }
    }
    catch (err) {
        alert('Please select a valid date and time.')
    }



}

function Addcss() {
    // yyyy  m  d  hh mm
    console.log(csstxttime.value)
    try {
        var datelo = csstxttime.value.split('T')[0];
        var timelo = csstxttime.value.split('T')[1];
        var y = datelo.split('-')[0];
        var mm = datelo.split('-')[1].replace(/^0+/, '');
        var d = datelo.split('-')[2].replace(/^0+/, '');

        var h = timelo.split(':')[0].replace(/^0+/, '');
        var m = timelo.split(':')[1].replace(/^0+/, '');
        if (y != null && mm != null && d != null && h != null && m != null) {
            var timestr = (h % 12 + 12 * (h % 12 == 0)) + ":" + m
            timestr = h >= 12 ? timestr + ' PM' : timestr + ' AM';

            var display = datelo + ', ' + timestr
            var forcron = new Date(y, mm - 1, d, h, m, 0);
            FooSet('css' + Math.random() * 100000, 'css', display, h, m, forcron)
        } else {
            alert('Please select a valid date and time.')
        }
    }
    catch (err) {
        alert('Please select a valid date and time.')
    }



}



