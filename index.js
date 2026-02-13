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

/* ================= CONFIG ================= */

const PREFIX = "!imp";

const GUARD_LOG_CHANNEL = "1471548872034750568";
const MOD_LOG_CHANNEL = "1470173736010256505";
const VOICE_CHANNEL_ID = "1470577913819697348";
const AUTO_ROLE_ID = "1470170975596314708";

const SAFE_ROLE_ID = "1470171744156516462";

/* ================= READY ================= */

client.once("ready", () => {
console.log(`Bot aktif: ${client.user.tag}`);

const guild = client.guilds.cache.first();
const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);

if (channel) {
joinVoiceChannel({
channelId: channel.id,
guildId: guild.id,
adapterCreator: guild.voiceAdapterCreator
});
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

/* ================= GUARD (KANAL DELETE LIMIT 3) ================= */

const deleteLimit = new Map();

client.on("channelDelete", async channel => {

const entry = await channel.guild.fetchAuditLogs({
type: AuditLogEvent.ChannelDelete,
limit: 1
}).then(audit => audit.entries.first());

if (!entry) return;

const executor = entry.executor;
const member = await channel.guild.members.fetch(executor.id).catch(() => null);
if (!member) return;

if (executor.id === channel.guild.ownerId) return;
if (member.roles.cache.some(r => r.name === SAFE_ROLE_NAME)) return;

const count = deleteLimit.get(executor.id) || 0;
deleteLimit.set(executor.id, count + 1);

if (deleteLimit.get(executor.id) >= 3) {

await member.ban({ reason: "3 Kanal Silme (Guard)" }).catch(() => {});

const log = channel.guild.channels.cache.get(GUARD_LOG_CHANNEL);
if (log) log.send(`🚨 ${executor.tag} 3 kanal sildi ve banlandı.`);

deleteLimit.delete(executor.id);
}
});

/* ================= TOKEN ================= */

client.login(process.env.TOKEN);