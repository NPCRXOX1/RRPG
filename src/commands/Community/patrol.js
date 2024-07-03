const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const patrols = new Map();
const patrolHistory = new Map();
const suspendedUsers = new Set();
const PATROL_SUPERVISOR_ROLES = ['RRPG COMMAND', 'Adminstrative Team', 'test']; // Replace with your actual role names
const NORMAL_PATROL_ROLES = ['RRPG PERSONNEL', 'test']; // Replace with the role name that can start/end patrols normally

module.exports = {
    data: new SlashCommandBuilder()
        .setName('patrol')
        .setDescription('Manages patrol commands.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Starts a patrol for yourself.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('Ends a patrol for yourself or forcefully for another user if you have the HICOM role.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user that ends the patrol (must be yourself or can be others if you have the HICOM role)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('history')
                .setDescription('Views the patrol history of a user.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user whose patrol history is to be viewed')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('suspend')
                .setDescription('Suspends a user from starting or ending patrols.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to suspend')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('historyclear')
                .setDescription('Clears patrol history for a specific user or for everyone.')
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('Specify "user" to clear history for a user or "everyone" to clear for everyone.')
                        .setRequired(true))
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user whose patrol history to clear.')
                        .setRequired(false))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(interaction.user.id);
        const hasSupervisorRole = member.roles.cache.some(role => PATROL_SUPERVISOR_ROLES.includes(role.name));
        const hasNormalPatrolRole = member.roles.cache.some(role => NORMAL_PATROL_ROLES.includes(role.name));

        if (subcommand === 'start') {
            if (suspendedUsers.has(interaction.user.id)) {
                return interaction.reply({ content: 'You are suspended from starting patrols.', ephemeral: false });
            }

            if (!hasNormalPatrolRole && !hasSupervisorRole) {
                return interaction.reply({ content: 'You do not have permission to start patrols.', ephemeral: false });
            }

            await interaction.reply({ content: 'Starting patrol...', ephemeral: false }); // Acknowledge the interaction

            const startTime = new Date();
            patrols.set(interaction.user.id, startTime);

            const embed = new EmbedBuilder()
                .setTitle('Patrol Started')
                .setDescription(`Your patrol has started.`)
                .setTimestamp();

            await interaction.user.send({ embeds: [embed] })
                .then(() => {
                    interaction.editReply({ content: 'Patrol has started for you.' });
                })
                .catch(() => {
                    interaction.editReply({ content: 'Failed to send DM. Your DMs might be disabled.' });
                });

            const logEmbed = new EmbedBuilder()
                .setTitle('Patrol Log')
                .setDescription(`Patrol started by ${interaction.user.tag}`)
                .addFields(
                    { name: 'User', value: `${interaction.user.tag}` },
                    { name: 'Time', value: `${startTime.toUTCString()}` }
                )
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'patrol-logs');
            if (logChannel) logChannel.send({ embeds: [logEmbed] });

        } else if (subcommand === 'end') {
            if (suspendedUsers.has(interaction.user.id)) {
                return interaction.reply({ content: 'You are suspended from ending patrols.', ephemeral: false });
            }

            if (user.id !== interaction.user.id && !hasSupervisorRole) {
                return interaction.reply({ content: 'You do not have permission to end a patrol for another user.', ephemeral: false });
            }

            if (!patrols.has(user.id)) {
                return interaction.reply({ content: 'No patrol found for the user.', ephemeral: false });
            }

            await interaction.reply({ content: 'Ending patrol...', ephemeral: false }); // Acknowledge the interaction

            const startTime = patrols.get(user.id);
            const endTime = new Date();
            const duration = Math.round((endTime - startTime) / 1000); // duration in seconds
            patrols.delete(user.id);

            const embed = new EmbedBuilder()
                .setTitle('Patrol Ended')
                .setDescription(`Your patrol has ended.`)
                .setTimestamp();

            let dmContent = 'Your patrol has ended.';
            let logContent = 'Patrol Ended';

            if (user.id !== interaction.user.id && hasSupervisorRole) {
                dmContent = `Your patrol has been forcefully ended by ${interaction.user.tag}.`;
                logContent = `Patrol Forcefully Ended by ${interaction.user.tag}`;
            }

            await user.send({ embeds: [embed.setDescription(dmContent)] })
                .then(() => {
                    interaction.editReply({ content: `Patrol has ended for ${user.id === interaction.user.id ? 'you' : user.tag}.` });
                })
                .catch(() => {
                    interaction.editReply({ content: 'Failed to send DM. User DMs might be disabled.' });
                });

            const logEmbed = new EmbedBuilder()
                .setTitle('Patrol Log')
                .setDescription(`Patrol ended by ${interaction.user.tag}`)
                .addFields(
                    { name: 'User', value: `${user.tag}` },
                    { name: 'Action', value: logContent },
                    { name: 'Duration', value: `${duration} seconds` },
                    { name: 'Start Time', value: `${startTime.toUTCString()}` },
                    { name: 'End Time', value: `${endTime.toUTCString()}` }
                )
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'patrol-logs');
            if (logChannel) logChannel.send({ embeds: [logEmbed] });

            // Store patrol history
            if (!patrolHistory.has(user.id)) {
                patrolHistory.set(user.id, []);
            }
            patrolHistory.get(user.id).push({
                startTime,
                endTime,
                duration,
                endedBy: user.id !== interaction.user.id ? interaction.user.tag : null
            });

        } else if (subcommand === 'history') {
            await interaction.reply({ content: 'Fetching patrol history...', ephemeral: false }); // Acknowledge the interaction

            if (!patrolHistory.has(user.id) || patrolHistory.get(user.id).length === 0) {
                return interaction.editReply({ content: 'No patrol history found for the user.' });
            }

            const history = patrolHistory.get(user.id);
            const historyEmbed = new EmbedBuilder()
                .setTitle('Patrol History')
                .setDescription(`Patrol history for ${user.tag}`)
                .setTimestamp();

            history.forEach((record, index) => {
                historyEmbed.addFields(
                    { name: `Patrol ${index + 1}`, value: `Start: ${record.startTime.toUTCString()}\nEnd: ${record.endTime.toUTCString()}\nDuration: ${record.duration} seconds${record.endedBy ? `\nForcefully Ended By: ${record.endedBy}` : ''}` }
                );
            });

            interaction.editReply({ embeds: [historyEmbed] });

        } else if (subcommand === 'suspend') {
            if (!hasSupervisorRole) {
                return interaction.reply({ content: 'You do not have permission to suspend users.', ephemeral: false });
            }

            await interaction.reply({ content: 'Suspending user...', ephemeral: false }); // Acknowledge the interaction

            if (suspendedUsers.has(user.id)) {
                suspendedUsers.delete(user.id);
                interaction.editReply({ content: `${user.tag} has been unsuspended from starting and ending patrols.` });
            } else {
                suspendedUsers.add(user.id);
                const logEmbed = new EmbedBuilder()
                    .setTitle('Patrol Suspension')
                    .setDescription(`${user.tag} has been suspended by ${interaction.user.tag}.`)
                    .setTimestamp();

                const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'patrol-logs');
                if (logChannel) logChannel.send({ embeds: [logEmbed] });

                interaction.editReply({ content: `${user.tag} has been suspended from starting and ending patrols.` });
            }
        } else if (subcommand === 'historyclear') {
            const clearType = interaction.options.getString('type');

            if (!hasSupervisorRole) {
                return interaction.reply({ content: 'You do not have permission to clear patrol history.', ephemeral: true });
            }

            if (clearType === 'user') {
                if (!user) {
                    return interaction.reply({ content: 'Please specify a user to clear their patrol history.', ephemeral: true });
                }

                if (!patrolHistory.has(user.id) || patrolHistory.get(user.id).length === 0) {
                    return interaction.reply({ content: 'No patrol history found for the specified user.', ephemeral: true });
                }

                patrolHistory.delete(user.id);
                return interaction.reply({ content: `Patrol history cleared for ${user.tag}.`, ephemeral: false });

            } else if (clearType === 'everyone') {
                patrolHistory.clear();
                return interaction.reply({ content: 'Patrol history cleared for everyone.', ephemeral: false });

            } else {
                return interaction.reply({ content: 'Invalid clear type specified. Use "user" or "everyone".', ephemeral: true });
            }
        }
    },
};
