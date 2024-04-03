const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wrap')
        .setDescription('See where to upgrade your WMNO8 to NOT'),
    async execute(interaction) {

        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Click here for NOT Wrapper Page')
			.setURL('https://wrap.nothingtoken.xyz/')
            .setTimestamp()
            .setFooter({ text: 'Nothing Bot - @wrappednothing', iconURL: 'https://bafkreieug75i7f74at6gailpsox52lgs2ct7zccht5nobik3giv4opkeuu.ipfs.dweb.link/'});
        
        await interaction.reply({ embeds: [exampleEmbed] });
    },
};
