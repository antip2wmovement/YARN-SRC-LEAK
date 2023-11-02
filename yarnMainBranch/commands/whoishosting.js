const hostingMessages = [
    `WOWZERS!1!11 Currently <@800246262175236137> is hosting the bot. THATS CRAZY!!!`,
    `You aren't going to believe this, but <@800246262175236137> is hosting it.`,
    `I can't believe it, but <@800246262175236137> is hosting the bot.`,
    `DUDE! <@800246262175236137> is hosting the bot!`,
    `Why is <@800246262175236137> hosting the bot?`,
    `I don't know why, but <@800246262175236137> is hosting the bot.`,
    `We thought <@800246262175236137> was hosting the bot, but we were right.`,
    `Can we all agree that <@800246262175236137> is hosting the bot?`,
    `Okay. <@800246262175236137> is hosting the bot.`,
    `Who the fuck let <@800246262175236137> host the bot?`,
    `HELP <@800246262175236137> IS HOSTING THE BOT!!!`,
    `Hold on to your hats! <@800246262175236137> is now hosting the bot. Let the magic begin!`,
    `Alert! Alert! <@800246262175236137> has taken the wheel and is now hosting the bot. Brace yourselves!`,
    `Breaking news: <@800246262175236137> has just stepped up to host the bot. Prepare for awesomeness!`,
    `Hey there, fellow humans! Guess who's the awesome host? Yep, it's <@800246262175236137>!`,
    `Attention, everyone! <@800246262175236137> is now in charge of hosting the bot. Time for some fun!`,
    `Oh la la! Look who's the host now — it's none other than <@800246262175236137>!`,
    `Incoming transmission: <@800246262175236137> has assumed hosting duties. Get ready for a wild ride!`,
    `Buckle up! <@800246262175236137> is at the hosting helm. Let's see where this adventure takes us!`,
    `Stop the press! <@800246262175236137> is hosting the bot. Expect great things to happen!`,
    `Ready or not, here comes <@800246262175236137> as the bot's new host. Let's make it epic!`,
    `We interrupt your regularly scheduled programming to bring you this important announcement: <@800246262175236137> is now hosting the bot. Let the fun begin!`,
    `Attention, everyone! <@800246262175236137> is now in charge of hosting the bot. Time for some fun!`,
    `Oh la la! Look who's the host now — it's none other than <@800246262175236137>!`,
    `Dude. <@800246262175236137> is hosting the bot. That's crazy!`,
    `You aren't going to believe this, but <@800246262175236137> is hosting it.`,
    `Yo who let <@800246262175236137> host the bot?`,
]

module.exports = {
	name: "whoishosting",
    description: "Shows you who is currently hosting the bot",
    level: 0,
	async execute(interaction) {
        await interaction.reply({
            embeds: [
                {
                    title: "Whoishosting?",
                    description: `${hostingMessages[Math.floor(Math.random() * hostingMessages.length)]}`,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 1286414
                }
            ]
        });
    }
};