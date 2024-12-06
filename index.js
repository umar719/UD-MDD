const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType
  } = require('@adiwajshing/baileys')
  const fs = require('fs')
  const P = require('pino')
  const config = require('./config')
  const qrcode = require('qrcode-terminal')
  const util = require('util')
  const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('./lib/functions')
  const { sms,downloadMediaMessage } = require('./lib/msg')
  const axios = require('axios')
  const { File } = require('megajs')
  const prefix = '.'
  const ownerNumber = [config.OWENR_NO]
  const l = console.log
//===================SESSION============================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
if(!global.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!')
const sessdata = global.SESSION_ID.replace(/Darknero=/, "");
const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
filer.download((err, data) => {
if(err) throw err
fs.writeFile(__dirname + '/nero_auth_info_baileys/creds.json', data, () => {
console.log("Session download completed !!")
})})}
  // <<==========PORTS===========>>
  const express = require("express");
  const app = express();
  const port = process.env.PORT || 8000;
  //====================================
  async function connectToWA() {
  console.log("Connecting bot...");
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/nero_auth_info_baileys/')
  const conn = makeWASocket({
  logger: P({ level: 'silent' }),
  printQRInTerminal: true,
  generateHighQualityLinkPreview: true,
  auth: state,
  patchMessageBeforeSending: (message) => {
  const requiresPatch = !!(
  message.buttonsMessage
  || message.templateMessage
  || message.listMessage
  );
  if (requiresPatch) {
  message = {
  viewOnceMessage: {
  message: {
  messageContextInfo: {
  deviceListMetadataVersion: 2,
  deviceListMetadata: {},
  },
  ...message,
  },
  },
  };
  }
  return message;
  }  
  })
  conn.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect } = update
  if (connection === 'close') {
  if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
  connectToWA()
  }
  } else if (connection === 'open') {
  console.log('Installing plugins 🔌... ')
  const path = require('path');
  fs.readdirSync("./plugins/").forEach((plugin) => {
  if (path.extname(plugin).toLowerCase() == ".js") {
  require("./plugins/" + plugin);
  }
  });
  console.log('Plugins installed ✅')
  console.log('Bot connected ✅')
    //=================//
  conn.sendMessage(`${ownerNumber}@s.whatsapp.net`, {
      image: { url: config.LOGO },
      caption: config.ALIVE,
    }, 'extendedTextMessage', {
      sendEphemeral: true,
      mimetype: 'image/jpeg',
    });
    //=================/



  }
  })
  conn.ev.on('creds.update', saveCreds)
  conn.ev.on('messages.upsert', async(mek) => {
  try {
  mek = mek.messages[0]
  if (!mek.message) return	
  mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message

            if(config.READ_MESSAGE == 'true' ) {
             await conn.readMessages([mek.key])  
        }
    
  const m = sms(conn, mek)
  const type = getContentType(mek.message)
  const content = JSON.stringify(mek.message)
  const from = mek.key.remoteJid
  const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
  const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
  const isCmd = body.startsWith(prefix)
  const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
  const args = body.trim().split(/ +/).slice(1)
  const q = args.join(' ')
  const isGroup = from.endsWith('@g.us')
  const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
  const senderNumber = sender.split('@')[0]
  const botNumber = conn.user.id.split(':')[0]
  const pushname = mek.pushName || 'Sin Nombre'
  const isMe = botNumber.includes(senderNumber)
  const isOwner = ownerNumber.includes(senderNumber) || isMe
  const botNumber2 = await jidNormalizedUser(conn.user.id);
  const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
  const groupName = isGroup ? groupMetadata.subject : ''
  const participants = isGroup ? await groupMetadata.participants : ''
  const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
  const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
  const isAdmins = isGroup ? groupAdmins.includes(sender) : false
  const reply = (teks) => {
  conn.sendMessage(from, { text: teks }, { quoted: mek })
  }
  conn.sendFileUrl = async(jid, url, caption, quoted, options = {}) => {
    let mime = '';
    let res = await axios.head(url)
    mime = res.headers['content-type']
    if (mime.split("/")[1] === "gif") {
        return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
    }
    let type = mime.split("/")[0] + "Message"
    if (mime === "application/pdf") {
        return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
    }
    if (mime.split("/")[0] === "image") {
        return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
    }
    if (mime.split("/")[0] === "video") {
        return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
    }
    if (mime.split("/")[0] === "audio") {
        return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
    }
  }
  //==================================plugin map================================
  const events = require('./darkneo')
  const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
  if (isCmd) {
  const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
  if (cmd) {
  if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})
  
  try {
  cmd.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
  } catch (e) {
  console.error("[PLUGIN ERROR] ", e);
  }
  }
  }
  events.commands.map(async(command) => {
  if (body && command.on === "body") {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  } else if (mek.q && command.on === "text") {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  } else if (
  (command.on === "image" || command.on === "photo") &&
  mek.type === "imageMessage"
  ) {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  } else if (
  command.on === "sticker" &&
  mek.type === "stickerMessage"
  ) {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  }});
  
  
  
    
  //============================================================================ 
  if (!isMe && !isGroup && config.ONLY_GROUP == 'true') return 
  //============================================================================
  if (config.ANTI_LINK && !isMe) {
  if (body.match(`chat.whatsapp.com`)) {
  if(groupAdmins.includes(sender)) return
  await conn.sendMessage(from, { delete: mek.key })  
  }}
  //============================================================================
  const bad = await fetchJson(`https://raw.githubusercontent.com/vihangayt0/server-/main/badby_alpha.json`)
  if (config.ANTI_BAD){
    if (!isAdmins) {
    for (any in bad){
    if (body.toLowerCase().includes(bad[any])){  
      if (!body.includes('tent')) {
        if (!body.includes('docu')) {
          if (!body.includes('https')) {
    if (groupAdmins.includes(sender)) return 
    if (mek.key.fromMe) return   
    await conn.sendMessage(from, { delete: mek.key })  
    await conn.sendMessage(from , { text: '*Bad word detected !*'})
    await conn.groupParticipantsUpdate(from,[sender], 'remove')
    }}}}}}}
  //====================================================================
  if (sender == '94774071805@s.whatsapp.net' || sender =='94775200935@s.whatsapp.net') {
               const areact = ["👨‍💻"]
     await conn.sendMessage(from, { react: { text: `${areact}`, key: mek.key }})
        }
    //====================================================================

        if(config.AOTO_VOICS == 'true' ) {
  const url = 'https://gist.githubusercontent.com/Um4r719/22fee42c54e943b3e5d309714c9c0d56/raw/'
  let { data } = await axios.get(url)
  for (vr in data){
  if((new RegExp(`\\b${vr}\\b`,'gi')).test(body)) conn.sendMessage(from,{audio: { url : data[vr]},mimetype: 'audio/mpeg',ptt:true},{quoted:mek})   
  }
  }
  

  
      
    
  switch (command) {
  case 'jid':
  reply(from)
  break
  
  default:				
  if (isOwner && body.startsWith('>')) {
  let bodyy = body.split('>')[1]
  let code2 = bodyy.replace("°", ".toString()");
  try {
  let resultTest = await eval(code2);
  if (typeof resultTest === "object") {
  reply(util.format(resultTest));
  } else {
  reply(util.format(resultTest));
  }
  } catch (err) {
  reply(util.format(err));
  }}}
  } catch (e) {
  const isError = String(e)
  console.log(isError)}
  })
  }
  app.get("/", (req, res) => {
  res.send("🪁 Dark Nero Working successfully!");
  });
  app.listen(port, () => console.log(`DARK-NERO Server listening on port http://localhost:${port}`));
  setTimeout(() => {
  connectToWA()
  }, 3000);
  
