const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')


// Utility function for delay
const pluginSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


// Delay in milliseconds
const KICK_DELAY_MS = 2000; // Change this value for faster/slower execution

cmd({
    pattern: "kickall",
    desc: "Kicks all non-admin members from the group.",
    react: "👏",
    category: "group",
    filename: __filename,
},           
async(conn, mek, m, { 
    from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, 
    botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, 
    participants, groupAdmins, isBotAdmins, isAdmins, reply 
}) => {
    try {
        // Check permissions
        if (!isAdmins) return reply(`Only group admins can use this command.`);
        if (!isOwner) return reply(`Only the bot owner can use this command.`);
        if (!isGroup) return reply(`This command is only available in groups.`);
        if (!isBotAdmins) return reply(`I need admin privileges to kick members.`);

        // Fetch non-admin members
        const allParticipants = groupMetadata.participants;
        const nonAdminParticipants = allParticipants.filter(member => 
            !groupAdmins.includes(member.id) && member.id !== conn.user.id
        );

        if (nonAdminParticipants.length === 0) {
            return reply('No non-admin members found to kick.');
        }

        reply(`Starting to kick ${nonAdminParticipants.length} non-admin members...`);

        // Remove participants with rate limiting
        for (let participant of nonAdminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(KICK_DELAY_MS); // Use the defined delay in milliseconds
            } catch (error) {
                console.error(`Failed to remove ${participant.id}:`, error);
            }
        }

        reply(`Successfully removed all non-admin members from the group.`);
    } catch (e) {
        console.error('Error kicking users:', e);
        reply('An error occurred while trying to remove members. Please try again.');
    }
});

cmd({
    pattern: "joinrequests",
    desc: "Get list of participants who requested to join the group",
    react: "📋",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, q, reply, isGroup }) => {
    if (!isGroup) return reply("This command can only be used in a group chat.");

    try {
        const groupJid = from;  // Use the group ID from the message context
        console.log(`Attempting to fetch pending requests for group: ${groupJid}`);
        
        const response = await conn.groupRequestParticipantsList(groupJid);
        console.log(response); // Log the response for debugging

        if (response.length > 0) {
            let participantList = "Pending Requests to Join the Group:\n";
            let mentions = []; // Array to hold participant mentions

            response.forEach(participant => {
                const jid = participant.jid;
                participantList += `😻 @${jid.split('@')[0]}\n`; // Format the mention
                mentions.push(jid); // Add JID to mentions array
            });

            // Send the reply with mentions
            await conn.sendMessage(from, {
                text: participantList,
                mentions: mentions // Include mentions array here
            });
        } else {
            reply("No pending requests to join the group.");
        }
    } catch (e) {
        console.error(`Error fetching participant requests: ${e.message}`); // Log specific error message
        reply("⚠️ An error occurred while fetching the pending requests. Please try again later.");
    }
});

cmd({
    pattern: "allreq",
    desc: "Approve or reject all join requests",
    react: "✅",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, reply, isGroup }) => {
    if (!isGroup) return reply("This command can only be used in a group chat.");

    const action = m.body.includes("approve") ? "approve" : "reject"; // Determine action based on the command

    try {
        // Fetch all pending requests
        const pendingRequests = await conn.groupRequestParticipantsList(from);
        
        if (pendingRequests.length === 0) {
            return reply("There are no pending requests to manage.");
        }

        // Format mentions and JIDs for approval/rejection
        let participantList = "Pending Requests to Join the Group:\n";
        let mentions = [];
        let jids = [];

        pendingRequests.forEach(participant => {
            const jid = participant.jid;
            participantList += `😻 @${jid.split('@')[0]}\n`; // Format the mention
            mentions.push(jid); // Add JID to mentions array
            jids.push(jid); // Add JID to the jids array for action
        });

        // Send the pending requests as a message
        await conn.sendMessage(from, {
            text: participantList,
            mentions: mentions
        });

        // Proceed to approve/reject all requests
        const updateResponse = await conn.groupRequestParticipantsUpdate(from, jids, action);
        console.log(updateResponse); // Log the response for debugging

        // Send a confirmation message
        reply(`Successfully ${action}ed all join requests.`);
    } catch (e) {
        console.error(`Error updating participant requests: ${e.message}`); // Log specific error message
        reply("⚠️ An error occurred while processing the request. Please try again later.");
    }
});

// Duration constants in seconds
const WA_DEFAULT_EPHEMERAL_24H = 86400;  // 24 hours
const WA_DEFAULT_EPHEMERAL_7D = 604800;  // 7 days
const WA_DEFAULT_EPHEMERAL_90D = 7776000; // 90 days

