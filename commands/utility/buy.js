const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('See where to get NOThing'),
    async execute(interaction) {

        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Swap NOT on..')
            .setDescription('[AlexLab](https://app.alexlab.co/swap?fromCurrency=token-wstx&toCurrency=token-wnope)\n[Velar](https://app.velar.com/swap)')
            .setTimestamp()
            .setFooter({ text: 'Nothing Bot - @wrappednothing', iconURL: 'https://bafkreieug75i7f74at6gailpsox52lgs2ct7zccht5nobik3giv4opkeuu.ipfs.dweb.link/'});
        
        await interaction.reply({ embeds: [exampleEmbed] });
    },
};
