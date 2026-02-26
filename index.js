require("dotenv").config();

const {
Client,
GatewayIntentBits,
Partials,
PermissionsBitField,
AuditLogEvent
} = require("discord.js");

const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildVoiceStates,
GatewayIntentBits.GuildBans
],
partials: [Partials.GuildMember]
});
gatewayint

/* ================= CONFIG ================= */

const PREFIX = "!";

const MOD_LOG_CHANNEL = "1476710644840661073";
const VOICE_CHANNEL_ID = "1474885488379953337";
const AUTO_ROLE_ID = "1476254250165211220";


/* ================= READY ================= */

client.once("ready", async () => {
console.log(`Bot aktif: ${client.user.tag}`);

client.user.setPresence({
activities: [{ name: ".gg/MontanaRP" }],
status: "online"
});

const guild = client.guilds.cache.first();
if (!guild) return;

const channel = guild.channels.cache.get("1470577913819697348"); // buraya ses kanal ID

if (!channel) {
console.log("Ses kanalı bulunamadı.");
return;
}

try {
joinVoiceChannel({
channelId: channel.id,
guildId: guild.id,
adapterCreator: guild.voiceAdapterCreator,
selfDeaf: true
});
console.log("Ses kanalına bağlandı.");
} catch (err) {
console.log("Ses bağlantı hatası:", err);
}
});

/* ================= OTOROL ================= */

client.on("guildMemberAdd", member => {
const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
if (role) member.roles.add(role).catch(() => {});
});

/* ================= BAN & KICK KOMUT ================= */

client.on("messageCreate", async message => {
if (message.author.bot) return;
if (!message.content.startsWith(PREFIX)) return;

const args = message.content.split(" ");
const command = args[0];

if (command === `${PREFIX}ban`) {

if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
return message.reply("Yetkin yok.");

const user = message.mentions.members.first();
if (!user) return message.reply("Kullanıcı belirt.");

await user.ban().catch(() => message.reply("Ban atılamadı."));

const log = message.guild.channels.cache.get(MOD_LOG_CHANNEL);
if (log) log.send(`🔨 ${message.author.tag} → ${user.user.tag} banlandı.`);
}

if (command === `${PREFIX}kick`) {

if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
return message.reply("Yetkin yok.");

const user = message.mentions.members.first();
if (!user) return message.reply("Kullanıcı belirt.");

await user.kick().catch(() => message.reply("Kick atılamadı."));

const log = message.guild.channels.cache.get(MOD_LOG_CHANNEL);
if (log) log.send(`👢 ${message.author.tag} → ${user.user.tag} kicklendi.`);
}
});



/* ================= TOKEN ================= */

client.login(process.env.TOKEN);

process.on("unhandledRejection", err => {
console.log("Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", err => {
console.log("Uncaught Exception:", err);
});

const express = require("express");
const app = express();

app.get("/", (req, res) => {
res.send("Bot is alive!");
});

app.listen(process.env.PORT, "0.0.0.0", () => {
console.log("Web server running on port:", process.env.PORT);
});