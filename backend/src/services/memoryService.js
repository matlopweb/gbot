import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

// Servicio de memoria persistente (opcional)
// Si no se configura Supabase, se usa memoria en RAM

class MemoryService {
  constructor() {
    this.supabase = null;
    this.inMemoryStore = new Map();

    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );
      logger.info('✅ Memory service initialized with Supabase - conversations will persist');
    } else {
      logger.warn('⚠️  Memory service using in-memory storage (data will be lost on restart) - check SUPABASE_URL and SUPABASE_KEY');
    }
  }

  /**
   * Guarda contexto del usuario
   */
  async saveContext(userId, context) {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('user_contexts')
          .upsert({
            user_id: userId,
            context,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      } else {
        this.inMemoryStore.set(`context:${userId}`, context);
      }

      logger.debug(`Context saved for user: ${userId}`);
    } catch (error) {
      logger.error('Error saving context:', error);
      throw error;
    }
  }

  /**
   * Obtiene contexto del usuario
   */
  async getContext(userId) {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('user_contexts')
          .select('context')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data?.context || {};
      } else {
        return this.inMemoryStore.get(`context:${userId}`) || {};
      }
    } catch (error) {
      logger.error('Error getting context:', error);
      return {};
    }
  }

  /**
   * Guarda una conversación
   */
  async saveConversation(userId, messages) {
    try {
      if (this.supabase) {
        logger.info(`💾 Saving to Supabase: ${messages.length} messages for user ${userId}`);
        const { error } = await this.supabase
          .from('conversations')
          .insert({
            user_id: userId,
            messages,
            created_at: new Date().toISOString()
          });

        if (error) {
          logger.error('Supabase save error:', error);
          throw error;
        }
        logger.info(`✅ Successfully saved to Supabase for user: ${userId}`);
      } else {
        const key = `conversation:${userId}:${Date.now()}`;
        this.inMemoryStore.set(key, messages);
        logger.warn(`💾 Saved to memory (will be lost on restart) for user: ${userId}`);
      }
    } catch (error) {
      logger.error('Error saving conversation:', error);
      throw error;
    }
  }

  /**
   * Obtiene conversaciones recientes
   */
  async getRecentConversations(userId, limit = 10) {
    try {
      if (this.supabase) {
        logger.info(`🔍 Fetching from Supabase: conversations for user ${userId}, limit ${limit}`);
        const { data, error } = await this.supabase
          .from('conversations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          logger.error('Supabase fetch error:', error);
          throw error;
        }
        logger.info(`✅ Found ${data?.length || 0} conversation entries in Supabase for user: ${userId}`);
        return data || [];
      } else {
        logger.info(`🔍 Fetching from memory: conversations for user ${userId}`);
        const conversations = [];
        for (const [key, value] of this.inMemoryStore.entries()) {
          if (key.startsWith(`conversation:${userId}`)) {
            conversations.push(value);
          }
        }
        return conversations.slice(0, limit);
      }
    } catch (error) {
      logger.error('Error getting conversations:', error);
      return [];
    }
  }

  /**
   * Guarda preferencias del usuario
   */
  async savePreferences(userId, preferences) {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            preferences,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      } else {
        this.inMemoryStore.set(`preferences:${userId}`, preferences);
      }

      logger.debug(`Preferences saved for user: ${userId}`);
    } catch (error) {
      logger.error('Error saving preferences:', error);
      throw error;
    }
  }

  /**
   * Obtiene preferencias del usuario
   */
  async getPreferences(userId) {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data?.preferences || {};
      } else {
        return this.inMemoryStore.get(`preferences:${userId}`) || {};
      }
    } catch (error) {
      logger.error('Error getting preferences:', error);
      return {};
    }
  }

  /**
   * Búsqueda semántica (requiere vector store)
   */
  async semanticSearch(userId, query, limit = 5) {
    // Placeholder - implementar con vector embeddings
    logger.warn('Semantic search not implemented yet');
    return [];
  }

  /**
   * Limpia datos antiguos
   */
  async cleanup(daysOld = 30) {
    try {
      if (this.supabase) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const { error } = await this.supabase
          .from('conversations')
          .delete()
          .lt('created_at', cutoffDate.toISOString());

        if (error) throw error;
        logger.info(`Cleaned up conversations older than ${daysOld} days`);
      }
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }
}

export const memoryService = new MemoryService();
