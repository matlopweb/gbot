import { logger } from '../utils/logger.js';

/**
 * Servicio Unificado de Productividad
 * Integra Notion, Trello y Asana
 */
export class ProductivityService {
  constructor(platform, accessToken) {
    this.platform = platform; // 'notion', 'trello', 'asana'
    this.accessToken = accessToken;
    
    // Base URLs
    this.baseUrls = {
      notion: 'https://api.notion.com/v1',
      trello: 'https://api.trello.com/1',
      asana: 'https://app.asana.com/api/1.0'
    };
    
    this.baseUrl = this.baseUrls[platform];
  }

  /**
   * Realiza una petición a la API correspondiente
   */
  async makeRequest(endpoint, options = {}) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const headers = {};
    
    // Headers específicos por plataforma
    if (this.platform === 'notion') {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      headers['Notion-Version'] = '2022-06-28';
      headers['Content-Type'] = 'application/json';
    } else if (this.platform === 'trello') {
      // Trello usa query params para auth
      const url = new URL(`${this.baseUrl}${endpoint}`);
      url.searchParams.append('key', process.env.TRELLO_API_KEY);
      url.searchParams.append('token', this.accessToken);
      endpoint = url.pathname + url.search;
    } else if (this.platform === 'asana') {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`${this.platform} API error: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      logger.error(`${this.platform} API request error:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todas las tareas/items
   */
  async getTasks() {
    try {
      if (this.platform === 'notion') {
        return await this.getNotionTasks();
      } else if (this.platform === 'trello') {
        return await this.getTrelloCards();
      } else if (this.platform === 'asana') {
        return await this.getAsanaTasks();
      }
    } catch (error) {
      logger.error('Error getting tasks:', error);
      return [];
    }
  }

  /**
   * Crea una nueva tarea
   */
  async createTask(taskData) {
    try {
      if (this.platform === 'notion') {
        return await this.createNotionPage(taskData);
      } else if (this.platform === 'trello') {
        return await this.createTrelloCard(taskData);
      } else if (this.platform === 'asana') {
        return await this.createAsanaTask(taskData);
      }
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Actualiza una tarea
   */
  async updateTask(taskId, updates) {
    try {
      if (this.platform === 'notion') {
        return await this.updateNotionPage(taskId, updates);
      } else if (this.platform === 'trello') {
        return await this.updateTrelloCard(taskId, updates);
      } else if (this.platform === 'asana') {
        return await this.updateAsanaTask(taskId, updates);
      }
    } catch (error) {
      logger.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Marca tarea como completada
   */
  async completeTask(taskId) {
    try {
      if (this.platform === 'notion') {
        return await this.updateNotionPage(taskId, { completed: true });
      } else if (this.platform === 'trello') {
        return await this.updateTrelloCard(taskId, { closed: true });
      } else if (this.platform === 'asana') {
        return await this.updateAsanaTask(taskId, { completed: true });
      }
    } catch (error) {
      logger.error('Error completing task:', error);
      throw error;
    }
  }

  // ========== NOTION ==========

  async getNotionTasks() {
    const data = await this.makeRequest('/search', {
      method: 'POST',
      body: JSON.stringify({
        filter: { property: 'object', value: 'page' },
        sort: { direction: 'descending', timestamp: 'last_edited_time' }
      })
    });

    return data.results.map(page => ({
      id: page.id,
      title: this.extractNotionTitle(page),
      status: this.extractNotionStatus(page),
      url: page.url,
      lastEdited: page.last_edited_time,
      platform: 'notion'
    }));
  }

  async createNotionPage(taskData) {
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID not configured');
    }

    const data = await this.makeRequest('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          Name: {
            title: [{ text: { content: taskData.title } }]
          },
          Status: {
            select: { name: taskData.status || 'To Do' }
          }
        }
      })
    });

