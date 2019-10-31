require('dotenv').config({ path: './.env' });
const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.TOKEN);

client.on('ready', () => {
  console.log('its a crazy night');
});

client.on('message', msg => {
  let pinned = [];
  let roles = [];
  let role = msg.guild.roles.find(role => role.name === 'its a crazy night');

  if (msg.content !== 'its a crazy night') {
    msg.delete();
  } else {
    msg.channel
      .fetchPinnedMessages()
      .then(messages => {
        if (messages.size === 50) {
          return false;
        }

        messages.forEach(message => {
          pinned.push(message.author.username);
        });

        if (!pinned.includes(msg.author.username)) {
          msg.pin().catch(e => {
            console.log(e);
          });
        }
      })
      .catch(console.error);
  }

  msg.member.roles.forEach(role => {
    roles.push(role.name);
  });

  async function addRole() {
    if (!roles.includes('its a crazy night')) {
      try {
        await msg.member.addRole(role);
      } catch (error) {
        console.log(error);
      }
    }
  }

  addRole();

  if (msg.member.nickname !== 'its a crazy night') {
    msg.member.setNickname('its a crazy night');
  }
});

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});
