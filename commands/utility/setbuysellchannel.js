const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbuysellchannel')
        .setDescription('Set the channel for $NOT buy/sell notifications')
        .addStringOption(option =>
            option.setName('channel-id')
                .setDescription('The channel ID where to send buy/sell notifications')
                .setRequired(true)),
    async execute(interaction) {

        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply('You do not have permission to use this command.');
        }
        const channelId = interaction.options.getString('channel-id');
        global.channelId = channelId; 
        await interaction.reply(`Buy/sell notifications will now be sent to <#${channelId}>`);      
        console.log(channelId);
    },
};
