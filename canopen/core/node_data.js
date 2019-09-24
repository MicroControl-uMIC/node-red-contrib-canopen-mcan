//node_data.js
//------------------------------------------------------------------------------------------------------
// Use Strict Mode for JavaScript
//------------------------------------------------------------------------------------------------------
'use strict';

var bufferView;

class node_data
{
	constructor()
	{

	}
	
	setBuffer(buffer, size)
	{
		this.buffer = buffer;
		this.size = size;
		
		if(this.size === 8)
		{
			bufferView = new Int8Array(this.buffer);
		}
		if(this.size === 16)
		{
			bufferView = new Int16Array(this.buffer);
		}
		if(this.size === 32)
		{
			bufferView = new Int32Array(this.buffer);
		}
	}
	
	getBuffer()
	{
		return bufferView;
	}
	
	getValue(index)
	{
		this.index = index;
		
		if(this.index < bufferView.length)
		{
			return bufferView[this.index];
		}
		else
		{
			return 0;
		}
	}
	
	addValue(index, value)
	{
		this.index = index;
		this.value = value;
		
		if(this.size === 8)
		{
			if(this.index < bufferView.length)
			{
				bufferView.setInt8(this.index, this.value); 
			}
		}
		if(this.size === 16)
		{
			if(this.index < bufferView.length)
			{
				bufferView.setInt16(this.index, this.value); 
			}
		}
		if(this.size === 32)
		{
			if(this.index < bufferView.length)
			{
				bufferView.setInt32(this.index, this.value); 
			}
		}
	}
}
module.exports = node_data;