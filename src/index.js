const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
});

// IDs of the channels where notifications will be sent
const channelId1 = '1242828208374677507'; // Replace with your channel ID
const channelId2 = '987654321098765432'; // Replace with another channel ID

client.on("ready", () => {
    console.log('The bot\'s status has been set!');

    client.user.setStatus("dnd"); // Set bot status to 'Do Not Disturb' on ready

    // Log information about the guilds the bot is in
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Bot is currently in ${client.guilds.cache.size} guild(s):`);

    client.guilds.cache.forEach(guild => {
        console.log(`- ${guild.name} (ID: ${guild.id}) | Members: ${guild.memberCount}`);
        // Log roles in the guild
        console.log(`  Roles:`);
        guild.roles.cache.forEach(role => {
            console.log(`    - ${role.name} (ID: ${role.id})`);
        });

        // Log channels in the guild
        console.log(`  Channels:`);
        guild.channels.cache.forEach(channel => {
            console.log(`    - ${channel.name} (ID: ${channel.id}) | Type: ${channel.type}`);
        });

        console.log("\n"); // Separate each guild's information for clarity

        // Send notifications to specified channels when bot is ready
        if (guild.id === '1242828208374677504') {
            const channel1 = guild.channels.cache.get(channelId1);
            if (channel1) {
                channel1.send(`Bot is online and ready in ${guild.name}.`);
            }
        }

        if (guild.id === 'ANOTHER_GUILD_ID_HERE') {
            const channel2 = guild.channels.cache.get(channelId2);
            if (channel2) {
                channel2.send(`Bot is online and ready in ${guild.name}.`);
            }
        }
    });
});

client.on("disconnect", () => {
    // Send notifications to specified channels when bot disconnects
    client.guilds.cache.forEach(guild => {
        if (guild.id === '1242828208374677504') {
            const channel1 = guild.channels.cache.get(channelId1);
            if (channel1) {
                channel1.send("Bot is disconnecting.");
            }
        }

        if (guild.id === 'ANOTHER_GUILD_ID_HERE') {
            const channel2 = guild.channels.cache.get(channelId2);
            if (channel2) {
                channel2.send("Bot is disconnecting.");
            }
        }
    });
});

client.on("reconnecting", () => {
    // Send notifications to specified channels when bot reconnects
    client.guilds.cache.forEach(guild => {
        if (guild.id === '1242828208374677504') {
            const channel1 = guild.channels.cache.get(channelId1);
            if (channel1) {
                channel1.send("Bot is reconnecting.");
            }
        }

        if (guild.id === 'ANOTHER_GUILD_ID_HERE') {
            const channel2 = guild.channels.cache.get(channelId2);
            if (channel2) {
                channel2.send("Bot is reconnecting.");
            }
        }
    });
});

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (const file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    await client.login(process.env.token); // await login to ensure bot is ready
})();

process.on('unhandledRejection', (reason, promise) => {
    console.error("[ANTI-CRASH: unhandledRejection] An error has occurred and been successfully handled:");
    console.error(promise, reason);
});

process.on("uncaughtException", (err, origin) => {
    console.error("[ANTI-CRASH: uncaughtException] An error has occurred and been successfully handled:");
    console.error(err, origin);
});
