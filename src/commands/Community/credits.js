const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('credits')
        .setDescription('Displays information about who made the bot and other credits.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Bot Credits')
            .addFields(
                { name: 'Developer', value: 'NPCRXOX1' }, 
                { name: 'Version', value: '1.0.0' }, 
                { name: 'Description', value: 'This bot was created to help manage patrols and provide support to the HICOM of RRPG.' },
                {name: 'Support', value: 'If you do need any help, have questions or wanna report a bug DM "thunder.z".' }
            )
            .setTimestamp()
            .setFooter({ text: 'Red Room Protection Group | ICPO' }); 

        await interaction.reply({ embeds: [embed] });
    },
};
