const config = require('../config')
let fs = require('fs')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
cmd({
    pattern: "alive",
    react: "🪀",
    alias: ["online","test","bot"],
    desc: "Check bot online or no.",
    category: "main",
    use: '.alive',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, umar, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

     await conn.sendMessage(from, { audio: fs.readFileSync('./src/alive.mp3') , ptt: true  , mimetype: 'audio/mpeg'}, { quoted: mek })  
    await conn.sendMessage(from, { image: { url: config.LOGO }, caption: config.ALIVE    , contextInfo:   { externalAdReply: {  showAdAttribution: true }}},{ quoted: mek })
                
                      /* ,headerType: 4,
                    contextInfo:{externalAdReply:{
                    title:`Alive Message`,
                    body:`Um4r719`,
                    thumbnail: { url: config.LOGO },
                    mediaType:1,
                    mediaUrl:`https://github.com/Um4r719/UD-MD`, 
                    sourceUrl: `https://github.com/Um4r719/UD-MD`
                    }}, { quoted: mek })*/
} catch (e) {
    reply ('' + e)
reply('*Error !!*')
l(e)
}
})


cmd({
    pattern: "ping",
    react: "📟",
    alias: ["speed"],
    desc: "Check bot\'s ping",
    category: "main",
    use: '.ping',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
var inital = new Date().getTime();
let ping = await conn.sendMessage(from , { text: '𝙿𝙸𝙽𝙶'  }, { quoted: mek } )
var final = new Date().getTime();
await conn.sendMessage(from, { delete: ping.key })
return await conn.sendMessage(from , { text: '*Pong*\n *' + (final - inital) + ' ms* '  }, { quoted: mek } )
} catch (e) {
reply('*Error !!*')
l(e)
}
})










cmd({

    pattern: "menu",

    react: "🪀",

    alias: ["panel","list","commands"],

    desc: "Get bot\'s command list.",

    category: "main",

    use: '.menu',

    filename: __filename

},

async(conn, mek, m,{from, l, quoted, body, isCmd, umar, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {

try{

let menumg =`*Hello* ${pushname}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━
      *Welcome to UD MD Full Cammand List*
┗━━━━━━━━━━━━━━━━━━━━━━━━━━

*Created By Umar Rehman👨🏻‍💻*

\`\`\`\
╭──❮ 𝗗𝗢𝗪𝗪𝗡𝗟𝗢𝗔𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 ❯
│
│📖 COMMAND: .song
│ℹ️ Download song from yt
│ 
│📖 COMMAND: .apk
│ℹ️ Download apk from playstore
│ 
│📖 COMMAND: .video
│ℹ️ Download video from yt
│ 
│📖 COMMAND: .fb
│ℹ️ Download  video from fb
│ 
│📖 COMMAND: .tk
│ℹ️ Download video from tiktok
│ 
│📖 COMMAND: .ig
│ℹ️ Download video from ig
│ 
│📖 COMMAND: .gdrive
│ℹ️ Download drive files
│ 
│📖 COMMAND: .wamod
│ℹ️ Download wamod apk
│
│📖 COMMAND: .img
│ℹ️ Download image
│
│📖 COMMAND: .xvideo
│ℹ️ Download xxx video
╰────────────⦁ 

╭──❮ 𝗦𝗘𝗔𝗥𝗖𝗛 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 ❯
│
│📖 COMMAND: .yts
│ℹ️ Serch videos from yt
╰────────────⦁  

╭──❮‍ 𝗣𝗥𝗜𝗠𝗔𝗥𝗬 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 ❯
│
│📖 COMMAND: .alive
│ℹ️ Check online or not
│  
│📖 COMMAND: .ping
│ℹ️ Check bot speed
│  
│📖 COMMAND: .menu
│ℹ️ Nero main menu
╰────────────⦁

╭──❮ 𝗢𝗧𝗛𝗘𝗥 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 ❯
│
│📖 COMMAND: .hirunews/news
│ℹ️ Get news result for life
│ 
│📖 COMMAND: .wabeta
│ℹ️ Get whatsapp beta news
│ 
│📖 COMMAND: .sitech
│ℹ️ Get tech news
│ 
│📖 COMMAND: .nasa
│ℹ️ Get nasa news
╰────────────⦁

╭──❮ 𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 ❯
│
│📖 COMMAND: .mute
│ℹ️ Mute group
│
│📖 COMMAND: .unmute
│ℹ️ Unmute group
│
│📖 COMMAND: .left
│ℹ️ left group
│
│📖 COMMAND: .jid
│ℹ️ group jid
╰────────────⦁
╰────────────⦁
\`\`\`\``

 await conn.sendMessage(from, { audio: fs.readFileSync('./src/menu.mp3') , ptt: true  , mimetype: 'audio/mpeg'}, { quoted: mek })  
await conn.sendMessage(from, { image: { url: config.LOGO }, caption: menumg }, { quoted: mek })

} catch (e) {

}

})
