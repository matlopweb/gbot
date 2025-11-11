import { logger } from '../utils/logger.js';

/**
 * Servicio de búsqueda web para obtener información actualizada
 * Usa Tavily API (optimizada para IA)
 */
export class WebSearchService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.baseUrl = 'https://api.tavily.com/search';
  }

  /**
   * Realiza una búsqueda web y devuelve resultados relevantes
   */
  async search(query, options = {}) {
    if (!this.apiKey) {
      logger.warn('Tavily API key not configured, web search disabled');
      return null;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: query,
          search_depth: options.depth || 'basic', // 'basic' o 'advanced'
          include_answer: true,
          include_raw_content: false,
          max_results: options.maxResults || 3,
          include_domains: options.includeDomains || [],
          exclude_domains: options.excludeDomains || []
        })
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        answer: data.answer,
        results: data.results.map(r => ({
          title: r.title,
          url: r.url,
          content: r.content,
          score: r.score
        })),
        query: query
      };

    } catch (error) {
      logger.error('Web search error:', error);
      return null;
    }
  }

  /**
   * Busca noticias recientes
   */
  async searchNews(topic, options = {}) {
    return await this.search(`noticias recientes sobre ${topic}`, {
      ...options,
      depth: 'basic',
      maxResults: 5
    });
  }

  /**
   * Busca información sobre una persona, empresa o concepto
   */
  async searchEntity(entity, options = {}) {
    return await this.search(`¿Qué es ${entity}?`, {
      ...options,
      depth: 'advanced',
      maxResults: 3
    });
  }

  /**
   * Formatea los resultados para incluir en el prompt
   */
  formatResultsForPrompt(searchResults) {
    if (!searchResults || !searchResults.results) {
      return '';
    }

    let formatted = `INFORMACIÓN ACTUALIZADA DE INTERNET:\n`;
    
    if (searchResults.answer) {
      formatted += `Respuesta directa: ${searchResults.answer}\n\n`;
    }

    formatted += `Fuentes:\n`;
    searchResults.results.forEach((result, index) => {
      formatted += `${index + 1}. ${result.title}\n`;
      formatted += `   ${result.content.substring(0, 200)}...\n`;
      formatted += `   Fuente: ${result.url}\n\n`;
    });

    return formatted;
  }
}
