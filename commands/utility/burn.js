const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('burn')
        .setDescription('See where to burn your NOT'),
    async execute(interaction) {

        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Click here for NOT Incinerator Page')
			.setURL('https://burn.nothingtoken.xyz/')
            .addFields(
                { name: 'WARNING', value: "Burned NOT tokens will leave your wallet and you'll never be able to retrieve them." },
            )
            .setTimestamp()
            .setFooter({ text: 'Nothing Bot - @wrappednothing', iconURL: 'https://bafkreieug75i7f74at6gailpsox52lgs2ct7zccht5nobik3giv4opkeuu.ipfs.dweb.link/'});
        
        await interaction.reply({ embeds: [exampleEmbed] });
    },
};
