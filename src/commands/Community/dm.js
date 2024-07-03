const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Sends a DM to a user.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user that should get DM')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message that the user should receive')
                .setRequired(true)),
    async execute(interaction) {
        // Check if the user executing the command has the required role
        if (!interaction.member.roles.cache.some(role => role.name === 'RRPG COMMAND')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: false });
        }

        const user = interaction.options.getUser('user');
        const message = interaction.options.getString('message');

        const embed = new EmbedBuilder()
            .setTitle('``` - Red Room Protection Group| ICPO -```')
            .setDescription(message)
            .setTimestamp();

        await user.send({ embeds: [embed] })
            .then(() => {
                interaction.reply({ content: `Message sent to ${user.tag}.` });
            })
            .catch(() => {
                interaction.reply({ content: 'Failed to send DM. User may have DMs disabled.' });
            });
    },
};
