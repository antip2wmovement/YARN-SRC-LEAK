const fs = require('fs');
const util = require('util');

const minecarftData = require('minecraft-data')('bedrock_1.20.30');

const ev = minecarftData.protocol.types.mcpe_packet[1][1].type[1].fields;

let ecl = [
    'move_player',
    'set_title',
    'tick_sync',
    'block_entity_data',
    'level_chunk',
    'update_subchunk_blocks',
    'entity_event',
    "network_chunk_publisher_update",
]

module.exports = (client) => {
    console.log('Event List');
    for (const event of Object.keys(ev)) {
        if (ecl.includes(event)) continue;
        console.log(event);
        client.on(event, (...args) => {
            console.log(`Event: ${event}`);
            args.forEach((arg, index) => {
                console.log(`Argument ${index}:`);
                console.log(util.inspect(arg, { depth: 15 })); // Adjust the depth as needed
            });
        });
    }
    console.log('-------------------');
}