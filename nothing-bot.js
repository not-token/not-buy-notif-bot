// -------------------------------------------------------------- //
// ---------- Nothing Discord/Telegram Buy notif Bot ------------ //
// -------------------------------------------------------------- //

// Imports
const fs = require("node:fs");
const path = require("node:path");
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js");
const { token, tgtoken } = require("./config.json");
const TelegramBot = require("node-telegram-bot-api");

// Bots inits
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const bot = new TelegramBot(tgtoken, { polling: false });
const telegramChatId = "-1001942852379";

const imagePath = path.join(__dirname, "not.png");
const velarChartUrl =
  "https://stxtools.io/pools/VELAR_SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope_stx/swaps";
const alexChartUrl =
  "https://stxtools.io/pools/ALEX_SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope_stx/swaps";

// Global Variables + retrieve commands and events
global.stxPrice = 0;
global.currentPrice = 0;
global.currentSupply = 0;
global.marketCap = 0;
global.blockHeight = 0;
global.channelId = null;

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) =>
      event.execute(...args, client, currentPrice)
    );
  }
}

// Functions to send message to Telegram
async function sendTelegramMessage(message) {
  try {
    const options = {
      caption: message,
      disable_notification: false,
      parse_mode: "HTML",
    };

    await bot.sendPhoto(telegramChatId, imagePath, options);
    console.log("Message sent to Telegram");
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
  }
}

function buildTelegramMessage(
  title, fromamnt, toamnt, from, to, price, mcap, dex, chartUrl, txUrl
) {
  let value = stxPrice * fromamnt;
  if (from === "ALEX") {
    value = toamnt * price;
  }
  return `<a href="${imagePath}">&#8205;</a>
<b> ✦✦ ${title}!! ✦✦</b>
${buildEmojiText(fromamnt, from)}
<b>From:</b> ${fromamnt.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${from}  ($${(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })})
<b>To:</b> ${toamnt.toLocaleString()} ${to}
<b>DEX:</b> ${dex}
<b>Price:</b> $${price.toFixed(10)}
<b>Market Cap:</b> $${mcap.toLocaleString()}

<i><a href="${chartUrl}">Chart</a> | <a href="${txUrl}">See TX</a></i>`;
}

function buildEmojiText(amnt, from) {
  let balls = "🟠";
  const i = amnt / 30;
  let text = "";
  for (let x = 1; x <= i; x++) {
    text = text + balls;
    if (x >= 100) {
      break;
    }
  }
  return text;
}

// Function to build Discord message
function buildDiscordMessage(fromamnt, toamnt, from, to, price, mcap, dex) {
  if (from === "STX") {
    return `**${fromamnt.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${from}** swapped for **${toamnt.toLocaleString()} ${to}**
**DEX:** ${dex}
**Price:** $${price.toFixed(10)}
**Market Cap:** $${mcap.toLocaleString()}`;
  } else {
    return `**${fromamnt.toLocaleString()} ${from}** swapped for **${toamnt.toLocaleString(
      undefined,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )} ${to}**
**DEX:** ${dex}
**Price:** $${price.toFixed(10)}
**Market Cap:** $${mcap.toLocaleString()}`;
  }
}

