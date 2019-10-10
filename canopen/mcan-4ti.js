/*jshint esversion: 6 */ 

//-----------------------------------------------------------------------------------------------------//
// for detailed information: https://nodered.org/docs/creating-nodes/node-js       
//-----------------------------------------------------------------------------------------------------//

//-----------------------------------------------------------------------------------------------------
// import packages using "require" here
//-----------------------------------------------------------------------------------------------------

const idString  = require("./core/id_string");
const webSocket = require("./core/websocket_comet.js");
const nodeData  = require("./core/node_data.js");

//------------------------------------------------------------------------------------------------------
//Required for version information of the module, this is only used in the first module
//
const path = require('path');
const fs   = require('fs');
const pkg  = require(path.join(__dirname, '..', 'package.json'));

const modProdCode = "12.43.005";

const modRevNr = "v2";

const deviceType = 131476;

const ErrEnum = 
{
	eNODE_ERR_NONE: 0,
	eNODE_ERR_SENSOR: -10,
	eNODE_ERR_COMMUNICATION: -20,
	eNODE_ERR_CONNECTION: -30
};
//-----------------------------------------------------------------------------------------------------
// define variables here
//-----------------------------------------------------------------------------------------------------

module.exports = function(RED) {
    //---------------------------------------------------------------------------------------------
    // Definition of class 'MCan4Ti'
    //
	class MCan4Ti {
    	constructor(config)
    	{
	        RED.nodes.createNode(this,config);
	       
	        //---------------------------------------------------------------------------------------------
	        // runs when flow is deployed
	        //---------------------------------------------------------------------------------------------
	        //init node variables
	        var node = this;  
            this.on('close', this.close);
	        
	        this.nodeId=config.nodeId;
	        this.artikelNr=config.artikelNr;
	        this.sensorType=config.sensorType;
	        this.canCh=config.canCh;
	        this.checkCh=config.checkCh;
	
	        //create Buffer for rcv Data
	        var ti_data = new node_data();
	        //init id String class
	        var identification = new id_string(this.canCh, this.nodeId, this.checkCh, 12, modProdCode , modRevNr, deviceType, this.sensorType);
	        	        
	        //create id string
	        var string = identification.makeIdString();
	        
	        //init node websocket class
	        var ti_socket = new ws_comet(this.canCh, this.nodeId, this.checkCh);       
	        //connect node websocket
			var client = ti_socket.connect_ws();

	        //function handler when socket receives a message
	    	client.onclose = function() 
	    	{
	    	    console.log('echo-protocol Client Closed');
	    	    //display node status below node
	    	    node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Not connected"});
	    	};
    	  	
	    	//gets executed when socket receives a message	
	    	client.onmessage = function (event) 
	    	{
    			console.log("msg received");

    			//copy received data into ArrayBuffer
                ti_data.setBuffer(event.data, 32);
       
                //check Status Variable
                if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_NONE)
            	{
                	//display node status below node
                	node.status({fill:"green",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] OK"});
                	
                	//scale data
                	var scaledData = (ti_data.getValue(0) * 0.1).toFixed(1);
                	var msgData = {payload: scaledData };
                	//send data to server
                	node.send(msgData);        	
            	}
                else if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_SENROR)
            	{
                	//display node status below node
                	node.status({fill:"yellow",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Error"});                	
            	}
                
                else if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_COMMUNICATION)
            	{
                	//display node status below node
                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Error"});
            	}
                else if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION)
            	{
                	//display node status below node
                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Not connected"});
            	}
                
    		};
    	}
        //---------------------------------------------------------------------------------------------
        // runs when node is closed (before deploy, e.g. to tidy up)
        //---------------------------------------------------------------------------------------------
        close() 
        {
        	ti_socket.disconnect_ws();
        }

    }
    RED.nodes.registerType("4ti",MCan4Ti);
};