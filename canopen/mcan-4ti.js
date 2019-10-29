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

const moduledeviceType     = 131476;
const moduleProductCode    = 1243005;
const moduleRevisionNumber = 1;


var ti_socket;

var node;

const ErrEnum = 
{
	eNODE_ERR_NONE: 0,
	eNODE_ERR_SENSOR: -10,
	eNODE_ERR_COMMUNICATION: -20,
	eNODE_ERR_CONNECTION: -30,
	eNODE_ERR_CONNECTION_NETWORK: -31,
	eNODE_ERR_CONNECTION_DEVICE: -32,
	eNODE_ERR_CONNECTION_CHANNEL: -33
};
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
	        node = this;  
           this.on('close', this.close);
	        
	        this.canBus        = config.canBus;
	        this.nodeId        = config.nodeId;
	        this.moduleChannel = config.moduleChannel;
	        this.productCode   = config.productCode;
	        this.sensorType    = config.sensorType;
	
	        //create Buffer for rcv Data
	        var ti_data = new NodeData();
	        
	        //creat id String
			  var identification = new DeviceIdString(this.canBus, this.nodeId, this.moduleChannel, 
																	14, moduleProductCode , moduleRevisionNumber, moduledeviceType, 
																	this.sensorType);
	        //add specific string
			  var idString = identification.getIdString();
			  idString = idString + "sensor-type: "    + config.sensorType	   + ";";
			
			
	        //open socket
	        ti_socket = new WsComet(this.canBus, this.nodeId, this.moduleChannel);       
	        
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
	    			//console.log("msg received");
	
	    			ti_data.setBuffer(event.data, 32);
	       
	                //check Status Variable
	                if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] OK"});
	                	
	                	var scaledData = ti_data.getValue(0) / 10;
	                	var msgData = {payload: scaledData };
	
	                	node.send(msgData);
	                	
	            	}
	                else if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Error"});                	
	            	}	                
	                else if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Error"});
	            	}
	                else if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Not connected"});
	            	}
	                else if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Wrong Network"});
	            	}
	                else if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Wrong Node-ID"});
	            	}
	                else if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Wrong Channel"});
	            	}
	                
	    		};
	    }
		
        //---------------------------------------------------------------------------------------------
        // runs when node is closed (before deploy, e.g. to tidy up)
        //---------------------------------------------------------------------------------------------
        close()
        {
        	ti_socket.disconnect_ws();
        	node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Not connected"});
        }

    }
    
    RED.nodes.registerType("mcan-4ti", MCAN4Ti);
}