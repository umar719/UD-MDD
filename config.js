const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}


global.SESSION_ID =  process.env.SESSION_ID || "UMAR=lqt1XJYC#J_7ItmUeVI074zBX6gR9c7dueRdvbrfuwN2GDI3oBg4"

module.exports = { 

HEOKU_API_KEY  : process.env. HEOKU_API_KEY  === undefined ? '4f2ca729-e3a8-4b34-8834-859d263dd2b8' : process.env.HEOKU_API_KEY,
HEOKU_APP_NAME  : process.env. HEOKU_APP_NAME  === undefined ? 'udmd' : process.env.HEOKU_APP_NAME,
READ_MESSAGE : process.env. READ_MESSAGE  === undefined ?'true': process.env. READ_MESSAGE,
AOTO_VOICS: process.env.AOTO_VOICS  === undefined ? 'false' : process.env.AOTO_VOICS, 
YOU_LINK :  process.env.YOU_LINK  === undefined ? 'https://github.com/Um4r719' : process.env.YOU_LINK,
OWENR_NO: process.env.OWENR_NO === undefined ? '923165123719' : process.env.OWENR_NO,
ANTI_BAD: process.env.ANTI_BAD === undefined ? 'false' : process.env.ANTI_BAD,
MAX_SIZE: 100,
ONLY_GROUP: process.env.ONLY_GROUP === undefined ? 'false' : process.env.ONLY_GROUP,
ANTI_LINK: process.env.ANTI_LINK === undefined ? 'false' : process.env.ANTI_LINK,
ALIVE: process.env.ALIVE === undefined ? ` BRO HELO
 
     
I'm UD MD Whatsapp user bot
🔄Version: 0.9
Helo There I am online 🌐

Powered By Umar` : process.env.ALIVE,
LOGO: process.env.LOGO === undefined ? `https://imgur.com/NxLHiOw.jpeg` : process.env.LOGO
};
