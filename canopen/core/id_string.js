// DeviceIdString.js
//------------------------------------------------------------------------------------------------------
// Use Strict Mode for JavaScript
//------------------------------------------------------------------------------------------------------
'use strict';



class DeviceIdString {

    constructor(canBus, nodeId, moduleChannel, vendorId, productCode, revisionNumber, deviceType) 
    {

    	this.canBus         = canBus;
    	this.nodeId         = nodeId;
    	this.moduleChannel  = moduleChannel;
    	this.vendorId       = vendorId;
    	this.productCode    = productCode;
    	this.revisionNumber = revisionNumber;
    	this.deviceType     = deviceType;
    }
    
    
    getIdString()
    {
    	var idString = "can-bus: "        + this.canBus        	+ ";" +
    	               "node-id: "        + this.nodeId        	+ ";" +
    	               "module-channel: " + this.moduleChannel 	+ ";" +
    	               "vendor-id: "      + this.vendorId      	+ ";" +
    	               "product-code: "   + this.productCode   	+ ";" +
    	               "revision-number: "+ this.revisionNumber  + ";" +
    	               "device-type: "    + this.deviceType	   + ";";
    	
    	return idString;
    }
    
}


//------------------------------------------------------------------------------------------------------
// export class
//------------------------------------------------------------------------------------------------------
module.exports = DeviceIdString;