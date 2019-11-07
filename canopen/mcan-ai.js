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
	        
	        const nodeId 		= config.nodeId;
	        const sensorType 	= config.sensorType;
	        const canBus 		= config.canBus;
	        const moduleChannel = config.moduleChannel;
	
	        //create Buffer for rcv Data
	        var aiData = new NodeData();
			  
	        //open socket	               	        
	        const aiSocket = new WsComet(canBus, nodeId, moduleChannel);
	        
	        //creat id String
			const identification = new DeviceIdString(canBus,nodeId, moduleChannel, 
																	14, moduleProductCode , moduleRevisionNumber, moduledeviceType);
	        //add specific string
			var idString = identification.getIdString();
			idString = idString + "sensor-type: "    + sensorType + ";";

			var client = aiSocket.connect_ws();

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
	    	    node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Not connected"});
	    	};
	    	
	        //gets executed when socket receives a message	
	    	client.onmessage = function (event) 
	    	{
				aiData.setBuffer(event.data, 32);
	       
	                //check Status Variable
	                if(aiData.getValue(1) === NodeErrorEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+moduleChannel+"] OK"});
	                	
	                	var scaledData = aiData.getValue(0) / 10;
	                	var msgData = {payload: scaledData ,
	                				   topic: "mcan4ai/" + moduleChannel};
	
	                	node.send(msgData);
	                	
	            	}
	                else if(aiData.getValue(1) === NodeErrorEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+moduleChannel+"] Error"});                	
	            	}	                
	                else if(aiData.getValue(1) === NodeErrorEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Error"});
	            	}
	                else if(aiData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Not connected"});
	            	}
	                else if(aiData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Network"});
	            	}
	                else if(aiData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Node-ID"});
	            	}
	                else if(aiData.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Channel"});
	            	}
	                else if(aiData.getValue(1) === NodeErrorEnum.eNODE_ERR_DEVICE_IDENTIFICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong device identification"});
	            	}
	                
	    		};
	    		
	    		console.log(node.getElementById("node-input-moduleChannel").value);
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