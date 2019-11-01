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
  // live
  let role = msg.guild.roles.find(role => role.id === '625799139221045289');
  // dev
  // let role = msg.guild.roles.find(role => role.id === '639474539373527041');

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

  // try to fix timeout issue
  async function addRole() {
    if (!roles.includes('its a crazy night')) {
      try {
        // apply role if not present
        await msg.member.addRole(role);
      } catch (error) {
        console.log(`unable to apply role to ${msg.member}`);
        console.log(error);
      }
    }
  }
  addRole();

  // force nickname
  if (msg.member.nickname !== 'its a crazy night') {
    msg.member.setNickname('its a crazy night');
  }
});

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});
