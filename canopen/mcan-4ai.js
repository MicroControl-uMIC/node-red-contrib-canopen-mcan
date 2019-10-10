/*jshint esversion: 6 */ 

//-----------------------------------------------------------------------------------------------------//
// for detailed information: https://nodered.org/docs/creating-nodes/node-js       
//-----------------------------------------------------------------------------------------------------//

//-----------------------------------------------------------------------------------------------------
// import packages using "require" here
//-----------------------------------------------------------------------------------------------------


const DeviceIdString  = require("./core/id_string");
const WsComet = require("./core/websocket_comet.js");
const NodeData  = require("./core/node_data.js");

const modProdCode = "12.43.005";

const modRevNr = "v2";

const deviceType = 131476;

var ai_socket;

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
	
    class MCAN4Ai
    {
		constructor(config) 
	    {
	        RED.nodes.createNode(this,config);
	       
	        //---------------------------------------------------------------------------------------------
	        // runs when flow is deployed
	        //---------------------------------------------------------------------------------------------
	        node = this;  
            this.on('close', this.close);
	        
	        this.nodeId=config.nodeId;
	        this.productCode=config.productCode;
	        this.sensorType=config.sensorType;
	        this.canBus=config.canBus;
	        this.moduleChannel=config.moduleChannel;
	
	        //create Buffer for rcv Data
	        var ai_data = new NodeData();
	        
	        //creat id String
	        var identification = new DeviceIdString(this.canBus, this.nodeId, this.moduleChannel, 12, modProdCode , modRevNr, deviceType, this.sensorType);
	        
	        //open socket
	        ai_socket = new WsComet(this.canBus, this.nodeId, this.moduleChannel);       
	        
			var client = ai_socket.connect_ws();
	        
			client.onopen = function()
			{
				//send identification string upon socket connection
	    	    console.log(identification.getIdString());
				client.send(identification.getIdString());
			};
			
	    	client.onclose = function() 
	    	{
	    	    console.log('echo-protocol Client Closed');
	    	    node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Not connected"});
	    	};
	    	
	        //gets executed when socket receives a message	
	    	client.onmessage = function (event) 
	    	{
	    			console.log("msg received");
	
	    			ai_data.setBuffer(event.data, 32);
	       
	                //check Status Variable
	                if(ai_data.getValue(1) === ErrEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] OK"});
	                	
	                	var scaledData = ai_data.getValue(0) / 1000;
	                	var msgData = {payload: scaledData };
	
	                	node.send(msgData);
	                	
	            	}
	                else if(ai_data.getValue(1) === ErrEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Error"});                	
	            	}	                
	                else if(ai_data.getValue(1) === ErrEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Error"});
	            	}
	                else if(ai_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Not connected"});
	            	}
	                else if(ai_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Wrong Network"});
	            	}
	                else if(ai_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Wrong Node-ID"});
	            	}
	                else if(ai_data.getValue(1) === ErrEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Wrong Channel"});
	            	}
	                
	    		};
	    }
		
        //---------------------------------------------------------------------------------------------
        // runs when node is closed (before deploy, e.g. to tidy up)
        //---------------------------------------------------------------------------------------------
        close()
        {
        	ai_socket.disconnect_ws();
        	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Not connected"});
        }

    }

  //---------------------------------------------------------------------------------------------------
  // This additional path assures that ALL pictures are found by the server
  //
  RED.httpAdmin.get('/node-red-contrib-canopen-mcan/*', function(req, res){
      var options = {
          root: __dirname /*+ '/images/'*/,
          dotfiles: 'deny'
      };
     
      // Send the requested file to the client 
      res.sendFile(req.params[0], options)
  });
    
    RED.nodes.registerType("mcan-4ai", MCAN4Ai);
}