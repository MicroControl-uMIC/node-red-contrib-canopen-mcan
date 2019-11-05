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

var ao_socket;

var node;
//-----------------------------------------------------------------------------------------------------
// define variables here
//-----------------------------------------------------------------------------------------------------

module.exports = function(RED) {
	
    class MCAN4Ao
    {
		constructor(config) 
	    {
	        RED.nodes.createNode(this,config);
	       
	        //---------------------------------------------------------------------------------------------
	        // runs when flow is deployed
	        //---------------------------------------------------------------------------------------------
	        node = this;  
	        node.on('close', node.close);
	        node.on('input', node.input);
	        
	        node.nodeId 		= config.nodeId;
	        node.productCode 	= config.productCode;
	        node.canBus 		= config.canBus;
	        node.moduleChannel 	= config.moduleChannel;
	        node.sensorType 	= config.sensorType;
	
	        //create Buffer for rcv Data
	        var ao_data = new NodeData();
	        
	        //creat id String
			  var identification = new DeviceIdString(node.canBus, node.nodeId, node.moduleChannel, 
																	14, moduleProductCode , moduleRevisionNumber, moduledeviceType);
	        //add specific string
			var idString = identification.getIdString();
			idString = idString + "sensor-type: "    + node.sensorType	   + ";";
	        //open socket
	        ao_socket = new WsComet(node.canBus, node.nodeId, node.moduleChannel);       
	        
			var client = ao_socket.connect_ws();
	        
			client.onopen = function()
			{
				//send identification string upon socket connection
	    	    console.log(idString);
				client.send(idString);
			};
			
	    	client.onclose = function() 
	    	{
	    	    console.log('echo-protocol Client Closed');
	    	    node.status({fill:"red",shape:"dot",text: "[In "+ao_socket.getChannelUrl()+"] Not connected"});
	    	};
	    	
	        //gets executed when socket receives a message	
	    	client.onmessage = function (event) 
	    	{
	    			//console.log("msg received");
	
	    			ao_data.setBuffer(event.data, 32);
	       
	                //check Status Variable
	                if(ao_data.getValue(1) === NodeErrorEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+ao_socket.getChannelUrl()+"] OK"});	                	
	            	}
	                else if(ao_data.getValue(1) === NodeErrorEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+ao_socket.getChannelUrl()+"] Error"});                	
	            	}	                
	                else if(ao_data.getValue(1) === NodeErrorEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ao_socket.getChannelUrl()+"] Error"});
	            	}
	                else if(ao_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ao_socket.getChannelUrl()+"] Not connected"});
	            	}
	                else if(ao_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ao_socket.getChannelUrl()+"] Wrong Network"});
	            	}
	                else if(ao_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ao_socket.getChannelUrl()+"] Wrong Node-ID"});
	            	}
	                else if(ao_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ao_socket.getChannelUrl()+"] Wrong Channel"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_DEVICE_IDENTIFICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Wrong device identification"});
	            	}
	                
	    		};
	    }
		
        input(msg) 
        {
        	//create output data buffer 16bytes
        	var outData = new Int32Array(4);
        	outData[0] = msg.payload;
        	outData[1] = 0;
        	outData[2] = 0;
        	outData[3] = 0;
        	
        	client.send(outData);
        }
		
        //---------------------------------------------------------------------------------------------
        // runs when node is closed (before deploy, e.g. to tidy up)
        //---------------------------------------------------------------------------------------------
        close()
        {
        	ao_socket.disconnect_ws();
        	node.status({fill:"red",shape:"dot",text: "[In "+ao_socket.getChannelUrl()+"] Not connected"});
        }

    }
    
    RED.nodes.registerType("mcan-4ao", MCAN4Ao);
}