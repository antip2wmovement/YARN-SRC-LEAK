module.exports = (client) => {
    let statusIndex = 0;
    setInterval(()=>{
        const statuses = [
            `Ping: ${client.ws.ping}ms | .gg/antip2w`,
            `Online: ${client.guilds.cache.get('995751562926362785').members.cache.filter(m => {
                if (m.user.bot) return false;
                if (!m.presence) return false;
                return m.presence.status !== 'offline';
            }).size} | .gg/antip2w`,

            ...client.config.status,


        ]
        client.user.setPresence({
            status: 'online',
            activities: [{
                name: statuses[statusIndex],
                type: 3,
            }]
        })

        statusIndex = (statusIndex + 1)% statuses.length;
        
    }, 15000)
}