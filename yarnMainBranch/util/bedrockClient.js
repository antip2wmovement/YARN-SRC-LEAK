const { setConnection, runNoConnection } = require("../bedrockClient")

module.exports = (client) => {
    if (!client) throw new Error('No Client Provided');
    if (client.connection) {
        setConnection(client.connection)
    } else {
        runNoConnection()
    }
}