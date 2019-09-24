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

class ws_comet{

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
    		canChId = "error";
    	}
    	
    	return canChId;
    }

    getChannelUrl()
    {
    	var channelId;
    	
    	if(this.modCh === "Kanal 1")
    	{
    		channelId = "1";
    	}
    	else if(this.modCh === "Kanal 2")
    	{
    		channelId = "2";
    	}
    	else if(this.modCh === "Kanal 3")
    	{
    		channelId = "3";
    	}
    	else if(this.modCh === "Kanal 4")
    	{
    		channelId = "4";
    	}
    	else
    	{
    		channelId = "error";
    	}
    	
    	return channelId;
    }
    
    connect_ws()
    {
        var canUrl = this.getCanUrl();
        var chUrl = this.getChannelUrl();
    	
    	var socketUrl = wsUrl + canUrl + "/" + this.nodeId + "/" + chUrl;
    	
    	client = new W3CWebSocket(socketUrl);
        
        return client;
    }
    
    disconnect_ws()
    {
        client.close();
    }

}

//------------------------------------------------------------------------------------------------------
// export class, so other modules can create Calc objects
//------------------------------------------------------------------------------------------------------
module.exports = ws_comet;