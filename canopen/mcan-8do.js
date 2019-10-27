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

const modProdCode = "12.86.014";

const modRevNr = "v2";

const deviceType = 131476;

var do_socket;

var node;

const sensorType = "output";

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
	
    class MCAN8Do
    {
		constructor(config) 
	    {
	        RED.nodes.createNode(this,config);
	       
	        //---------------------------------------------------------------------------------------------
	        // runs when flow is deployed
	        //---------------------------------------------------------------------------------------------
	        node = this;  
            this.on('close', this.close);
            this.on('input', this.input);
	        
	        this.nodeId=config.nodeId;
	        this.productCode=config.productCode;
	        this.canBus=config.canBus;
	        this.moduleChannel=config.moduleChannel;
	
	        //create Buffer for rcv Data
	        var do_data = new NodeData();
	        
	        //creat id String
	        var identification = new DeviceIdString(this.canBus, this.nodeId, this.moduleChannel, 12, modProdCode , modRevNr, deviceType, sensorType);
	        
	        //open socket
	        do_socket = new WsComet(this.canBus, this.nodeId, this.moduleChannel);       
	        
			var client = do_socket.connect_ws();
	        
			client.onopen = function()
			{
				//send identification string upon socket connection
	    	    console.log(identification.getIdString());
				client.send(identification.getIdString());
			};
			
	    	client.onclose = function() 
	    	{
	    	    console.log('echo-protocol Client Closed');
	    	    node.status({fill:"red",shape:"dot",text: "[In "+do_socket.getChannelUrl()+"] Not connected"});
	    	};
	    	
	        //gets executed when socket receives a message	
	    	client.onmessage = function (event) 
	    	{
	    			//console.log("msg received");
	
	    			do_data.setBuffer(event.data, 32);
	       
	                //check Status Variable
	                if(do_data.getValue(1) === ErrEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+do_socket.getChannelUrl()+"] OK"});	                	
	            	}
	                else if(do_data.getValue(1) === ErrEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+do_socket.getChannelUrl()+"] Error"});                	
	            	}	                
	                else if(do_data.getValue(1) === ErrEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+do_socket.getChannelUrl()+"] Error"});
	            	}
	                else if(do_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+do_socket.getChannelUrl()+"] Not connected"});
	            	}
	                else if(do_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+do_socket.getChannelUrl()+"] Wrong Network"});
	            	}
	                else if(do_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+do_socket.getChannelUrl()+"] Wrong Node-ID"});
	            	}
	                else if(do_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+do_socket.getChannelUrl()+"] Wrong Channel"});
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
        	do_socket.disconnect_ws();
        	node.status({fill:"red",shape:"dot",text: "[In "+do_socket.getChannelUrl()+"] Not connected"});
        }

    }
    
    RED.nodes.registerType("mcan-8dio out", MCAN8Do);
}