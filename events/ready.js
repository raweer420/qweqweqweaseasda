const { Events } = require('discord.js');
const { VERIFY_CHANNEL_ID } = require('../config');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ Bot online como ${client.user.tag}`);
    
    // Status personalizado
    client.user.setActivity('verificação de membros', { type: 'Watching' });
    
    try {
      const verifyChannel = await client.channels.fetch(VERIFY_CHANNEL_ID);

      const pinnedMessages = await verifyChannel.messages.fetchPinned();
      let botMessage = pinnedMessages.find(msg =>
        msg.author.id === client.user.id && msg.content.includes('Reaja com ✅')
      );

      if (!botMessage) {
        botMessage = await verifyChannel.send('👋 Reaja com ✅ para iniciar sua verificação via DM.');
        await botMessage.pin();
      }

    } catch (err) {
      console.error('❌ Erro ao buscar o canal de verificação:', err);
    }
  }
};