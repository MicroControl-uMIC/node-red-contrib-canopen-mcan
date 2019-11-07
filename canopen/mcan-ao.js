/*jshint esversion: 6 */ 

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

const moduledeviceType     = 524692;
const moduleProductCode    = 1242003;
const moduleRevisionNumber = 0;

//-----------------------------------------------------------------------------------------------------
// define variables here
//-----------------------------------------------------------------------------------------------------

module.exports = function(RED) {
	
    class MCANAo
    {
		constructor(config) 
	    {
	        RED.nodes.createNode(this,config);
	       
	        //---------------------------------------------------------------------------------------------
	        // runs when flow is deployed
	        //---------------------------------------------------------------------------------------------
			const node = this;
	        const nodeId 		= config.nodeId;
	        const canBus 		= config.canBus;
	        const moduleChannel = config.moduleChannel;
			const sensorType 	= config.sensorType;			 
			node.on('close', node.close);
			node.on('input', node.input);
			 
			const aoSocket = new WsComet(canBus, nodeId, moduleChannel);
			//create Buffer for rcv Data
			var aoData = new NodeData();
			//creat id String
			var identification = new DeviceIdString(canBus, nodeId, moduleChannel, 
				14, moduleProductCode , moduleRevisionNumber, moduledeviceType);   
				        
	        //add specific string
			var idString = identification.getIdString();
			idString = idString + "sensor-type: "    + sensorType	   + ";";
	        //open socket
	              
	        
			var client = aoSocket.connect_ws();
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
	    	    node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Not connected"});
	    	};
	    	
	        //gets executed when socket receives a message	
	    	client.onmessage = function (event) 
	    	{
	    			//console.log("msg received");
	
	    			aoData.setBuffer(event.data, 32);
	       
	                //check Status Variable
	                if(aoData.getValue(1) === NodeErrorEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[Out "+moduleChannel+"] OK"});	                	
	            	}
	                else if(aoData.getValue(1) === NodeErrorEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[Out "+moduleChannel+"] Error"});                	
	            	}	                
	                else if(aoData.getValue(1) === NodeErrorEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Error"});
	            	}
	                else if(aoData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Not connected"});
	            	}
	                else if(aoData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Wrong Network"});
	            	}
	                else if(aoData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Wrong Node-ID"});
	            	}
	                else if(aoData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[Out "+moduleChannel+"] Wrong Channel"});
	            	}
	                else if(aoData.getValue(1) === NodeErrorEnum.eNODE_ERR_DEVICE_IDENTIFICATION)
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

			inpData.addValue(0,rcvData);

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
			node.status({fill:"red",shape:"dot",text: "[In "+this.moduleChannel+"] Not connected"});
        }

    }
    
    RED.nodes.registerType("mcan-ao", MCANAo);
}