// Function to fetch price from API
async function fetchPrice() {
  try {
    const response = await fetch("https://api.velar.co/tokens/?symbol=NOT");
    if (!response.ok) {
      throw new Error(
        `Failed to fetch price (${response.status} ${response.statusText})`
      );
    }

    const data = await response.json();
    currentPrice = parseFloat(data[0].price);

    marketCap = Math.floor(Number(currentSupply) * Number(currentPrice));

    console.log(`Successfully fetched NOT price: ${currentPrice} at MCAP ${marketCap}`);
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

// Function to fetch price from API
async function fetchSTXPrice() {
  try {
    const response = await fetch("https://api.velar.co/tokens/?symbol=STX");
    if (!response.ok) {
      throw new Error(
        `Failed to fetch price (${response.status} ${response.statusText})`
      );
    }

    const data = await response.json();
    stxPrice = data[0].price;
    console.log(`Successfully fetched STX price: ${stxPrice}`);
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

// Function to fetch circulating supply
async function fetchSupply() {
  try {
    const response = await fetch(
      "https://api.mainnet.hiro.so/v2/contracts/call-read/SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ/nope/get-total-supply",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: "SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ",
          arguments: [],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const hexResult = data.result;
    const finalPartHex = hexResult.slice(-12);
    const intValue = BigInt("0x" + finalPartHex);
    global.currentSupply = intValue;
    console.log(currentSupply);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to fetch current block height
async function fetchBlockHeight() {
  await fetchSTXPrice();

  try {
    const response = await fetch(
      "https://stacks-node-api.mainnet.stacks.co/extended/v1/block?limit=1"
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch block height (${response.status} ${response.statusText})`
      );
    }

    const data = await response.json();
    const newBlockHeight = data.results[0].height;

    if (blockHeight === 0) {
      await fetchNotSwaps(newBlockHeight);
    } else if (newBlockHeight > blockHeight) {
      for (let i = blockHeight + 1; i <= newBlockHeight; i++) {
        await fetchNotSwaps(i);
      }
    } else {
      console.log(`Same block height detected, nothing to update`);
    }

    blockHeight = newBlockHeight;
    console.log(`Successfully fetched height: ${blockHeight}`);
  } catch (error) {
    console.error("Error fetching block height:", error);
  }
}

// Function to fetch and filter NOT swaps
async function fetchNotSwaps(height) {
  try {
    const response = await fetch(
      `https://api.mainnet.hiro.so/extended/v2/blocks/${height}/transactions?limit=50`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch block height (${response.status} ${response.statusText})`
      );
    }

    const data = await response.json();
    const totalResults = data.total;
    const allResults = data.results;
    let offset = 50;

    while (offset < totalResults) {
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v2/blocks/${height}/transactions?limit=50&offset=${offset}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch block height (${response.status} ${response.statusText})`
        );
      }
      const newData = await response.json();
      allResults.push(...newData.results);
      offset += 50;
    }

    const filteredResults = allResults.filter((result) => {
      if (
        result.tx_status.includes("success") &&
        result.tx_type.includes("contract_call") &&
        result.contract_call.contract_id.includes("amm-pool-v2") &&
        result.contract_call.function_name.includes("swap-helper")
      ) {
        const hasMatchingArg = result.contract_call.function_args.some((arg) =>
          arg.repr.includes("token-wnot")
        );
        return hasMatchingArg;
      } else if (
        result.tx_status.includes("success") &&
        result.tx_type.includes("contract_call") &&
        result.contract_call.contract_id.includes("univ2-router") &&
        result.contract_call.function_name.includes(
          "swap-exact-tokens-for-tokens"
        )
      ) {
        const hasMatchingArg = result.contract_call.function_args.some((arg) =>
          arg.repr.includes("nope")
        );
        return hasMatchingArg;
      }

      return false;
    });

    const transferEvents = await fetchEventData(filteredResults);

    if (transferEvents.length > 0) {
      const swaps = [];

      transferEvents.forEach((transferEvent) => {
        const id = transferEvent.tx_id;
        const maker = transferEvent.events[0].asset.sender;
        let from, fromAmount, to, toAmount;
        const firstEvent = transferEvent.events[0];
        const lastEvent = transferEvent.events[transferEvent.events.length - 1];

        let foundSTX = false;
        if (firstEvent.event_type === "fungible_token_asset") {
          if (firstEvent.asset.asset_id.includes("NOT")) {
            from = "NOT";
            fromAmount = firstEvent.asset.amount / 1;
          } else {
            for (let i = 0; i < transferEvent.events.length; i++) {
              const event = transferEvent.events[i];
              if (event.event_type === "stx_asset") {
                from = "STX";
                fromAmount = event.asset.amount / 1000000;
                foundSTX = true;
                break;
              }
            }

            if (!foundSTX) {
              for (let i = 0; i < transferEvent.events.length; i++) {
                const event = transferEvent.events[i];
                if (event.event_type === "fungible_token_asset" && event.asset.asset_id.includes("alex")) {
                  from = "ALEX";
                  fromAmount = event.asset.amount / 100000000;
                  break;
                }
              }
            }
          }
        } else {
          from = "STX";
          fromAmount = firstEvent.asset.amount / 1000000;
        }

        let foundSTX2 = false;
        if (lastEvent.event_type === "fungible_token_asset") {
          if (lastEvent.asset.asset_id.includes("NOT")) {
            to = "NOT";
            toAmount = lastEvent.asset.amount / 1;
          } else {
            for (let i = transferEvent.events.length - 1; i > 0; i--) {
              const event = transferEvent.events[i];
              if (event.event_type === "stx_asset") {
                to = "STX";
                toAmount = event.asset.amount / 1000000;
                foundSTX2 = true;
                break;
              }
            }

            if (!foundSTX2) {
              for (let i = transferEvent.events.length - 1; i > 0; i--) {
                const event = transferEvent.events[i];
                if (event.event_type === "fungible_token_asset" && event.asset.asset_id.includes("alex")) {
                  from = "ALEX";
                  fromAmount = event.asset.amount / 100000000;
                  break;
                }
              }
            }
          }
        } else {
          to = "STX";
          toAmount = lastEvent.asset.amount / 1000000;
        }

        const type = from === "NOT" ? "sell" : "buy";

        const swap = {
          id: id,
          maker: maker,
          from: from,
          fromAmount: fromAmount,
          to: to,
          toAmount: toAmount,
          type: type,
          dex: transferEvent.dex,
        };

        swaps.push(swap);
      });

      console.log(swaps);

      const channelId = global.channelId;
      let channel = null;
      if (channelId) {
        channel = client.channels.cache.get(channelId);
      } else {
        console.error("Buy/sell channel has not been set.");
      }

      for (const swap of swaps) {
        const color = swap.type === "sell" ? "#FF0000" : "#00FF00";
        const title = swap.type === "sell" ? "New NOT Sell" : "New NOT Buy";

        let price = 0;
        let mcap = 0;

        if (swap.from === "ALEX" || swap.to === "ALEX") {
          price = global.currentPrice;
          mcap = global.marketCap;
        } else {
          price =
          swap.type === "sell"
            ? parseFloat((Number(stxPrice) * swap.toAmount) / swap.fromAmount)
            : parseFloat((Number(stxPrice) * swap.fromAmount) / swap.toAmount);
          mcap = Math.floor(price * Number(currentSupply));
        }


        console.log(price,mcap);
        const cUrl = swap.dex === "AlexLab" ? alexChartUrl : swap.dex === "Velar" ? velarChartUrl : "None";
        const txUrl = `https://explorer.hiro.so/txid/${swap.id}?chain=mainnet`;

        if (channel) {
          const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setURL(txUrl)
            .setDescription(
              buildDiscordMessage(
                swap.fromAmount,
                swap.toAmount,
                swap.from,
                swap.to,
                price,
                mcap,
                swap.dex
              )
            )
            .setTimestamp()
            .setFooter({
              text: `on Block ${height}`,
              iconURL:
                "https://bafkreieug75i7f74at6gailpsox52lgs2ct7zccht5nobik3giv4opkeuu.ipfs.dweb.link/",
            });

          await channel.send({ embeds: [embed] });
        } else {
          console.error(`Channel with ID ${channelId} not found.`);
        }

        if (swap.type === "buy" && swap.fromAmount >= 30) {
          sendTelegramMessage(
            buildTelegramMessage(
              title,
              swap.fromAmount,
              swap.toAmount,
              swap.from,
              swap.to,
              price,
              mcap,
              swap.dex,
              cUrl,
              txUrl
            )
          );
        }

        currentPrice = price;
        marketCap = mcap;
      }
    } else {
      console.log("No matching results found");
      const channelId = global.channelId;
      if (channelId) {
        const channel = client.channels.cache.get(channelId);
        if (channel) {
          console.log(`No new swaps on block ${height}`);
        } else {
          console.error(`Channel with ID ${channelId} not found.`);
        }
      } else {
        console.error("Buy/sell channel has not been set.");
      }
    }

    console.log(`Successfully fetched NOT swaps at: ${height}`);
  } catch (error) {
    console.error("Error fetching swaps:", error);
  }
}

// Fetch events data from filtered results
async function fetchEventData(filteredResults) {
  const transferEventsArray = [];

  for (const filteredResult of filteredResults) {
    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v1/tx/${filteredResult.tx_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const eventData = (await response.json()).events.filter(
        (event) =>
          event.asset &&
          event.asset.asset_event_type === "transfer" &&
          !event.asset.recipient.includes("univ2-share-fee-to")
      );

      let dexName = "None";
      if (filteredResult.contract_call.contract_id.includes("amm-pool-v2")) {
        dexName = "AlexLab";
      } else if (
        filteredResult.contract_call.contract_id.includes("univ2-router")
      ) {
        dexName = "Velar";
      }

      transferEventsArray.push({
        tx_id: filteredResult.tx_id,
        events: eventData,
        dex: dexName,
      });
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  }

  return transferEventsArray;
}

// Fetch functions at startup and every X seconds
async function startFetchingData() {
  try {
    await Promise.all([fetchPrice(), fetchSupply()]);

    await fetchBlockHeight();
    setInterval(fetchBlockHeight, 120000);
    setInterval(fetchSupply, 1200000);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

startFetchingData();

// Discord bot login
client.login(token);
