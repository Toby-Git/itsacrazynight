require('dotenv').config({ path: './.env' });
const Discord = require('discord.js'),
  client = new Discord.Client(),
  owner = process.env.OWNER;

client.login(process.env.TOKEN);

var members = '';
var pins = '';

client.on('ready', () => {
  let d = new Date();
  console.log(
    `its a crazy night: ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} - ${d.toDateString()}`
  );
  setStatus(client);
});

client.on('guildMemberAdd', member => {
  forceNick(member);
  client.users
    .get(process.env.OWNERID)
    .send(`new member: ${member}`);
  setStatus(client);
});

client.on('guildMemberRemove', member => {
  client.users
    .get(process.env.OWNERID)
    .send(`RIP member: ${member}`);
  setStatus(client);
});

client.on('guildMemberUpdate', (oldMem, newMem) => {
  if (newMem.nickname !== 'its a crazy night') forceNick(newMem);
});

// Listen for raw events
// This is needed to bypass message caching
client.on('raw', async event => {
  if (event.t !== 'MESSAGE_REACTION_ADD' && event.t !== 'MESSAGE_UPDATE') return false;
  // Build data needed for react event event
  let { d: data } = event;
  let channel = client.channels.get(data.channel_id);

  switch (event.t) {
    case 'MESSAGE_UPDATE':
      let update = await channel.fetchMessage(data.id);
      if (update.editedTimestamp !== 0) {
        update.delete();
      }
      break;

    case 'MESSAGE_REACTION_ADD':
      // Skip emitting if message is cached and bot can target (prevents double execution)
      if (channel.messages.has(data.id)) return;
      let react = await channel.fetchMessage(data.message_id);
      react.clearReactions().catch(e => { console.log(e) });
      break;

    default:
      console.log('HOW')
      return false;
      break;
  }
});

client.on('messageReactionAdd', react => {
  react.message.clearReactions().catch(e => { console.log(e) });
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
      
      // 1/10 chance to send its a crazy night
      debug == 1 ? console.log(rng) : '';
      if (rng <= 10) {
        debug == 1 ? console.log('should have sent it bro') : '';
        msg.channel.send('its a crazy night');
      }

      msg.channel
        .fetchPinnedMessages()
        .then(messages => {
          // if channel has less than 50 pins
          if (messages.size === 50) {
            // unpin all at 50 and celebrate
            messages.forEach(message => {
              message.unpin();
              try {
                //remove golds
                removeRole(message.member, process.env.GOLD_ROLE)
              } catch (e) {
                console.log('remove gold: ', e);
              }
            });
            msg.channel.send('its a crazy night');
            msg.channel.send('its a crazy night');
            setStatus(client, '0');
            return false;
          }

          // if user not already pinned
          messages.forEach(message => {
            pinned.push(message.author.username);
          });

          // gold and pin
          if (!pinned.includes(msg.author.username)) {
            addRole(msg.member, process.env.GOLD_ROLE)
            msg.pin().catch(e => {
              console.log(e);
            });
             setStatus(client, (messages.size + 1));
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

async function removeRole(guildMember, role) {
  try {
    await guildMember.removeRole(role);
  } catch (e) {
    console.log(`unable to remove role from ${guildMember}`);
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

function setStatus(client, pinOver) {
  let info = ''

  // get members
  client.guilds.forEach(guild => {
    members = guild.memberCount;
  })
  // get pins
  if (!pinOver) {
    client.channels.forEach(chnl => {
      if (chnl.lastPinTimestamp > 0) {
        chnl.fetchPinnedMessages().then(messages => { pins = (messages.size) })
      }
    });
  } else {
    pins = pinOver;
  }

  if (pins) {
    info = `-${pins}`
    if (members) {
      info += `|${members}`
    }
  }

  client.user.setPresence({
    game: { name: `its a crazy night${info}`, type: 0 },
  });
}

process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
});
