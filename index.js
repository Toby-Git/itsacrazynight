require('dotenv').config({ path: './.env' });
const Discord = require('discord.js'),
  client = new Discord.Client(),
  owner = process.env.OWNER;

client.login(process.env.TOKEN);

client.on('ready', () => {
  console.log('its a crazy night');
});

client.on('guildMemberUpdate', (oldMem, newMem) => {
  if (newMem.nickname !== 'its a crazy night') forceNick(newMem);
});

// delete editted messages
client.on('messageUpdate', function(oldMessage, newMessage) {
  newMessage.delete();
});

client.on('message', msg => {
  let pinned = [],
    roles = [],
    role = msg.guild.roles.find(role => role.id === process.env.ROLE);

  if (msg.content !== 'its a crazy night') {
    msg.delete();
  } else {
    // if valid message
    msg.channel
      .fetchPinnedMessages()
      .then(messages => {
        // and channel less than 50 pins
        if (messages.size === 50) {
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
});

async function addRole(guildMember, role) {
  try {
    await guildMember.addRole(role);
  } catch (e) {
    console.log(`unable to apply role to ${guildMember}`);
    console.log(e);
  }
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

process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
});
