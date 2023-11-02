const version = "1.20.30";

const bedrock = require("bedrock-protocol");
const { Physics, PlayerState } = require("prismarine-physics");
const mcData = require("./minecraft-data/mc_data")(`bedrock_${version}`);

const client = bedrock.createClient({
    username: "1003273483515605012 948",
    profilesFolder: "/yarn/profiles",
    skinData: {
        CurrentInputMode: 3,
        DefaultInputMode: 3,
        DeviceModel: 'Xbox Series X',
        DeviceOS: 13, // DO NOT CHANGE UNDER ANY CIRCUMSTANCES
    },
    skipPing: true,
    realms: {
        realmInvite: "spkhzdep-de",
    }
});

client.registry = mcData;
client.version = `bedrock_${version}`;

const world = require("./world")(client);
const physics = Physics(mcData, world);
const controls = {
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    sneak: false
};

client.on("spawn", () => {
    require("./player")(client);
    const playerState = new PlayerState(client, controls);
    playerState.teleportTicks = 5;
    const movement = require("./movement")(client, playerState);

    let ref;
    ref = setInterval(() => {
        if(ref === undefined) return;
        movement.tick();

        if(playerState.teleportTicks === 0) {
            movement.send(controls);
            physics.simulatePlayer(playerState, world).apply(client);
        }
    }, 50); // 1 tick
});
