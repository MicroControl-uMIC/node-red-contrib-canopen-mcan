//id_string.js
//------------------------------------------------------------------------------------------------------
// Use Strict Mode for JavaScript
//------------------------------------------------------------------------------------------------------
'use strict';



class id_string{

    constructor(canCh, nodeId, modCh, vendorId, prodCode, revNr, deviceType, sensorType) 
    {

    	this.canCh = canCh;
    	this.nodeId = nodeId;
    	this.modCh = modCh;
    	this.vendorId = vendorId;
    	this.prodCode = prodCode;
    	this.revNr = revNr;
    	this.deviceType = deviceType;
    	this.sensorType = sensorType;
    }
    
    
    makeIdString()
    {
    	var idString = "can-bus: " +this.canCh+ "\n" +
    	 "node-id: " +this.nodeID+ "\n" +
    	 "channel: " +this.Channel+ "\n" +
    	 "vendor-id: " +this.vendorId + "\n" +
    	 "product-code: " +this.prodCode+ "\n" +
    	 "revision-number: "+this.revNr + "\n" +
    	 "devicetype: " +this.deviceType+ "\n" +
    	 "signal-type: " +this.sensorType+ "\n";
    	
    	return idString;
    }
    
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
//export class, so other modules can create Calc objects
//------------------------------------------------------------------------------------------------------
module.exports = id_string;