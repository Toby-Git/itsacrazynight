require('dotenv').config({ path: './.env' });
const Discord = require('discord.js'),
  client = new Discord.Client(),
  owner = process.env.OWNER;

client.login(process.env.TOKEN);

client.on('ready', () => {
  let d = new Date();
  console.log(
    `its a crazy night: ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} - ${d.toDateString()}`
  );
  setStatus(client);
});

client.on('guildMemberAdd', member => {
  forceNick(member);
});

client.on('guildMemberUpdate', (oldMem, newMem) => {
  if (newMem.nickname !== 'its a crazy night') forceNick(newMem);
});

// delete editted messages
client.on('messageUpdate', function(oldMessage, newMessage) {
  // if message update is to pin don't delete
  if (newMessage.editedTimestamp !== 0) {
    newMessage.delete();
  }
});

// Listen for all edits and emit a custom event
// This bypasses caching and emits for all messages regardless of post time
client.on('raw', async event => {
  if (event.t !== 'MESSAGE_UPDATE') return false;

  // Build data needed for react event event
  let { d: data } = event;

  // exit if edit is in dm (no delete perms)
  if (!data.guild_id) return false;

  // Skip emitting if message is cached and bot can target (prevents double execution)
  let channel = client.channels.get(data.channel_id);
  if (channel.messages.has(data.id)) return;

  let message = await channel.fetchMessage(data.id);

  // pass in dummy data as arg1 so data sent as newMessage param
  client.emit('messageUpdate', 'blank', message);
});

client.on('messageReactionAdd', react => {
  react.message.clearReactions();
});

client.on('message', msg => {
  const debug = process.env.DEBUG;

  // delete pin announcements
  if (msg.type === 'PINS_ADD') {
    msg.delete();
  }

  if (msg.content === '!' && msg.author.id === process.env.OWNERID) {
    setStatus(client);
    msg.channel.send('its a crazy night');
  }

  if (msg.guild && !msg.author.bot) {
    let pinned = [],
      roles = [],
      rng = Math.floor(Math.random() * 100) + 1,
      role = msg.guild.roles.find(role => role.id === process.env.ROLE);

    if (msg.content !== 'its a crazy night') {
      debug == 1 ? console.log(`deleting ${msg.content}`) : '';
      msg.delete();
    } else {
      // if valid message

      // 1/100 chance to send its a crazy night
      debug == 1 ? console.log(rng) : '';
      if (rng <= 10) {
        debug == 1 ? console.log('should have sent it bro') : '';
        msg.channel.send('its a crazy night');
      }

      msg.channel
        .fetchPinnedMessages()
        .then(messages => {
          // and channel less than 50 pins
          if (messages.size === 50) {
            // unpin all at 50 and celebrate
            messages.forEach(message => {
              message.unpin();
            });
            msg.channel.send('its a crazy night');
            msg.channel.send('its a crazy night');
            client.user.setPresence({
              game: { name: 'its a crazy night - 0', type: 0 },
            });
            return false;
          }

          // and user not already pinned
          messages.forEach(message => {
            pinned.push(message.author.username);
          });

          //pin
          if (!pinned.includes(msg.author.username)) {
            msg.pin().catch(e => {
              console.log(e);
            });
            client.user.setPresence({
              game: { name: `its a crazy night - ${messages.size}`, type: 0 },
            });
          }
        })
        .catch(console.error);
    }

    // get users roles
    msg.member.roles.forEach(role => {
      roles.push(role.name);
    });
    // add role if not there
    if (!roles.includes('its a crazy night')) {
      addRole(msg.member, role);
    }

    // force nickname
    if (msg.member.nickname !== 'its a crazy night') {
      forceNick(msg.member);
    }
  } else if (!msg.author.bot) {
    // reply to dms / not crash
    msg.channel.send('its a crazy night');
    // show me dms :eyes:
    if (msg.author.id !== process.env.OWNERID) russia(msg);
    return false;
  }
});

async function addRole(guildMember, role) {
  try {
    await guildMember.addRole(role);
  } catch (e) {
    console.log(`unable to apply role to ${guildMember}`);
    console.log(e);
  }
}

async function russia(msg) {
  if (msg.attachments) {
    msg.attachments.forEach(att => {
      console.log(att.url);
      msg.content += `${att.url} `;
    });
  }

  await client.users
    .get(process.env.OWNERID)
    .send(`${msg.author.username} says: ${msg.content}`);
}

function forceNick(guildMember) {
  // dont attempt to rename owner so logs aren't ruined
  if (guildMember.user.username !== owner) {
    try {
      guildMember.setNickname('its a crazy night');
    } catch (e) {
      console.log(`couldnt rename ${guildMember.user.username}`, e);
    }
  }
}

function setStatus(client) {
  client.user.setPresence({
    game: { name: 'its a crazy night', type: 0 },
  });
}

process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
});
