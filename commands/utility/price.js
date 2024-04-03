const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('price')
        .setDescription('Get the price of the $NOT token'),
    async execute(interaction) {

        const currentPrice = global.currentPrice;
		const currentSupply = global.currentSupply;
        const marketCap = global.marketCap;

        if (currentPrice === 0) {
            await interaction.reply('Current price is not available.');
            return;
        }

		if (currentSupply === 0) {
			await interaction.reply(`$${currentPrice.toFixed(10)}  - Market Cap is not available.`);
            return;
		}      		
        
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Token Price')
			.setURL('https://twitter.com/wrappednothing')
            .setDescription('Get the price of the $NOT token')
            .addFields(
                { name: 'Price', value: `$${currentPrice.toFixed(10)}` },
                { name: 'Market Cap', value: `$${marketCap.toLocaleString()}` },
                { name: 'Circulating Supply', value: currentSupply.toLocaleString() }
            )
            .setImage('https://bafkreieug75i7f74at6gailpsox52lgs2ct7zccht5nobik3giv4opkeuu.ipfs.dweb.link/')
            .setTimestamp()
            .setFooter({ text: 'Nothing Bot - @wrappednothing', iconURL: 'https://bafkreieug75i7f74at6gailpsox52lgs2ct7zccht5nobik3giv4opkeuu.ipfs.dweb.link/'});
        
        await interaction.reply({ embeds: [exampleEmbed] });
    },
};
