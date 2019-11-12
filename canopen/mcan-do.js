/*jshint esversion: 6 */

'use strict';

//-----------------------------------------------------------------------------------------------------//
// for detailed information: https://nodered.org/docs/creating-nodes/node-js                           //
//-----------------------------------------------------------------------------------------------------//

//-----------------------------------------------------------------------------------------------------
// import packages using "require" here
//-----------------------------------------------------------------------------------------------------


const deviceIdString  = require("./core/id_string");
const socketComet     = require("./core/websocket_comet.js");
const nodeData        = require("./core/node_data.js");
const nodeErrorEnum   = require("./core/node_error.js");


const moduledeviceType     = 197009;
const moduleProductCode    = 1286014;
const moduleRevisionNumber = 2;


//-----------------------------------------------------------------------------------------------------
// Definition of McanDoNode
//-----------------------------------------------------------------------------------------------------

module.exports = function(RED) {

    //---------------------------------------------------------------------------------------------
    // Definition of class 'McanDoNode'
    //
    class McanDoNode
    {
        //------------------------------------------------------------------------------------
        // Constructor
        // runs when flow is deployed
        //
        constructor(config)
        {
            RED.nodes.createNode(this,config);

            const node = this;
            node.on('close', node.close);
            node.on('input', node.input);

            //---------------------------------------------------------------------------
            // this is neccassary to store objects within node to access it in other
            // functions
            //
            const context = node.context();

            const canBus        = config.canBus;
            const nodeId        = config.nodeId;
            const moduleChannel = config.moduleChannel;


            //---------------------------------------------------------------------------
            // status of communication unknown
            //
            let statusValue   = nodeErrorEnum.eNODE_ERR_UNKOWN;

            //---------------------------------------------------------------------------
            // open socket
            //
            const socket = new socketComet(canBus, nodeId, moduleChannel);

            //---------------------------------------------------------------------------
            // create buffer for socket data
            //
            var outputData = new nodeData();

            //---------------------------------------------------------------------------
            // create id string
            //
            let identification = new deviceIdString(canBus, nodeId, moduleChannel,
                                                    14,
                                                    moduleProductCode,
                                                    moduleRevisionNumber,
                                                    moduledeviceType);


            //---------------------------------------------------------------------------
            // add module specific string
            //
            let idString = identification.getIdString();
            idString = idString + "port-direction: 1"+ ";" +
                                  "error-mode: 0"    + ";" +
                                  "error-value: 0"   + ";";

            //---------------------------------------------------------------------------
            // setup client connection
            //
            const client = socket.connect_ws();


            //---------------------------------------------------------------------------
            // keep the context
            //
            context.set('client', client);
            context.set('node'  , node);

            //---------------------------------------------------------------------------
            // send identification string upon socket connection
            //
            client.onopen = function()
            {
                client.send(idString);
            };

            //---------------------------------------------------------------------------
            // gets executed when the socket is closed
            //
            client.onclose = function()
            {
            };

            //---------------------------------------------------------------------------
            // gets executed when socket receives a message
            //
            client.onmessage = function (event)
            {
                outputData.setBuffer(event.data, 32);

                //-------------------------------------------------------------------
                // check communication status
                //
                if (statusValue != outputData.getValue(1))
                {
                    statusValue = outputData.getValue(1);
                    node.update(moduleChannel, statusValue);
                }
            };

            //---------------------------------------------------------------------------
            // This method is responsible for updating the node status
            //
            node.update = function (channel, status)
            {
                switch (status)
                {
                    case nodeErrorEnum.eNODE_ERR_NONE:
                        node.status({fill:"green" , shape:"dot", text: "[Out "+ channel +"] OK"});
                        break;

                    case nodeErrorEnum.eNODE_ERR_SENSOR:
                        node.status({fill:"yellow", shape:"dot", text: "[Out "+ channel +"] Sensor Error"});
                        break;

                    case nodeErrorEnum.eNODE_ERR_COMMUNICATION:
                        node.status({fill:"red"   , shape:"dot", text: "[Out "+ channel +"] Communication"});
                        break;

                    case nodeErrorEnum.eNODE_ERR_CONNECTION:
                        node.status({fill:"red"   , shape:"dot", text: "[Out "+ channel +"] Not connected"});
                        break;

                    case nodeErrorEnum.eNODE_ERR_CONNECTION_NETWORK:
                        node.status({fill:"red"   , shape:"dot", text: "[Out "+ channel +"] Network invalid"});
                        break;

                    case nodeErrorEnum.eNODE_ERR_CONNECTION_DEVICE:
                        node.status({fill:"red"   , shape:"dot", text: "[Out "+ channel +"] Node-ID invalid"});
                        break;

                    case nodeErrorEnum.eNODE_ERR_CONNECTION_CHANNEL:
                        node.status({fill:"red"   , shape:"dot", text: "[Out "+ channel +"] Channel invalid"});
                        break;

                    case nodeErrorEnum.eNODE_ERR_DEVICE_IDENTIFICATION:
                        node.status({fill:"red"   , shape:"dot", text: "[Out "+ channel +"] Identification failed"});
                        break;

                    default:
                        node.status({fill:"red"   , shape:"dot", text: "[Out "+ channel +"] Undefined"});
                        break;
                }
            };

        }

        //------------------------------------------------------------------------------------
        // This function is called when the node sends a message
        //
        input(msg)
        {
            let inputData = new nodeData();

            //---------------------------------------------------------------------------
            // neccassary to access context storage
            //
            let context = this.context();

            let rcvData = msg.payload;

            //---------------------------------------------------------------------------
            // read context variable
            //
            const client = context.get('client');

            inputData.setBuffer(4, 32);

            if(rcvData === true)
            {
                inputData.addValue(0, 1);
            }
            else
            {
                inputData.addValue(0, 0);
            }
            inputData.addValue(1, 0);

            client.send(inputData.getBuffer());
        }

        //------------------------------------------------------------------------------------
        // This function is called when the node is being stopped, e.g. a new flow
        // configuration is deployed
        //
        close()
        {
            //---------------------------------------------------------------------------
            // neccassary to access context storage
            //
            let context = this.context();

            //---------------------------------------------------------------------------
            // read context variable
            //
            const client = context.get('client');

            //---------------------------------------------------------------------------
            // close client connection
            //
            client.close();

        }

    }

    RED.nodes.registerType("mcan-dio out", McanDoNode);
}
