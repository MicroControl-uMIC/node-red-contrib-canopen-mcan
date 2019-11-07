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

const moduledeviceType     = 0;
const moduleProductCode    = 1287006;
const moduleRevisionNumber = 1;

var pwm_socket;

var diStateOld = false;

var node;

const sensorType = "input";

//-----------------------------------------------------------------------------------------------------
// define variables here
//-----------------------------------------------------------------------------------------------------

module.exports = function(RED) {
	
    class MCANPwm
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
		    //this is neccassary to store objects within node to access it in other functions
			const context = node.context();
	        
	        const nodeId 		= config.nodeId;
	        const canBus 		= config.canBus;
	        const moduleChannel  = config.moduleChannel;
	        const moduleFreq 	= config.moduleFreq;
	
	        //create Buffer for rcv Data
	        var pwm_data = new NodeData();
	        
	        //creat id String
	        var identification = new DeviceIdString(canBus, nodeId, moduleChannel, 
					14, moduleProductCode , moduleRevisionNumber, moduledeviceType);
	        
	        //add specific string
	        var idString = identification.getIdString();
	        idString = idString + "base-frequency: "    + config.moduleFreq	   + ";";
	        
	        //open socket
	        pwm_socket = new WsComet(canBus, nodeId, moduleChannel);       
	        
			var client = pwm_socket.connect_ws();
			
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
	    			//console.log("msg received");
	
	    			pwm_data.setBuffer(event.data, 32);
	       
	                //check Status Variable
	                if(pwm_data.getValue(1) === NodeErrorEnum.eNODE_ERR_NONE)
	            	{
	                	node.status({fill:"green",shape:"dot",text: "[In "+moduleChannel+"] OK"});

	            	}
	                else if(pwm_data.getValue(1) === NodeErrorEnum.eNODE_ERR_SENROR)
	            	{
	                	node.status({fill:"yellow",shape:"dot",text: "[In "+moduleChannel+"] Error"});                	
	            	}	                
	                else if(pwm_data.getValue(1) === NodeErrorEnum.eNODE_ERR_COMMUNICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Error"});
	            	}
	                else if(pwm_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Not connected"});
	            	}
	                else if(pwm_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_NETWORK)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Network"});
	            	}
	                else if(pwm_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_DEVICE)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Node-ID"});
	            	}
	                else if(pwm_data.getValue(1) === NodeErrorEnum.eNODE_ERR_CONNECTION_CHANNEL)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong Channel"});
	            	}
	                else if(pwm_data.getValue(1) === NodeErrorEnum.eNODE_ERR_DEVICE_IDENTIFICATION)
	            	{
	                	node.status({fill:"red",shape:"dot",text: "[In "+moduleChannel+"] Wrong device identification"});
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
    
    RED.nodes.registerType("mcan-pwm", MCANPwm);
}