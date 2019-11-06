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

const moduledeviceType     = 131476;
const moduleProductCode    = 1244001;
const moduleRevisionNumber = 50463754;

//-----------------------------------------------------------------------------------------------------
// define variables here
//-----------------------------------------------------------------------------------------------------

module.exports = function(RED) {
	
    class MCANAi
    {
		constructor(config) 
	    {
	        RED.nodes.createNode(this,config);
	       
	        //---------------------------------------------------------------------------------------------
	        // runs when flow is deployed
	        //---------------------------------------------------------------------------------------------
	        const node = this;  
	        node.on('close', this.close);
	        
		    //this is neccassary to store objects within node to access it in other functions
			const context = node.context();
	        
	        node.nodeId 		= config.nodeId;
	        node.productCode 	= config.productCode;
	        node.sensorType 	= config.sensorType;
	        node.canBus 		= config.canBus;
	        node.moduleChannel 	= config.moduleChannel;
	
	        //create Buffer for rcv Data
	        var ai_data = new NodeData();
	        
	        //creat id String
			var identification = new DeviceIdString(node.canBus, node.nodeId, node.moduleChannel, 
																	14, moduleProductCode , moduleRevisionNumber, moduledeviceType);
	        //add specific string
			var idString = identification.getIdString();
			idString = idString + "sensor-type: "    + node.sensorType	   + ";";
			  
	        //open socket
	        const ai_socket = new WsComet(node.canBus, node.nodeId, node.moduleChannel);       
	        
			var client = ai_socket.connect_ws();
	        
			client.onopen = function()
			{
				//send identification string upon socket connection
	    	    console.log(idString);
				client.send(idString);
			};
			
	    	client.onclose = function() 
	    	{
	    	    console.log('echo-protocol Client Closed');
	    	    node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Not connected"});
	    	};
	    	
	        //gets executed when socket receives a message	
	    	client.onmessage = function (event) 
	    	{
	    			ai_data.setBuffer(event.data, 32);
	       
	                //check Status Variable
	                if(ai_data.getValue(1) === NodeErrorEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] OK"});
	                	
	                	var scaledData = ai_data.getValue(0) / 10;
	                	var msgData = {payload: scaledData ,
	                				   topic: "mcan4ai/" + node.moduleChannel};
	
	                	node.send(msgData);
	                	
	            	}
	                else if(ai_data.getValue(1) === NodeErrorEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Error"});                	
	            	}	                
	                else if(ai_data.getValue(1) === NodeErrorEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Error"});
	            	}
	                else if(ai_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Not connected"});
	            	}
	                else if(ai_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Wrong Network"});
	            	}
	                else if(ai_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Wrong Node-ID"});
	            	}
	                else if(ai_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Wrong Channel"});
	            	}
	                else if(ai_data.getValue(1) === NodeErrorEnum.eNODE_ERR_DEVICE_IDENTIFICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+ai_socket.getChannelUrl()+"] Wrong device identification"});
	            	}
	                
	    		};
	    		
	    		console.log(node.getElementById("node-input-moduleChannel").value);
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
    
    RED.nodes.registerType("mcan-ai", MCANAi);
}