const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const clientId = '1257601274871021679'; 
const guildId = '1137504574685597806'; 

module.exports = (client) => {
    client.commands = new Map(); // Initialize commands as a Map

    client.handleCommands = async (commandFolders, path) => {
        client.commandArray = [];
        
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);
                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
            }
        }

        const rest = new REST({ version: '9' }).setToken(process.env.token);

        try {
            console.log('Started refreshing guild (/) commands.');

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: client.commandArray }
            );

            console.log('Successfully reloaded guild (/) commands.');
        } catch (error) {
            console.error(error);
        }
    };
};
