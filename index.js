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

client.once("ready", async () => {
console.log(`Bot aktif: ${client.user.tag}`);

client.user.setPresence({
activities: [{ name: ".gg/İmperium" }],
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

/* ================= GUARD (KANAL DELETE LIMIT 1) ================= */

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

if (deleteLimit.get(executor.id) >= 1) {

await member.ban({ reason: "3 Kanal Silme (Guard)" }).catch(() => {});

const log = channel.guild.channels.cache.get(GUARD_LOG_CHANNEL);
if (log) log.send(`🚨 ${executor.tag} 3 kanal sildi ve banlandı.`);

deleteLimit.delete(executor.id);
}
});

/* ================= LOG KANALLARI ============ */

const { EmbedBuilder } = require('discord.js');

// --- AYARLAR ---
const GİRİŞ_KANALI_ID = '1472966655553306674'; // Giriş log kanalının ID-sini bura yaz
const ÇIXIŞ_KANALI_ID = '1472966592722894980'; // Çıxış log kanalının ID-sini bura yaz
// ---------------

// Biri serverə girəndə (Giriş Log)
client.on('guildMemberAdd', (member) => {
    const channel = member.guild.channels.cache.get(GİRİŞ_KANALI_ID);
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#00FF00') // Yaşıl rəng
        .setTitle('📥 Serverə Giriş Edildi')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .addFields(
            { name: 'Nickname:', value: `${member.user.tag}`, inline: false },
            { name: 'İstifadəçi ID:', value: `${member.id}`, inline: false }
        )
        .setFooter({ text: 'Xoş gəldin!' })
        .setTimestamp();

    channel.send({ embeds: [welcomeEmbed] });
});

// Biri serverdən çıxanda (Çıxış Log)
client.on('guildMemberRemove', (member) => {
    const channel = member.guild.channels.cache.get(ÇIXIŞ_KANALI_ID);
    if (!channel) return;

    const leaveEmbed = new EmbedBuilder()
        .setColor('#FF0000') // Qırmızı rəng
        .setTitle('📤 Serverdən Çıxış Edildi')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .addFields(
            { name: 'Nickname:', value: `${member.user.tag}`, inline: false },
            { name: 'İstifadəçi ID:', value: `${member.id}`, inline: false }
        )
        .setFooter({ text: 'Xoş Getdin.' })
        .setTimestamp();

    channel.send({ embeds: [leaveEmbed] });

});

const NICKNAME_LOG_KANALI_ID = '1472977688212930743'; // Ad dəyişmə log kanalının ID-si

client.on('guildMemberUpdate', (oldMember, newMember) => {
    // Kanalı yoxla
    const channel = newMember.guild.channels.cache.get(NICKNAME_LOG_KANALI_ID);
    if (!channel) return;

    // Əgər server daxili ləqəb (Nickname) dəyişibsə
    if (oldMember.nickname !== newMember.nickname) {
        const oldNick = oldMember.nickname || oldMember.user.username;
        const newNick = newMember.nickname || newMember.user.username;

        const nickEmbed = new EmbedBuilder()
            .setColor('#FFA500') // Narıncı rəng
            .setTitle('📝 Ləqəb Dəyişdirildi')
            .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Köhnə Ləqəb:', value: `\`${oldNick}\``, inline: true },
                { name: 'Yeni Ləqəb:', value: `\`${newNick}\``, inline: true },
                { name: 'İstifadəçi ID:', value: `${newMember.id}`, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: newMember.user.tag });

        channel.send({ embeds: [nickEmbed] });
    }
});

// Əgər istifadəçi ümumi Discord adını (Username) dəyişibsə
client.on('userUpdate', (oldUser, newUser) => {
    if (oldUser.username !== newUser.username) {
        // Botun olduğu bütün serverləri yoxlayır ki, log kanalını tapsın
        client.guilds.cache.forEach(guild => {
            const channel = guild.channels.cache.get(NICKNAME_LOG_KANALI_ID);
            if (!channel) return;

            const userUpdateEmbed = new EmbedBuilder()
                .setColor('#3498db') // Mavi rəng
                .setTitle('👤 İstifadəçi Adı Dəyişdi')
                .setThumbnail(newUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Köhnə Ad:', value: `\`${oldUser.tag}\``, inline: true },
                    { name: 'Yeni Ad:', value: `\`${newUser.tag}\``, inline: true },
                    { name: 'İstifadəçi ID:', value: `${newUser.id}`, inline: false }
                )
                .setTimestamp();

            channel.send({ embeds: [userUpdateEmbed] });
        });
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