cmd({
    pattern: "disappear",
    react: "🌪️",
    alias: ["dm"],
    desc: "Turn on/off disappearing messages.",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, isAdmins, args }) => {
    if (!isGroup) {
        await conn.sendMessage(from, { text: 'This command can only be used in groups.' });
        return;
    }
    
    if (!isAdmins) {
        await conn.sendMessage(from, { text: 'Only admins can turn on/off disappearing messages.' });
        return;
    }

    const action = args[0];

    if (action === 'on') {
        const duration = args[1];
        let ephemeralDuration;

        switch (duration) {
            case '24h':
                ephemeralDuration = WA_DEFAULT_EPHEMERAL_24H;
                break;
            case '7d':
                ephemeralDuration = WA_DEFAULT_EPHEMERAL_7D;
                break;
            case '90d':
                ephemeralDuration = WA_DEFAULT_EPHEMERAL_90D;
                break;
            default:
                await conn.sendMessage(from, { text: 'Invalid duration! Use `24h`, `7d`, or `90d`.' });
                return;
        }

        // Turn on disappearing messages with the specified duration
        await conn.sendMessage(
            from,
            { disappearingMessagesInChat: ephemeralDuration }
        );
        await conn.sendMessage(from, { text: `Disappearing messages are now ON for ${duration}.` });
    } else if (action === 'off') {
        // Turn off disappearing messages
        await conn.sendMessage(
            from,
            { disappearingMessagesInChat: false }
        );
        await conn.sendMessage(from, { text: 'Disappearing messages are now OFF.' });
    } else {
        await conn.sendMessage(from, { text: 'Please use `!disappear on <duration>` or `!disappear off`.' });
    }
});

// Command to send a disappearing message
cmd({
    pattern: "senddm",
    react: "🌪️",
    alias: ["senddisappear"],
    desc: "Send a disappearing message.",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, isAdmins, args }) => {
    if (!isGroup) {
        await conn.sendMessage(from, { text: 'This command can only be used in groups.' });
        return;
    }
    
    if (!args.length) {
        await conn.sendMessage(from, { text: 'Please provide a message to send.' });
        return;
    }

    const message = args.join(' '); // Join the args to create the message text

    // Send the disappearing message
    await conn.sendMessage(from, { text: message }, { ephemeralExpiration: WA_DEFAULT_EPHEMERAL_7D }); // Default duration is set to 7 days
});

