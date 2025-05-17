const { Events } = require('discord.js');
const LogManager = require('../logger/logManager');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(client, oldState, newState) {
    // Ignorar bots
    if (oldState.member.user.bot) return;
    
    const member = oldState.member || newState.member;
    
    try {
      // Entrou em um canal de voz
      if (!oldState.channelId && newState.channelId) {
        await LogManager.sendLog(client, {
          title: '🎙️ Entrou em Canal de Voz',
          color: 'Green',
          thumbnail: member.user.displayAvatarURL(),
          fields: [
            { name: '👤 Usuário', value: `${member.user.tag} (${member.user.id})`, inline: true },
            { name: '🔊 Canal', value: `${newState.channel.name} (<#${newState.channelId}>)`, inline: true },
            { name: '⏰ Horário', value: LogManager.formatTimestamp(Date.now()), inline: true }
          ]
        });
      }
      
      // Saiu de um canal de voz
      else if (oldState.channelId && !newState.channelId) {
        await LogManager.sendLog(client, {
          title: '🎙️ Saiu do Canal de Voz',
          color: 'Red',
          thumbnail: member.user.displayAvatarURL(),
          fields: [
            { name: '👤 Usuário', value: `${member.user.tag} (${member.user.id})`, inline: true },
            { name: '🔊 Canal', value: `${oldState.channel.name} (<#${oldState.channelId}>)`, inline: true },
            { name: '⏰ Horário', value: LogManager.formatTimestamp(Date.now()), inline: true }
          ]
        });
      }
      
      // Moveu-se entre canais de voz
      else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        await LogManager.sendLog(client, {
          title: '🎙️ Moveu-se Entre Canais de Voz',
          color: 'Blue',
          thumbnail: member.user.displayAvatarURL(),
          fields: [
            { name: '👤 Usuário', value: `${member.user.tag} (${member.user.id})`, inline: true },
            { name: '🔊 De', value: `${oldState.channel.name} (<#${oldState.channelId}>)`, inline: true },
            { name: '🔊 Para', value: `${newState.channel.name} (<#${newState.channelId}>)`, inline: true },
            { name: '⏰ Horário', value: LogManager.formatTimestamp(Date.now()) }
          ]
        });
      }
      
      // Alterou estado de mudo
      if (oldState.mute !== newState.mute) {
        const status = newState.mute ? 'Mutado' : 'Desmutado';
        const isServerMute = newState.serverMute !== oldState.serverMute;
        const muteType = isServerMute ? 'pelo servidor' : 'pelo usuário';
        
        await LogManager.sendLog(client, {
          title: `🎙️ ${status} Microfone ${muteType}`,
          color: newState.mute ? 'Orange' : 'Green',
          thumbnail: member.user.displayAvatarURL(),
          fields: [
            { name: '👤 Usuário', value: `${member.user.tag} (${member.user.id})`, inline: true },
            { name: '🔊 Canal', value: `${newState.channel.name} (<#${newState.channelId}>)`, inline: true },
            { name: '⏰ Horário', value: LogManager.formatTimestamp(Date.now()), inline: true }
          ]
        });
      }
      
      // Alterou estado de silenciado
      if (oldState.deaf !== newState.deaf) {
        const status = newState.deaf ? 'Silenciado' : 'Dessilenciado';
        const isServerDeaf = newState.serverDeaf !== oldState.serverDeaf;
        const deafType = isServerDeaf ? 'pelo servidor' : 'pelo usuário';
        
        await LogManager.sendLog(client, {
          title: `🎙️ ${status} Áudio ${deafType}`,
          color: newState.deaf ? 'Orange' : 'Green',
          thumbnail: member.user.displayAvatarURL(),
          fields: [
            { name: '👤 Usuário', value: `${member.user.tag} (${member.user.id})`, inline: true },
            { name: '🔊 Canal', value: `${newState.channel.name} (<#${newState.channelId}>)`, inline: true },
            { name: '⏰ Horário', value: LogManager.formatTimestamp(Date.now()), inline: true }
          ]
        });
      }
      
      // Iniciou/Parou transmissão
      if (oldState.streaming !== newState.streaming) {
        const status = newState.streaming ? 'Iniciou' : 'Encerrou';
        
        await LogManager.sendLog(client, {
          title: `🎙️ ${status} Transmissão`,
          color: newState.streaming ? 'Purple' : 'Grey',
          thumbnail: member.user.displayAvatarURL(),
          fields: [
            { name: '👤 Usuário', value: `${member.user.tag} (${member.user.id})`, inline: true },
            { name: '🔊 Canal', value: `${newState.channel.name} (<#${newState.channelId}>)`, inline: true },
            { name: '⏰ Horário', value: LogManager.formatTimestamp(Date.now()), inline: true }
          ]
        });
      }
      
      // Iniciou/Parou vídeo
      if (oldState.selfVideo !== newState.selfVideo) {
        const status = newState.selfVideo ? 'Ligou' : 'Desligou';
        
        await LogManager.sendLog(client, {
          title: `🎙️ ${status} Vídeo`,
          color: newState.selfVideo ? 'Purple' : 'Grey',
          thumbnail: member.user.displayAvatarURL(),
          fields: [
            { name: '👤 Usuário', value: `${member.user.tag} (${member.user.id})`, inline: true },
            { name: '🔊 Canal', value: `${newState.channel.name} (<#${newState.channelId}>)`, inline: true },
            { name: '⏰ Horário', value: LogManager.formatTimestamp(Date.now()), inline: true }
          ]
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao registrar eventos de voz:', error);
    }
  }
};