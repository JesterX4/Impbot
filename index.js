require("dotenv").config();

const {
Client,
GatewayIntentBits,
Partials,
PermissionsBitField,
AuditLogEvent
} = require("discord.js");

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

client.login(process.env.TOKEN);

/* =========================
BURAYI DOLDUR
========================= */

const PREFIX = "!imp";

const GUARD_LOG_CHANNEL = "1471548872034750568";
const BAN_LOG_CHANNEL = "1470173736010256505";

const SAFE_ROLE_NAME = "Boss"; // Guarddan etkilenmeyecek rol
const AUTO_ROLE_ID = "1470170975596314708";

/* =========================
LOG FONKSİYONLARI
========================= */

function guardLog(guild, message) {
const channel = guild.channels.cache.get(GUARD_LOG_CHANNEL);
if (channel) channel.send(message);
}

function banLog(guild, message) {
const channel = guild.channels.cache.get(BAN_LOG_CHANNEL);
if (channel) channel.send(message);
}

/* =========================
READY
========================= */

client.once("ready", () => {
console.log(`Bot aktif: ${client.user.tag}`);
client.user.setPresence({
activities: [{ name: ".gg/İmperium" }],
status: "online"
});
});

/* =========================
OTOROL
========================= */

const AUTO_ROLE_ID = "1470170975596314708";

client.on("guildMemberAdd", async (member) => {
try {
const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
if (!role) return console.log("New User rolü bulunamadı.");

await member.roles.add(role);
console.log(`${member.user.tag} kullanıcısına New User rolü verildi.`);
} catch (err) {
console.error("Otorol hatası:", err);
}
});

/* =========================
AFK SİSTEM
========================= */

const { joinVoiceChannel } = require("@discordjs/voice");

if (command === `${PREFIX}afk`) {

if (!message.member.voice.channel)
return message.reply("Önce bir ses kanalına gir.");

joinVoiceChannel({
channelId: message.member.voice.channel.id,
guildId: message.guild.id,
adapterCreator: message.guild.voiceAdapterCreator,
});

message.reply("Bot AFK için sese girdi.");
}

if (command === `${PREFIX}ban`) {
if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
return message.reply("Ban yetkin yok.");

const user =
message.mentions.users.first() ||
client.users.cache.get(args[1]);

if (!user) return message.reply("Kullanıcı belirt.");

message.guild.members.ban(user.id)
.then(() => message.reply("Banlandı."))
.catch(() => message.reply("Ban atılamadı."));
}
});

/* =========================
KANAL SİLME GUARD
========================= */

client.on("channelDelete", async (channel) => {

const entry = await channel.guild.fetchAuditLogs({
type: AuditLogEvent.ChannelDelete,
limit: 1
}).then(audit => audit.entries.first());

if (!entry) return;

const executor = entry.executor;
const member = await channel.guild.members.fetch(executor.id).catch(() => null);
if (!member) return;

if (executor.id === channel.guild.ownerId) {
guardLog(channel.guild, `👑 Owner kanal sildi: ${executor.tag}`);
return;
}

if (member.roles.cache.some(r => r.name === SAFE_ROLE_NAME)) {
guardLog(channel.guild, `🛡️ Whitelist rol kanal sildi: ${executor.tag}`);
return;
}

if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
await member.ban({ reason: "Yetkisiz kanal silme" }).catch(() => {});
guardLog(channel.guild, `🚨 ${executor.tag} yetkisiz kanal sildi ve banlandı.`);
} else {
guardLog(channel.guild, `⚠️ Yetkili kanal sildi: ${executor.tag}`);
}
});

/* =========================
ROL SİLME GUARD
========================= */

client.on("roleDelete", async (role) => {

const entry = await role.guild.fetchAuditLogs({
type: AuditLogEvent.RoleDelete,
limit: 1
}).then(audit => audit.entries.first());

if (!entry) return;

const executor = entry.executor;
const member = await role.guild.members.fetch(executor.id).catch(() => null);
if (!member) return;

if (executor.id === role.guild.ownerId) {
guardLog(role.guild, `👑 Owner rol sildi: ${executor.tag}`);
return;
}

if (member.roles.cache.some(r => r.name === SAFE_ROLE_NAME)) {
guardLog(role.guild, `🛡️ Whitelist rol rol sildi: ${executor.tag}`);
return;
}

if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
await member.ban({ reason: "Yetkisiz rol silme" }).catch(() => {});
guardLog(role.guild, `🚨 ${executor.tag} yetkisiz rol sildi ve banlandı.`);
} else {
guardLog(role.guild, `⚠️ Yetkili rol sildi: ${executor.tag}`);
}
});

/* =========================
BAN LOG AYRI
========================= */

client.on("guildBanAdd", async (ban) => {

const entry = await ban.guild.fetchAuditLogs({
type: AuditLogEvent.MemberBanAdd,
limit: 1
}).then(audit => audit.entries.first());

if (!entry) return;

const executor = entry.executor;
banLog(ban.guild, `🔨 ${executor.tag} ban attı → ${ban.user.tag}`);
});