cmd({
    pattern: "mute",
    react: "🔇",
    alias: ["close","f_mute"],
    desc: "Change to group settings to only admins can send messages.",
    category: "group",
    use: '.mute',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
await conn.groupSettingUpdate(from, 'announcement')
 await conn.sendMessage(from , { text: `*Group Chat closed by Admin ${pushname}* 🔇` }, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
})


cmd({
    pattern: "unmute",
    react: "🔇",
    alias: ["open","f_unmute"],
    desc: "Change to group settings to all members can send messages.",
    category: "group",
    use: '.unmute',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
await conn.groupSettingUpdate(from, 'not_announcement')
 await conn.sendMessage(from , { text: `*Group Chat Opened by Admin ${pushname}* 🔇` }, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )


cmd({
    pattern: "lockgs",
    react: "🔇",
    alias: ["lockgsettings"],
    desc: "Change to group settings to only admins can edit group info",
    category: "group",
    use: '.lockgs',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
await conn.groupSettingUpdate(from, 'locked')
 await conn.sendMessage(from , { text: `*Group settings Locked* 🔒` }, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )


cmd({
    pattern: "unlockgs",
    react: "🔓",
    alias: ["unlockgsettings"],
    desc: "Change to group settings to all members can edit group info",
    category: "group",
    use: '.unlockgs',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
await conn.groupSettingUpdate(from, 'unlocked')
 await conn.sendMessage(from , { text: `*Group settings Unlocked* 🔓` }, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )


cmd({
    pattern: "leave",
    react: "🔓",
    alias: ["left","kickme","f_leave","f_left","f-left"],
    desc: "To leave from the group",
    category: "group",
    use: '.leave',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm) }
 await conn.sendMessage(from , { text: `*Good Bye All* 👋🏻` }, { quoted: mek } )
 await conn.groupLeave(from) 
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )


cmd({
    pattern: "updategname",
    react: "🔓",
    alias: ["upgname","gname"],
    desc: "To Change the group name",
    category: "group",
    use: '.updategname',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
if (!q) return reply("*Please write the new Group Subject* 🖊️")
await conn.groupUpdateSubject(from, q )
 await conn.sendMessage(from , { text: `✔️ *Group name Updated*` }, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )


cmd({
    pattern: "updategdesc",
    react: "🔓",
    alias: ["upgdesc","gdesc"],
    desc: "To Change the group description",
    category: "group",
    use: '.updategdesc',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
if (!q) return reply("*Please write the new Group Description* 🖊️")
await conn.groupUpdateDescription(from, q )
 await conn.sendMessage(from , { text: `✔️ *Group Description Updated*` }, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )


cmd({
    pattern: "join",
    react: "📬",
    alias: ["joinme","f_join"],
    desc: "To Join a Group from Invite link",
    category: "group",
    use: '.join < Group Link >',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isCreator && !isDev && !isOwner && !isMe) return reply(msr.own_cmd)
if (!q) return reply("*Please write the Group Link*️ 🖇️")
 let result = args[0].split('https://chat.whatsapp.com/')[1]
 await conn.groupAcceptInvite(result)
     await conn.sendMessage(from , { text: `✔️ *Successfully Joined*`}, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )



cmd({
    pattern: "invite",
    react: "🖇️",
    alias: ["grouplink","glink"],
    desc: "To Get the Group Invite link",
    category: "group",
    use: '.invite',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
const code = await conn.groupInviteCode(from)

 await conn.sendMessage(from , { text: `🖇️ *Group Link*\n\nhttps://chat.whatsapp.com/${code}`}, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )



cmd({
    pattern: "revoke",
    react: "🖇️",
    alias: ["revokegrouplink","resetglink","revokelink","f_revoke"],
    desc: "To Reset the group link",
    category: "group",
    use: '.revoke',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
await conn.groupRevokeInvite(from)
 await conn.sendMessage(from , { text: `*Group link Reseted* ⛔`}, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )


cmd({
    pattern: "kick",
    react: "🥏",
    alias: ["remove"],
    desc: "To Remove a participant from Group",
    category: "group",
    use: '.kick',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, mentionByTag , args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
  
		let users = mek.mentionedJid ? mek.mentionedJid[0] : mek.msg.contextInfo.participant || false;
			if (!users) return reply("*Couldn't find any user in context* ❌")

			await conn.groupParticipantsUpdate(from, [users], "remove")
			await conn.sendMessage(from,{text:`*Successfully removed*  ✔️`},{quoted:mek })
	
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )


cmd({
    pattern: "promote",
    react: "🥏",
    alias: ["addadmin"],
    desc: "To Add a participatant as a Admin",
    category: "group",
    use: '.promote',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, mentionByTag , args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)   
	
		let users = mek.mentionedJid ? mek.mentionedJid[0] : mek.msg.contextInfo.participant || false;
	
	if (!users) return reply("*Couldn't find any user in context* ❌")
	
		const groupAdmins = await getGroupAdmins(participants) 
		if  ( groupAdmins.includes(users)) return reply('❗ *User Already an Admin*  ✔️')
		    await conn.groupParticipantsUpdate(from, [users], "promote")
			await conn.sendMessage(from,{text:`*User promoted as an Admin*  ✔️`},{quoted:mek })
	
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )

cmd({
    pattern: "demote",
    react: "🥏",
    alias: ["removeadmin"],
    desc: "To Demote Admin to Member",
    category: "group",
    use: '.demote',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, mentionByTag , args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
		let users = mek.mentionedJid ? mek.mentionedJid[0] : mek.msg.contextInfo.participant || false;
			if (!users) return reply("*Couldn't find any user in context* ❌")
		const groupAdmins = await getGroupAdmins(participants) 
		if  ( !groupAdmins.includes(users)) return reply('❗ *User Already not an Admin*')
		    await conn.groupParticipantsUpdate(from, [users], "demote")
			await conn.sendMessage(from,{text:`*User No longer an Admin*  ✔️`},{quoted:mek })
	
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )

cmd({
    pattern: "tagall",
    react: "🔊",
    alias: ["f_tagall"],
    desc: "To Tag all Members",
    category: "group",
    use: '.tagall',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, mentionByTag , args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)

		let teks = `💱 *HI ALL ! GIVE YOUR ATTENTION PLEASE* 
 
`
                for (let mem of participants) {
                teks += `> Uᴅ 🏴‍☠ @${mem.id.split('@')[0]}\n`
                }
                conn.sendMessage(from, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek })
                
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )

cmd({
    pattern: "hidetag",
    react: "🔊",
    alias: ["tag","f_tag"],
    desc: "To Tag all Members for Message",
    category: "group",
    use: '.tag Hi',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, mentionByTag , args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/Um4r719/UD-MD-DATA/refs/heads/main/DATABASE/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
	
		if(!q) return reply('*Please add a Message* ℹ️')
		let teks = `${q}`
                conn.sendMessage(from, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek })
                
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )

cmd({
    pattern: "taggp",
    react: "🔊",
    alias: ["tggp","f_taggp"],
    desc: "To Tag all Members for Message",
    category: "group",
    use: '.tag Hi',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, mentionByTag , args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
		if ( !m.quoted ) return reply('*Please mention a message* ℹ️')
		if(!q) return reply('*Please add a Group Jid* ℹ️')
		//if ( q == "120363174739054837@g.us" ) { if ( !isDev ) return reply("❌ *Acai wage ! You can send Tag messages to Official Support Group*") }
		let teks = `${m.quoted.msg}`
        conn.sendMessage(q, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek })
                
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )

