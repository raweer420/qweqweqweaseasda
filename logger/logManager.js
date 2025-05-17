const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID } = require('../config');

class LogManager {
  /**
   * Envia um log para o canal designado
   * @param {Client} client Cliente do Discord
   * @param {Object} options Opções do log
   */
  static async sendLog(client, options) {
    try {
      // Log de diagnóstico com mais detalhes
      console.log(`[LOG DEBUG] Tentando enviar log: ${options.title}`);
      console.log(`[LOG DEBUG] Canal de log ID configurado: ${LOG_CHANNEL_ID}`);
      
      // Verificação mais robusta do ID do canal
      if (!LOG_CHANNEL_ID || LOG_CHANNEL_ID.trim() === '') {
        console.error('❌ [LOG] LOG_CHANNEL_ID não está configurado corretamente');
        return;
      }
      
      // Verificar estado do cliente
      if (!client || !client.isReady()) {
        console.error('❌ [LOG] Cliente do Discord não está pronto');
        return;
      }
      
      // Buscar o canal com tratamento de erro mais detalhado
      let logChannel;
      try {
        logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
      } catch (fetchError) {
        console.error('❌ [LOG] Erro ao buscar canal de logs:', fetchError);
        return;
      }
      
      // Verificações adicionais do canal
      if (!logChannel) {
        console.error(`❌ [LOG] Canal de logs não encontrado. Verifique o ID: ${LOG_CHANNEL_ID}`);
        return;
      }
      
      // Verificar permissões de envio
      const botMember = logChannel.guild.members.me;
      const permissions = logChannel.permissionsFor(botMember);
      
      if (!permissions.has('SendMessages') || !permissions.has('EmbedLinks')) {
        console.error('❌ [LOG] O bot não tem permissões completas no canal de logs');
        return;
      }

      // Criar embed com opções personalizáveis
      const embed = new EmbedBuilder()
        .setTitle(options.title || 'Log')
        .setColor(options.color || 'Blue')
        .setTimestamp();

      // Adicionar descrição se fornecida
      if (options.description) {
        embed.setDescription(this.truncate(options.description, 4096));
      }

      // Adicionar thumbnail
      if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
      }

      // Adicionar imagem
      if (options.image) {
        embed.setImage(options.image);
      }

      // Adicionar rodapé
      if (options.footer) {
        embed.setFooter({ 
          text: this.truncate(options.footer, 2048) 
        });
      }
      
      // Processar campos com truncagem e limite
      if (options.fields && options.fields.length > 0) {
        const processedFields = options.fields.map(field => ({
          name: this.truncate(field.name, 256),
          value: this.truncate(field.value, 1024),
          inline: field.inline || false
        })).slice(0, 25); // Limite de 25 campos por embed
        
        embed.addFields(processedFields);
      }

      try {
        // Enviar embed no canal de logs
        await logChannel.send({ embeds: [embed] });
        console.log(`✅ [LOG] Log enviado com sucesso para o canal: ${logChannel.name}`);
      } catch (sendError) {
        console.error('❌ [LOG] Erro ao enviar mensagem de log:', sendError);
      }
    } catch (error) {
      console.error('❌ [LOG] Erro crítico no sistema de logs:', error);
    }
  }

  /**
   * Trunca texto muito longo para evitar erros nos embeds
   * @param {String} text Texto a ser truncado
   * @param {Number} maxLength Tamanho máximo
   * @returns {String} Texto truncado
   */
  static truncate(text, maxLength = 1024) {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength - 3)}...` : text;
  }

  /**
   * Formata uma data em timestamp do Discord
   * @param {Date|Number} date Data ou timestamp
   * @returns {String} Timestamp formatado
   */
  static formatTimestamp(date) {
    const timestamp = date instanceof Date ? Math.floor(date.getTime() / 1000) : Math.floor(date / 1000);
    return `<t:${timestamp}:F> (<t:${timestamp}:R>)`;
  }

  /**
   * Registra erro crítico no console e no canal de logs
   * @param {Client} client Cliente do Discord
   * @param {Error} error Erro a ser registrado
   * @param {String} context Contexto do erro
   */
  static async logCriticalError(client, error, context = 'Sistema') {
    console.error(`❌ [CRITICAL ERROR] ${context}:`, error);

    // Enviar log de erro
    await this.sendLog(client, {
      title: '🚨 Erro Crítico do Sistema',
      color: 'Red',
      description: `**Contexto:** ${context}\n**Erro:** \`${error.message}\``,
      fields: [
        { 
          name: '📌 Detalhes', 
          value: this.truncate(error.stack || 'Sem stack trace', 1024) 
        }
      ]
    });
  }
}

module.exports = LogManager;