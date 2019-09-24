/*jshint esversion: 6 */ 

//-----------------------------------------------------------------------------------------------------//
// for detailed information: https://nodered.org/docs/creating-nodes/node-js       
//-----------------------------------------------------------------------------------------------------//

//-----------------------------------------------------------------------------------------------------
// import packages using "require" here
//-----------------------------------------------------------------------------------------------------


const mcanCommon = require ("../../canopen-mcan-common/canopen-mcan-common");

;

const modProdCode = "12.43.005";

const modRevNr = "v2";

const deviceType = 131476;

const ErrEnum = 
{
	eNODE_ERR_NONE: 0,
	eNODE_ERR_SENSOR: -10,
	eNODE_ERR_COMMUNICATION: -20,
	eNODE_ERR_CONNECTION: -30
};
//-----------------------------------------------------------------------------------------------------
// define variables here
//-----------------------------------------------------------------------------------------------------

module.exports = function(RED) {
    function canopen_mcan_4ti(config) {
        RED.nodes.createNode(this,config);
       
        //---------------------------------------------------------------------------------------------
        // runs when flow is deployed
        //---------------------------------------------------------------------------------------------
        var node = this;
        
        this.nodeID=config.nodeID;
        this.artikelNr=config.artikelNr;
        this.sensorType=config.sensorType;
        this.canCh=config.canCh;
        this.checkCh=config.checkCh;

        //create Buffer for rcv Data
        var ti_data = new mcanCommon.data();
        //creat id String
        var identification = new mcanCommon.string(this.canCh, this.nodeId, this.checkCh, 12, modProdCode , modRevNr, deviceType, this.sensorType);
  
        var string = identification.makeIdString();
        
        //open socket
        var ti_socket = new mcanCommon.socket(this.canCh, this.nodeID, this.checkCh);       
        
		var client = ti_socket.connect_ws();

        client.onopen = function () {
        	client.send("Here's some text that the server is urgently awaiting!"); 
        	console.log('Connected ');
        	};
        
    	client.onclose = function() {
    	    console.log('echo-protocol Client Closed');
    	    node.status({fill:"red",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] Not connected"});
    	};
    	

        //gets executed when socket receives a message	
    	client.onmessage = function (event) {
    			console.log("msg received");

                ti_data.setBuffer(event.data, 32);
       
                //check Status Variable
                if(ti_data.getValue(1) === ErrEnum.eNODE_ERR_NONE)
            	{
                	node.status({fill:"green",shape:"dot",text: "[In "+ti_socket.getChannelUrl()+"] OK"});
                	
                	var scaledData = ti_data.getValue(0) / 1000;
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
                
    		};

        //---------------------------------------------------------------------------------------------
        // runs when node is closed (before deploy, e.g. to tidy up)
        //---------------------------------------------------------------------------------------------
        node.on('close', function() {
        	ti_socket.disconnect_ws();
        });

    }
    RED.nodes.registerType("mCAN.4.ti", canopen_mcan_4ti);
};