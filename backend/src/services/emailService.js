import { google } from 'googleapis';
import { logger } from '../utils/logger.js';

/**
 * Servicio de Email Inteligente
 * Lectura, resumen, categorización y respuesta automática de emails
 */
export class EmailService {
  constructor(tokens) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    if (tokens) {
      this.oauth2Client.setCredentials(tokens);
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Obtiene emails recientes
   */
  async getRecentEmails(maxResults = 10, query = 'is:unread') {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults,
        q: query
      });

      if (!response.data.messages) {
        return [];
      }

      const emails = await Promise.all(
        response.data.messages.map(msg => this.getEmailDetails(msg.id))
      );

      return emails.filter(email => email !== null);

    } catch (error) {
      logger.error('Error getting recent emails:', error);
      throw error;
    }
  }

  /**
   * Obtiene detalles de un email específico
   */
  async getEmailDetails(messageId) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload.headers;

      const getHeader = (name) => {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
      };

      // Extraer cuerpo del email
      let body = '';
      if (message.payload.parts) {
        const textPart = message.payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart && textPart.body.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      } else if (message.payload.body.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      }

      return {
        id: message.id,
        threadId: message.threadId,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        body: body.substring(0, 1000), // Limitar a 1000 caracteres
        snippet: message.snippet,
        labels: message.labelIds || [],
        isUnread: message.labelIds?.includes('UNREAD') || false,
        isImportant: message.labelIds?.includes('IMPORTANT') || false
      };

    } catch (error) {
      logger.error('Error getting email details:', error);
      return null;
    }
  }

  /**
   * Categoriza emails usando IA
   */
  categorizeEmail(email) {
    const subject = email.subject.toLowerCase();
    const from = email.from.toLowerCase();
    const body = email.body.toLowerCase();

    // Categorías
    const categories = {
      urgent: false,
      work: false,
      personal: false,
      newsletter: false,
      spam: false,
      finance: false,
      social: false
    };

    // Urgente
    if (subject.includes('urgent') || subject.includes('importante') || 
        subject.includes('asap') || email.isImportant) {
      categories.urgent = true;
    }

    // Trabajo
    if (from.includes('company.com') || from.includes('work') || 
        subject.includes('meeting') || subject.includes('reunión') ||
        subject.includes('project') || subject.includes('proyecto')) {
      categories.work = true;
    }

    // Newsletter
    if (subject.includes('newsletter') || subject.includes('unsubscribe') ||
        from.includes('noreply') || from.includes('no-reply')) {
      categories.newsletter = true;
    }

    // Finanzas
    if (subject.includes('invoice') || subject.includes('factura') ||
        subject.includes('payment') || subject.includes('pago') ||
        subject.includes('bank') || subject.includes('banco')) {
      categories.finance = true;
    }

    // Social
    if (from.includes('facebook') || from.includes('twitter') ||
        from.includes('linkedin') || from.includes('instagram')) {
      categories.social = true;
    }

    // Personal (por defecto si no es otra categoría)
    if (!categories.work && !categories.newsletter && !categories.finance && !categories.social) {
      categories.personal = true;
    }

    return categories;
  }

  /**
   * Genera un resumen inteligente de emails
   */
  async summarizeEmails(emails) {
    const summary = {
      total: emails.length,
      unread: emails.filter(e => e.isUnread).length,
      important: emails.filter(e => e.isImportant).length,
      categories: {
        urgent: [],
        work: [],
        personal: [],
        newsletter: [],
        finance: []
      }
    };

    emails.forEach(email => {
      const categories = this.categorizeEmail(email);
      
      if (categories.urgent) summary.categories.urgent.push(email);
      if (categories.work) summary.categories.work.push(email);
      if (categories.personal) summary.categories.personal.push(email);
      if (categories.newsletter) summary.categories.newsletter.push(email);
      if (categories.finance) summary.categories.finance.push(email);
    });

    return summary;
  }

  /**
   * Marca email como leído
   */
  async markAsRead(messageId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });

      return { success: true, message: 'Email marcado como leído' };

    } catch (error) {
      logger.error('Error marking email as read:', error);
      throw error;
    }
  }

  /**
   * Marca email como importante
   */
  async markAsImportant(messageId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: ['IMPORTANT']
        }
      });

      return { success: true, message: 'Email marcado como importante' };

    } catch (error) {
      logger.error('Error marking email as important:', error);
      throw error;
    }
  }

  /**
   * Archiva un email
   */
  async archiveEmail(messageId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['INBOX']
        }
      });

      return { success: true, message: 'Email archivado' };

    } catch (error) {
      logger.error('Error archiving email:', error);
      throw error;
    }
  }

  /**
   * Elimina un email (mueve a papelera)
   */
  async deleteEmail(messageId) {
    try {
      await this.gmail.users.messages.trash({
        userId: 'me',
        id: messageId
      });

      return { success: true, message: 'Email movido a papelera' };

    } catch (error) {
      logger.error('Error deleting email:', error);
      throw error;
    }
  }

  /**
   * Envía un email
   */
  async sendEmail(to, subject, body) {
    try {
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n');

      const encodedEmail = Buffer.from(email).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });

      return { success: true, message: 'Email enviado' };

    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Responde a un email
   */
  async replyToEmail(messageId, replyBody) {
    try {
      // Obtener email original
      const originalEmail = await this.getEmailDetails(messageId);
      
      // Extraer email del remitente
      const fromMatch = originalEmail.from.match(/<(.+)>/);
      const replyTo = fromMatch ? fromMatch[1] : originalEmail.from;

      // Crear respuesta
      const email = [
        `To: ${replyTo}`,
        `Subject: Re: ${originalEmail.subject}`,
        `In-Reply-To: ${messageId}`,
        `References: ${messageId}`,
        '',
        replyBody
      ].join('\n');

      const encodedEmail = Buffer.from(email).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
          threadId: originalEmail.threadId
        }
      });

      return { success: true, message: 'Respuesta enviada' };

    } catch (error) {
      logger.error('Error replying to email:', error);
      throw error;
    }
  }

  /**
   * Genera respuesta automática simple
   */
  generateAutoReply(email) {
    const subject = email.subject.toLowerCase();
    
    // Respuestas automáticas simples
    if (subject.includes('meeting') || subject.includes('reunión')) {
      return 'Gracias por tu email. He recibido tu solicitud de reunión y te responderé pronto con mi disponibilidad.';
    }
    
    if (subject.includes('question') || subject.includes('pregunta')) {
      return 'Gracias por tu pregunta. La he recibido y te responderé lo antes posible.';
    }
    
    if (subject.includes('thanks') || subject.includes('gracias')) {
      return 'De nada, fue un placer ayudarte.';
    }

    return 'Gracias por tu email. Lo he recibido y te responderé pronto.';
  }

  /**
   * Formatea resumen de emails para mostrar
   */
  formatEmailSummary(summary) {
    let text = `📧 Resumen de Emails:\n\n`;
    text += `Total: ${summary.total} emails\n`;
    text += `No leídos: ${summary.unread}\n`;
    text += `Importantes: ${summary.important}\n\n`;

    if (summary.categories.urgent.length > 0) {
      text += `🚨 Urgentes (${summary.categories.urgent.length}):\n`;
      summary.categories.urgent.slice(0, 3).forEach(email => {
        text += `  - ${email.subject} (${email.from})\n`;
      });
      text += '\n';
    }

    if (summary.categories.work.length > 0) {
      text += `💼 Trabajo (${summary.categories.work.length}):\n`;
      summary.categories.work.slice(0, 3).forEach(email => {
        text += `  - ${email.subject}\n`;
      });
      text += '\n';
    }

    if (summary.categories.finance.length > 0) {
      text += `💰 Finanzas (${summary.categories.finance.length}):\n`;
      summary.categories.finance.slice(0, 3).forEach(email => {
        text += `  - ${email.subject}\n`;
      });
    }

    return text;
  }
}
