//node_data.js
//------------------------------------------------------------------------------------------------------
// Use Strict Mode for JavaScript
//------------------------------------------------------------------------------------------------------
'use strict';



class NodeData
{
	constructor()
	{
		var bufferView;
	}
	
	setBuffer(length, size)
	{
		this.length = length;
		this.size = size;
		
		if(this.size === 8)
		{
			this.bufferView = new Int8Array(this.length);
		}
		if(this.size === 16)
		{
			this.bufferView = new Int16Array(this.length);
		}
		if(this.size === 32)
		{
			this.bufferView = new Int32Array(this.length);
		}
	}
	
	getBuffer()
	{
		return this.bufferView;
	}
	
	getValue(index)
	{
		this.index = index;
		
		if(this.index < this.bufferView.length)
		{
			return this.bufferView[this.index];
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
		

		if(this.index < this.bufferView.length)
		{
			this.bufferView[this.index] = this.value; 
		}
	}

}
module.exports = NodeData;