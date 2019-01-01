var ws = null;
var GLB = require('GLBConfig');
var WS = {
    ws: ws,
    obj: null,
};
var bInter = false;
var bError = false;
var creatWS = function (argument) {
    ws = null;
    ws = new WebSocket("ws://127.0.0.1:8080/websocket"); //本地
    // ws = new WebSocket("wss://" + GLB.ip + "/websocket"); //wx|ios
    // ws = new WebSocket("ws://47.107.178.120:8080/websocket"); //安卓ssl连不上
    WS.ws = ws;
    ws.onopen = function (event) {
     console.log("Send Text WS was opened.");
     if (bInter == false){
        window.setInterval(function (argument) {
             WS.sendMsg("");
         }, 30000);
        bInter = true;
     }
    };
    ws.onmessage = function (event) {
        var data = event.data;
        console.log("response text msg: " + data);
        if (WS.obj == null)
            return;
        var i1 = data.indexOf(":");
        if (i1 == -1)
            return;
        var cmd = data.substring(0, i1);
        var sResponse = data.substring(i1+1);
        WS.obj.onResponse(cmd, sResponse);
    };
    ws.onerror = function (event) {
     console.log("Send Text fired an error.");
     bError = true;
    };
    ws.onclose = function (event) {
     console.log("WebSocket instance closed.");
     if (bError == false)
        creatWS();
    };
}
WS.sendMsg = function (cmd, msg, obj) {
    if (cmd == null)
        return;
    if (ws.readyState === WebSocket.OPEN) {
        msg = msg || "";
        if (cmd == ""){
            ws.send(cmd);
            return;
        }
        var str = cmd + ":" + msg.toString();
        console.log("sendMsg = ", str);
        ws.send(str);
        if (obj != null){
            WS.obj = obj;
        }
    }
    else {
        console.log("WebSocket instance wasn't ready...");
    }
};
WS.getStrPBMineNum = function (tMineNum) {
    var str = "";
    var iL = tMineNum.length;
    var iCut = 52;
    for (var i = 0; i < iL; i++) {
        if (i%iCut == 0)
            str+="1";
        str += tMineNum[i].toString();
    };
    var iStart = 0;
    var sTemp = str.substring(iStart, iCut+1);
    var sNew = parseInt(sTemp, 2).toString(16);
    iStart = iCut+1;
    var iCount = Math.floor(iL/iCut);
    for (var i = 0; i < iCount; i++) {
        var iEnd = (iCut+1)*(i+2);
        sTemp = str.substring(iStart, iEnd);
        sNew += "." + parseInt(sTemp, 2).toString(16);
        iStart = iEnd;
    };
    return sNew;
};
WS.getTPBMineNum = function () {
    var t = [];
    var str = GLB.tPlaybackData[0];
    var agrs = str.split(".");
    var iL = agrs.length;
    // var iL = str.length;
    for (var i = 0; i < iL; i++) {
        var sTemp = parseInt(agrs[i], 16).toString(2).substring(1);
        for (var j = 0; j < sTemp.length; j++) {
            t.push(parseInt(sTemp[j]));
        };
        // t.push(parseInt(str[i]));
    };
    return t;
};
WS.getStrPBStepInfo = function (tPB) {
    if (tPB.length == 0) return "";
    var str = tPB[0];
    if (tPB.length > 1){
        for (var i = 1; i < tPB.length; i++) {
            str += "|" + tPB[i];
        };
    }
    return str;
};
WS.close = function (argument) {
    ws.close();
};
creatWS();
module.exports = WS;