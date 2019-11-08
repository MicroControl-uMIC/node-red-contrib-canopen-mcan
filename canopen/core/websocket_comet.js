//websocket_comet.js
//------------------------------------------------------------------------------------------------------
// Use Strict Mode for JavaScript
//------------------------------------------------------------------------------------------------------
'use strict';

//------------------------------------------------------------------------------------------------------
// define class Calc
//------------------------------------------------------------------------------------------------------

var W3CWebSocket = require('websocket').w3cwebsocket;

var client;

const wsUrl = 'ws://localhost:44660/';

class WsComet{

    constructor(canCh, nodeId, modCh)
    {

        this.canCh = canCh;
        this.nodeId = nodeId;
        this.modCh = modCh;
    }


    connect_ws()
    {

        var socketUrl = wsUrl + this.canCh + "/" + this.nodeId + "/" + this.modCh;

        client = new W3CWebSocket(socketUrl);

        return client;
    }

    get_client()
    {
        return client;
    }

    disconnect_ws()
    {
        var socketUrl = wsUrl + this.canCh + "/" + this.nodeId + "/" + this.modCh;
        client.close(socketUrl);
    }

}

//------------------------------------------------------------------------------------------------------
// export class
//------------------------------------------------------------------------------------------------------
module.exports = WsComet;
