const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chart')
        .setDescription('Get the chart of the $NOT token'),
    async execute(interaction) {

        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Click here for NOT Chart')
			.setURL('https://stxtools.io/tokens/SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope/swaps')
            .setTimestamp()
            .setFooter({ text: 'Nothing Bot - @wrappednothing', iconURL: 'https://bafkreieug75i7f74at6gailpsox52lgs2ct7zccht5nobik3giv4opkeuu.ipfs.dweb.link/'});
        
        await interaction.reply({ embeds: [exampleEmbed] });
    },
};
