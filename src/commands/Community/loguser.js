const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('operations-management')
        .setDescription('Logs EP Personnel.')
        .setDefaultPermission(false) // Assuming you want to restrict this command initially
        .addStringOption(option =>
            option
                .setName('user')
                .setDescription('The user whose details will be logged.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('User ID of the person who has access to the alt account.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('main-account')
                .setDescription('Write the RRPG main account.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('rrpg-alt')
                .setDescription('Write the RRPG alt account used to do their phases.')
                .setRequired(true)),
    async execute(interaction) {
        // Array of role names that are allowed to use the command
        const allowedRoles = ['Instructor Team', 'RRPG COMMAND', 'Administrative Team', 'test']; // Add more role names as needed

        // Check if user has any of the allowed roles
        const memberRoles = interaction.member.roles.cache;
        const hasPermission = memberRoles.some(role => allowedRoles.includes(role.name));

        if (!hasPermission) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: false });
        }

        const user = interaction.options.getString('user');
        const id = interaction.options.getString('id');
        const mainacc = interaction.options.getString('main-account');
        const rrpgalt = interaction.options.getString('rrpg-alt');

        // Create an embed with user details
        const embed = new EmbedBuilder()
            .setTitle('RRPG OPERATIONS MANAGEMENT')
            .setDescription(`User details logged by ${interaction.user.tag}`)
            .addFields(
                { name: 'Username', value: user },
                { name: 'User ID', value: id },
                { name: 'RRPG Candidate', value: mainacc },
                { name: 'RRPG Alt Account', value: rrpgalt }
            )
            .setTimestamp();

        // Log the embed in a specific channel
        const channelName = 'op-management-logs'; // Replace with your channel name
        const channel = interaction.guild.channels.cache.find(channel => channel.name === channelName);

        if (!channel) {
            return await interaction.reply({ content: 'Error: Could not find the logging channel.', ephemeral: false });
        }

        try {
            await channel.send({ embeds: [embed] });
            interaction.reply({ content: `USER INFORMATION HAS BEEN LOGGED.`, ephemeral: false });
        } catch (error) {
            console.error('Failed to log user details:', error);
            interaction.reply({ content: `USER INFORMATION HAS FAILED LOGGING PROCESS.`, ephemeral: false });
        }
    },
};
