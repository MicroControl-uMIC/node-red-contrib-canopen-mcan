/*jshint esversion: 6 */
'use strict';
//-----------------------------------------------------------------------------------------------------//
// for detailed information: https://nodered.org/docs/creating-nodes/node-js                           //
//-----------------------------------------------------------------------------------------------------//

//-----------------------------------------------------------------------------------------------------
// import packages using "require" here
//-----------------------------------------------------------------------------------------------------


const DeviceIdString  = require("./core/id_string");
const WsComet = require("./core/websocket_comet.js");
const NodeData  = require("./core/node_data.js");
const NodeErrorEnum	  = require("./core/node_error.js");

const moduledeviceType     = 197009;
const moduleProductCode    = 1286014;
const moduleRevisionNumber = 2;



//-----------------------------------------------------------------------------------------------------
// define variables here
//-----------------------------------------------------------------------------------------------------

module.exports = function(RED) {

    class MCANDo
    {
		constructor(config)
	    {
	        RED.nodes.createNode(this,config);

	        //---------------------------------------------------------------------------------------------
	        // runs when flow is deployed
	        //---------------------------------------------------------------------------------------------
	        const node = this;
	        node.on('close', node.close);
			node.on('input', node.input);

			//this is neccassary to store objects within node to access it in other functions
			const context = node.context();

	        const nodeId 		= config.nodeId;
	        const canBus 		= config.canBus;
	        const moduleChannel 	= config.moduleChannel;

	        //create Buffer for rcv Data
			var doData = new NodeData();

	        //creat id String
	        var identification = new DeviceIdString(canBus, nodeId, moduleChannel,
					14, moduleProductCode , moduleRevisionNumber, moduledeviceType);

	        //add specific string
	        var idString = identification.getIdString();
	        idString = idString + "port-direction: 1"+ ";" +
			"error-mode: 0"+ ";" +
			"error-value: 0"+ ";";

	        //open socket
	        const doSocket = new WsComet(canBus, nodeId, moduleChannel);

			const client = doSocket.connect_ws();

			//store the client in the context of node
			context.set('client', client);
			context.set('node', node);

			client.onopen = function()
			{
				//send identification string upon socket connection
	    	    console.log(idString);
				client.send(idString);
			};

	    	client.onclose = function()
	    	{
	    	    console.log('echo-protocol Client Closed');
                // fix this -> NO MORE getChannelUrl
	    	    //node.status({fill:"red",shape:"dot",text: "[Out "+doSocket.getChannelUrl()+"] Not connected"});
	    	};

	        //gets executed when socket receives a message
	    	client.onmessage = function (event)
	    	{
				doData.setBuffer(event.data, 32);

	                //check Status Variable
	                if(doData.getValue(1) === NodeErrorEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[Out "+moduleChannel+"] OK"});
	            	}
	                else if(doData.getValue(1) === NodeErrorEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[Out "+moduleChannel+"] Error"});
	            	}
	                else if(doData.getValue(1) === NodeErrorEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Error"});
	            	}
	                else if(doData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Not connected"});
	            	}
	                else if(doData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Wrong Network"});
	            	}
	                else if(doData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Wrong Node-ID"});
	            	}
	                else if(doData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Wrong Channel"});
	            	}
	                else if(doData.getValue(1) === NodeErrorEnum.eNODE_ERR_DEVICE_IDENTIFICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Wrong device identification"});
	            	}

	    		};
	    }

        input(msg)
        {
			var inpData = new NodeData();
			//neccassary to access context storage
			var context = this.context();

			var rcvData = msg.payload;
			//read context variable
			const client = context.get('client');

			inpData.setBuffer(4,32);

			if(rcvData === true)
			{
				inpData.addValue(0,1);
			}
			else
			{
				inpData.addValue(0,0);
			}
			inpData.addValue(1,0);

        	client.send(inpData.getBuffer());
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
			node.status({fill:"red",shape:"dot",text: "[Out "+this.moduleChannel+"] Not connected"});

        }

    }

    RED.nodes.registerType("mcan-dio out", MCANDo);
}
