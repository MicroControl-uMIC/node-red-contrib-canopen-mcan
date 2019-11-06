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

var wsUrl = 'ws://localhost:44660/';

class WsComet{

    constructor(canCh, nodeId, modCh) 
    {

    	this.canCh = canCh;
    	this.nodeId = nodeId;
    	this.modCh = modCh;   	
    }

    getCanUrl()
    {
    	var canChId;
    	
    	if(this.canCh === "CAN 1")
    	{
    		canChId = "1";
    	}
    	else if(this.canCh === "CAN 2")
    	{
    		canChId = "2";
    	}
    	else
    	{
    		canChId = "0";
    	}
    	
    	return canChId;
    }

    getChannelUrl()
    {
    	var channelId;
    	
    	if(this.modCh === "1")
    	{
    		channelId = "1";
    	}
    	else if(this.modCh === "2")
    	{
    		channelId = "2";
    	}
    	else if(this.modCh === "3")
    	{
    		channelId = "3";
    	}
    	else if(this.modCh === "4")
    	{
    		channelId = "4";
    	}
    	else
    	{
    		channelId = "0";
    	}
    	
    	return channelId;
    }
    
    connect_ws()
    {
        //var canUrl = this.getCanUrl();
       // var chUrl = this.getChannelUrl();
    	
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
// export class, so other modules can create Calc objects
//------------------------------------------------------------------------------------------------------
module.exports = WsComet;