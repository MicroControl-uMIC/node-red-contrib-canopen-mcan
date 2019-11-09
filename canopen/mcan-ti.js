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

    class MCANTi
    {
		constructor(config)
	    {
	        RED.nodes.createNode(this,config);

	       //---------------------------------------------------------------------------------------------
	       // runs when flow is deployed
	       //---------------------------------------------------------------------------------------------
		   const node = this;
           const canBus        = config.canBus;
           const nodeId        = config.nodeId;
		   const moduleChannel = config.moduleChannel;
		   const sensorType    = config.sensorType;
		   node.on('close', node.close);
		   //this is neccassary to store objects within node to access it in other functions
		   const context = node.context();
		   context.set('node', node);
		   //open socket
		   const tiSocket = new WsComet(canBus, nodeId, moduleChannel);
		   //create Buffer for rcv Data
		   const tiData = new NodeData();
		   //creat id String
		   var identification = new DeviceIdString(canBus, nodeId, moduleChannel,
			14, moduleProductCode , moduleRevisionNumber, moduledeviceType);

	        //add specific string
			var idString = identification.getIdString();
			idString = idString + "sensor-type: "    + sensorType + ";";

			const client = tiSocket.connect_ws();

	        //store the client in the context of node
			context.set('client', client);

			client.onopen = function()
			{
				//send identification string upon socket connection
				console.log(idString);
				client.send(idString);
			};

	    	client.onclose = function()
	    	{
	    	    node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Not connected"});
	    	};

	        //gets executed when socket receives a message
	    	client.onmessage = function (event)
	    	{
				tiData.setBuffer(event.data, 32);

	                //check Status Variable
	                if(tiData.getValue(1) === NodeErrorEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+moduleChannel+"] OK"});
	                	let scaledData = tiData.getValue(0) / 10;
	                	const msgData = {payload: scaledData ,
										topic: "mcan4ti/" + moduleChannel};


						node.send(msgData);
	            	}
	                else if(tiData.getValue(1) === NodeErrorEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+moduleChannel+"] Error"});
	            	}
	                else if(tiData.getValue(1) === NodeErrorEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Error"});
	            	}
	                else if(tiData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Not connected"});
	            	}
	                else if(tiData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Network"});
	            	}
	                else if(tiData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Node-ID"});
	            	}
	                else if(tiData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Channel"});
	            	}
	                else if(tiData.getValue(1) === NodeErrorEnum.eNODE_ERR_DEVICE_IDENTIFICATION)
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
			//neccassary to access context storage
			var context = this.context();

			//read context variable
			const client = context.get('client');
			const node = context.get('node');

			client.close();
			node.status({fill:"red",shape:"dot",text: "[In "+this.moduleChannel+"] Not connected"});
		}

    }

    RED.nodes.registerType("mcan-ti", MCANTi);
}
