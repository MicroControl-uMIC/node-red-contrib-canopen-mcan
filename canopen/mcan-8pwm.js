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

const moduledeviceType     = 0;
const moduleProductCode    = 1287006;
const moduleRevisionNumber = 1;

var pwm_socket;

var diStateOld = false;

var node;

const sensorType = "input";

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
	
    class MCAN8Pwm
    {
		constructor(config) 
	    {
	        RED.nodes.createNode(this,config);
	       
	        //---------------------------------------------------------------------------------------------
	        // runs when flow is deployed
	        //---------------------------------------------------------------------------------------------
	        node = this;  
	        node.on('close', this.close);
	        node.on('input', this.input);
	        
	        node.nodeId 		= config.nodeId;
	        node.productCode 	= config.productCode;
	        node.canBus 		= config.canBus;
	        node.moduleChannel  = config.moduleChannel;
	        node.moduleFreq 	= config.moduleFreq;
	
	        //create Buffer for rcv Data
	        var pwm_data = new NodeData();
	        
	        //creat id String
	        var identification = new DeviceIdString(this.canBus, this.nodeId, this.moduleChannel, 
					14, moduleProductCode , moduleRevisionNumber, moduledeviceType);
	        
	        //add specific string
	        var idString = identification.getIdString();
	        idString = idString + "base-frequency: "    + config.moduleFreq	   + ";";
	        
	        //open socket
	        pwm_socket = new WsComet(this.canBus, this.nodeId, this.moduleChannel);       
	        
			var client = pwm_socket.connect_ws();
	        
			client.onopen = function()
			{
				//send identification string upon socket connection
	    	    console.log(idString);
				client.send(idString);
			};
			
	    	client.onclose = function() 
	    	{
	    	    console.log('echo-protocol Client Closed');
	    	    node.status({fill:"red",shape:"dot",text: "[In "+pwm_socket.getChannelUrl()+"] Not connected"});
	    	};
	    	
	        //gets executed when socket receives a message	
	    	client.onmessage = function (event) 
	    	{
	    			//console.log("msg received");
	
	    			pwm_data.setBuffer(event.data, 32);
	       
	                //check Status Variable
	                if(pwm_data.getValue(1) === ErrEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+pwm_socket.getChannelUrl()+"] OK"});

	            	}
	                else if(pwm_data.getValue(1) === ErrEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+pwm_socket.getChannelUrl()+"] Error"});                	
	            	}	                
	                else if(pwm_data.getValue(1) === ErrEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+pwm_socket.getChannelUrl()+"] Error"});
	            	}
	                else if(pwm_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+pwm_socket.getChannelUrl()+"] Not connected"});
	            	}
	                else if(pwm_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+pwm_socket.getChannelUrl()+"] Wrong Network"});
	            	}
	                else if(pwm_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+pwm_socket.getChannelUrl()+"] Wrong Node-ID"});
	            	}
	                else if(pwm_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+pwm_socket.getChannelUrl()+"] Wrong Channel"});
	            	}
	                
	    		};
	    }
		
        input(msg) 
        {
        	client.send(msg.payload);
        }
		
        //---------------------------------------------------------------------------------------------
        // runs when node is closed (before deploy, e.g. to tidy up)
        //---------------------------------------------------------------------------------------------
        close()
        {
        	pwm_socket.disconnect_ws();
        	node.status({fill:"red",shape:"dot",text: "[In "+pwm_socket.getChannelUrl()+"] Not connected"});
        }

    }
    
    RED.nodes.registerType("mcan-8pwm", MCAN8Pwm);
}