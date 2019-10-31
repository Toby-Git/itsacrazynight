require('dotenv').config({ path: './.env' });
const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.TOKEN);

client.on('ready', () => {
  console.log('its a crazy night');
});

client.on('message', msg => {
  let pinned = [];
  if (msg.content !== 'its a crazy night') {
    msg.channel.delete();
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
          try {
            msg.pin();
          } catch (error) {
            console.log(error);
          }
        }
      })
      .catch(console.error);
  }

  if (msg.member.nickname !== 'its a crazy night') {
    msg.member.setNickname('its a crazy night');
  }
});
