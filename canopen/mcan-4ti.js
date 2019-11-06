/*jshint esversion: 6 */ 
'use strict';
//-----------------------------------------------------------------------------------------------------//
// for detailed information: https://nodered.org/docs/creating-nodes/node-js       
//-----------------------------------------------------------------------------------------------------//

//-----------------------------------------------------------------------------------------------------
// import packages using "require" here
//-----------------------------------------------------------------------------------------------------


const DeviceIdString  = require("./core/id_string");
const WsComet         = require("./core/websocket_comet.js");
const NodeData        = require("./core/node_data.js");
const NodeErrorEnum	  = require("./core/node_error.js");

const moduledeviceType     = 131476;
const moduleProductCode    = 1243005;
const moduleRevisionNumber = 1;




//-----------------------------------------------------------------------------------------------------
// define variables here
//-----------------------------------------------------------------------------------------------------

module.exports = function(RED) {
	
    class MCAN4Ti
    {
		constructor(config) 
	    {
	        RED.nodes.createNode(this,config);
	       
	       //---------------------------------------------------------------------------------------------
	       // runs when flow is deployed
	       //---------------------------------------------------------------------------------------------
	       const node = this;  
		   node.on('close', node.close);


           var canBus        = config.canBus;
           var nodeId        = config.nodeId;
		   var moduleChannel = config.moduleChannel;
		   
		   var sensorType    = config.sensorType;

	        //create Buffer for rcv Data
	        const ti_data = new NodeData();

	        //creat id String
			  var identification = new DeviceIdString(canBus, nodeId, moduleChannel, 
																	14, moduleProductCode , moduleRevisionNumber, moduledeviceType);
	        //add specific string
			  var idString = identification.getIdString();
			  idString = idString + "sensor-type: "    + sensorType + ";";
			
	        //open socket
	        const ti_socket = new WsComet(canBus, nodeId, moduleChannel);       
	        
			const client = ti_socket.connect_ws();
	        
			client.onopen = function()
			{
				//send identification string upon socket connection
				console.log(idString);
				client.send(idString);
			};
			
	    	client.onclose = function() 
	    	{
	    	    console.log('echo-protocol Client Closed');
	    	    node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Not connected"});
	    	};
	    	
	        //gets executed when socket receives a message	
	    	client.onmessage = function (event) 
	    	{
				console.log("RCV DATA on CH: " + moduleChannel + " and ws: " + client.url);
				
					ti_data.setBuffer(event.data, 32);

	                //check Status Variable
	                if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+moduleChannel+"] OK"});
	                	console.log("RCV DATA VALUE: " + ti_data.getValue(0));
	                	var scaledData = ti_data.getValue(0) / 10;
	                	var msgData = {payload: scaledData ,
										topic: "mcan4ti/" + moduleChannel};

						node.send(msgData);

	                	
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+moduleChannel+"] Error"});                	
	            	}	                
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Error"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Not connected"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Network"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Node-ID"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Channel"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_DEVICE_IDENTIFICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong device identification"});
	            	}
	                
	    		};
	    }

        //---------------------------------------------------------------------------------------------
        // runs when node is closed (before deploy, e.g. to tidy up)
        //---------------------------------------------------------------------------------------------
        close()
        {
			//var node = RED.nodes.this;
			var socket = new WsComet(this.canBus, this.nodeId, this.moduleChannel);  

			socket.disconnect_ws();
        //	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Not connected"});
		}

    }
    
    RED.nodes.registerType("mcan-4ti", MCAN4Ti);
}