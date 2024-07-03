const { Interaction } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return
        
        try{


            await command.execute(interaction, client);
        } catch (error) {
            console.log(error);
            await interaction.reply({
                content: 'There was an error while executing this command!', 
                ephemeral: false
            });
            client.on('interactionCreate', async interaction => {
                if (interaction.isCommand()) {
                  try {
                    if (interaction.replied || interaction.deferred) return; // Prevent double responses
                    await interaction.reply('Processing your request...');
                  } catch (error) {
                    console.error('Error handling interaction:', error);
                  }
                }
              });
        } 
        

    },
    


};