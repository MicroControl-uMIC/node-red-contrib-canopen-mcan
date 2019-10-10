// DeviceIdString.js
//------------------------------------------------------------------------------------------------------
// Use Strict Mode for JavaScript
//------------------------------------------------------------------------------------------------------
'use strict';



class DeviceIdString {

    constructor(canBus, nodeId, moduleChannel, vendorId, productCode, revisionNumber, deviceType, sensorType) 
    {

    	this.canBus         = canBus;
    	this.nodeId         = nodeId;
    	this.moduleChannel  = moduleChannel;
    	this.vendorId       = vendorId;
    	this.productCode    = productCode;
    	this.revisionNumber = revisionNumber;
    	this.deviceType     = deviceType;
    	this.sensorType     = sensorType;
    }
    
    
    getIdString()
    {
    	var idString = "can-bus: "        + this.canBus        	+ "\n" +
    	               "node-id: "        + this.nodeId        	+ "\n" +
    	               "module-channel: " + this.moduleChannel 	+ "\n" +
    	               "vendor-id: "      + this.vendorId      	+ "\n" +
    	               "product-code: "   + this.productCode   	+ "\n" +
    	               "revision-number: "+ this.revisionNumber + "\n" +
    	               "device-type: "    + this.deviceType	    + "\n" +
    	               "sensor-type: "    + this.sensorType     + "\n";
    	
    	return idString;
    }
    
    
    // todo : needs to be changed because of language dependency
    static sensorToInt()
    {
    	var sensNr = 0;
    	
    	if(this.sensorType === "Thermoelement (Typ J)")
    	{
    		sensNr = "1";
    	}
    	else if(this.sensorType === "Thermoelement (Typ K)")
    	{
    		sensNr = "2";
    	}
    	else if(this.sensorType === "Thermoelement (Typ L)")
    	{
    		sensNr = "3";
    	}
    	else if(this.sensorType === "Thermoelement (Typ N)")
    	{
    		sensNr = "4";
    	}
    	else if(this.sensorType === "Pt100")
    	{
    		sensNr = "30";
    	}
    	else if(this.sensorType === "Pt200")
    	{
    		sensNr = "31";
    	}
    	else if(this.sensorType === "Pt500")
    	{
    		sensNr = "32";
    	}
    	else if(this.sensorType === "Pt1000")
    	{
    		sensNr = "33";
    	}
    	else if(this.sensorType === "+/- 10V")
    	{
    		sensNr = "41";
    	}
    	else if(this.sensorType === "0..10V")
    	{
    		sensNr = "42";
    	}
    	else if(this.sensorType === "4..20mA")
    	{
    		sensNr = "51";
    	}
    	else if(this.sensorType === "0..20mA")
    	{
    		sensNr = "52";
    	}
      	else if(this.sensorType === "NTC")
    	{
      		sensNr = "140";
    	}
    	else
    	{
    		sensNr = "error";
    	}
    	
    	return sensNr;
    }
    
}


//------------------------------------------------------------------------------------------------------
// export class
//------------------------------------------------------------------------------------------------------
module.exports = DeviceIdString;