    return {
      id: data.id,
      title: taskData.title,
      url: data.url,
      platform: 'notion'
    };
  }

  async updateNotionPage(pageId, updates) {
    const properties = {};
    
    if (updates.title) {
      properties.Name = {
        title: [{ text: { content: updates.title } }]
      };
    }
    
    if (updates.completed !== undefined) {
      properties.Status = {
        select: { name: updates.completed ? 'Done' : 'In Progress' }
      };
    }

    const data = await this.makeRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties })
    });

    return { success: true, id: data.id };
  }

  extractNotionTitle(page) {
    const titleProp = Object.values(page.properties).find(p => p.type === 'title');
    return titleProp?.title?.[0]?.text?.content || 'Sin título';
  }

  extractNotionStatus(page) {
    const statusProp = Object.values(page.properties).find(p => p.type === 'select');
    return statusProp?.select?.name || 'Unknown';
  }

  // ========== TRELLO ==========

  async getTrelloCards() {
    const boardId = process.env.TRELLO_BOARD_ID;
    
    if (!boardId) {
      throw new Error('TRELLO_BOARD_ID not configured');
    }

    const data = await this.makeRequest(`/boards/${boardId}/cards`);

    return data.map(card => ({
      id: card.id,
      title: card.name,
      description: card.desc,
      status: card.closed ? 'Closed' : 'Open',
      list: card.idList,
      url: card.url,
      dueDate: card.due,
      platform: 'trello'
    }));
  }

  async createTrelloCard(taskData) {
    const listId = process.env.TRELLO_LIST_ID;
    
    if (!listId) {
      throw new Error('TRELLO_LIST_ID not configured');
    }

    const data = await this.makeRequest('/cards', {
      method: 'POST',
      body: JSON.stringify({
        name: taskData.title,
        desc: taskData.description || '',
        idList: listId,
        due: taskData.dueDate || null
      })
    });

    return {
      id: data.id,
      title: data.name,
      url: data.url,
      platform: 'trello'
    };
  }

  async updateTrelloCard(cardId, updates) {
    const body = {};
    
    if (updates.title) body.name = updates.title;
    if (updates.description) body.desc = updates.description;
    if (updates.closed !== undefined) body.closed = updates.closed;

    const data = await this.makeRequest(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });

    return { success: true, id: data.id };
  }

  // ========== ASANA ==========

  async getAsanaTasks() {
    const workspaceId = process.env.ASANA_WORKSPACE_ID;
    
    if (!workspaceId) {
      throw new Error('ASANA_WORKSPACE_ID not configured');
    }

    const data = await this.makeRequest(
      `/tasks?workspace=${workspaceId}&assignee=me&opt_fields=name,completed,due_on,permalink_url`
    );

    return data.data.map(task => ({
      id: task.gid,
      title: task.name,
      status: task.completed ? 'Completed' : 'Incomplete',
      dueDate: task.due_on,
      url: task.permalink_url,
      platform: 'asana'
    }));
  }

  async createAsanaTask(taskData) {
    const workspaceId = process.env.ASANA_WORKSPACE_ID;
    
    if (!workspaceId) {
      throw new Error('ASANA_WORKSPACE_ID not configured');
    }

    const data = await this.makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          name: taskData.title,
          notes: taskData.description || '',
          workspace: workspaceId,
          due_on: taskData.dueDate || null
        }
      })
    });

    return {
      id: data.data.gid,
      title: data.data.name,
      url: data.data.permalink_url,
      platform: 'asana'
    };
  }

  async updateAsanaTask(taskId, updates) {
    const data = {};
    
    if (updates.title) data.name = updates.title;
    if (updates.description) data.notes = updates.description;
    if (updates.completed !== undefined) data.completed = updates.completed;

    const result = await this.makeRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ data })
    });

    return { success: true, id: result.data.gid };
  }

  // ========== UTILIDADES ==========

  /**
   * Formatea tareas para mostrar al usuario
   */
  formatTasksForDisplay(tasks) {
    if (!tasks || tasks.length === 0) {
      return 'No hay tareas.';
    }

    let formatted = `Tienes ${tasks.length} tarea(s):\n\n`;
    
    tasks.forEach((task, index) => {
      formatted += `${index + 1}. ${task.title}`;
      if (task.status) formatted += ` [${task.status}]`;
      if (task.dueDate) formatted += ` - Vence: ${new Date(task.dueDate).toLocaleDateString('es-ES')}`;
      formatted += `\n`;
    });

    return formatted;
  }

  /**
   * Sincroniza tareas entre plataformas
   */
  async syncTasks(sourcePlatform, targetPlatform) {
    try {
      // Obtener tareas de la plataforma origen
      const sourceTasks = await this.getTasks();
      
      // Crear servicio para plataforma destino
      const targetService = new ProductivityService(targetPlatform, this.accessToken);
      
      // Sincronizar cada tarea
      const synced = [];
      for (const task of sourceTasks) {
        const created = await targetService.createTask({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate
        });
        synced.push(created);
      }

      return {
        success: true,
        synced: synced.length,
        message: `${synced.length} tareas sincronizadas de ${sourcePlatform} a ${targetPlatform}`
      };

    } catch (error) {
      logger.error('Error syncing tasks:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
