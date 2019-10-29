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
    	var idString = this.canBus        	+ ";" +
    	               this.nodeId        	+ ";" +
    	               this.moduleChannel 	+ ";" +
    	               this.vendorId      	+ ";" +
    	               this.productCode   	+ ";" +
    	               this.revisionNumber  + ";" +
    	               this.deviceType	   + ";" +
    	               this.sensorType;
    	
    	return idString;
    }
    
/*    
    // todo : needs to be changed because of language dependency
    sensorValue()
    {
    	var sensorValue = 0;
    	
    	if(this.sensorType === "Thermoelement (Typ J)")
    	{
			sensorValue = 1;
    	}
    	else if(this.sensorType === "Thermoelement (Typ K)")
    	{
			sensorValue = 2;
    	}
    	else if(this.sensorType === "Thermoelement (Typ L)")
    	{
			sensorValue = 3;
    	}
    	else if(this.sensorType === "Thermoelement (Typ N)")
    	{
			sensorValue = 4;
    	}
    	else if(this.sensorType === "Pt100")
    	{
			sensorValue = 30;
    	}
    	else if(this.sensorType === "Pt200")
    	{
			sensorValue = 31;
    	}
    	else if(this.sensorType === "Pt500")
    	{
			sensorValue = 32;
    	}
    	else if(this.sensorType === "Pt1000")
    	{
			sensorValue = 33;
    	}
    	else if(this.sensorType === "+/- 10V")
    	{
			sensorValue = 41;
    	}
    	else if(this.sensorType === "0..10V")
    	{
			sensorValue = 42;
    	}
    	else if(this.sensorType === "4..20mA")
    	{
			sensorValue = 51;
    	}
    	else if(this.sensorType === "0..20mA")
    	{
			sensorValue = 52;
    	}
      	else if(this.sensorType === "NTC")
    	{
			sensorValue = 140;
    	}
    	else
    	{
			sensorValue = "error";
    	}
    	
    	return sensorValue;
    }
  */  
}


//------------------------------------------------------------------------------------------------------
// export class
//------------------------------------------------------------------------------------------------------
module.exports = DeviceIdString;