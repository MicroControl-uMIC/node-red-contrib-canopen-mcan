/*jshint esversion: 6 */ 

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
	       var node = this;  
           node.on('close', node.close);
		 //  var node;

         //  node.canBus        = config.canBus;
         //  node.nodeId        = config.nodeId;
         //  node.moduleChannel = config.moduleChannel;
         //  node.productCode   = config.productCode;	
		 //  node.sensorType    = config.sensorType;
		   var ti_socket;
           var canBus        = config.canBus;
           var nodeId        = config.nodeId;
           var moduleChannel = config.moduleChannel;
           var productCode   = config.productCode;	
		   var sensorType    = config.sensorType;

	        //create Buffer for rcv Data
	        var ti_data = new NodeData();
	        
	        //var errEnum = NodeError.NodeErrorEnum;
	        
	        //creat id String
			  var identification = new DeviceIdString(canBus, nodeId, moduleChannel, 
																	14, moduleProductCode , moduleRevisionNumber, moduledeviceType);
	        //add specific string
			  var idString = identification.getIdString();
			  idString = idString + "sensor-type: "    + sensorType + ";";
			
	        //open socket
	        ti_socket = new WsComet(canBus, nodeId, moduleChannel);       
	        
			var client = ti_socket.connect_ws();
	        
			client.onopen = function()
			{
				//send identification string upon socket connection
				console.log(idString);
				client.send(idString);
			};
			
	    	client.onclose = function() 
	    	{
	    	    console.log('echo-protocol Client Closed');
	    	    node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Not connected"});
	    	};
	    	
	        //gets executed when socket receives a message	
	    	client.onmessage = function (event) 
	    	{
					ti_data.setBuffer(event.data, 32);

	                //check Status Variable
	                if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] OK"});
	                	
	                	var scaledData = ti_data.getValue(0) / 10;
	                	var msgData = {payload: scaledData ,
             				           topic: "mcan4ti/" + moduleChannel};
	                	
	
						node.send(msgData);
	                	
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Error"});                	
	            	}	                
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Error"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Not connected"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Wrong Network"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Wrong Node-ID"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Wrong Channel"});
	            	}
	                else if(ti_data.getValue(1) === NodeErrorEnum.eNODE_ERR_DEVICE_IDENTIFICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Wrong device identification"});
	            	}
	                
	    		};
	    }
		
        //---------------------------------------------------------------------------------------------
        // runs when node is closed (before deploy, e.g. to tidy up)
        //---------------------------------------------------------------------------------------------
        close()
        {
			var socket = new WsComet(this.canBus, this.nodeId, this.moduleChannel);  

        	socket.disconnect_ws();
        	//node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Not connected"});
        }

    }
    
    RED.nodes.registerType("mcan-4ti", MCAN4Ti);
}