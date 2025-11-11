import { google } from 'googleapis';
import { setCredentials } from '../config/google.js';
import { logger } from '../utils/logger.js';

export class TasksService {
  constructor(tokens) {
    this.auth = setCredentials(tokens);
    this.tasks = google.tasks({ version: 'v1', auth: this.auth });
  }

  /**
   * Crea una nueva tarea
   */
  async createTask({ title, notes, due, tasklist = '@default' }) {
    try {
      const task = {
        title,
        notes,
        due: due ? new Date(due).toISOString() : undefined
      };

      const response = await this.tasks.tasks.insert({
        tasklist,
        requestBody: task
      });

      logger.info(`Task created: ${response.data.id}`);

      return {
        success: true,
        taskId: response.data.id,
        task: response.data
      };
    } catch (error) {
      logger.error('Error creating task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  /**
   * Lista todas las tareas
   */
  async listTasks({ showCompleted = false, tasklist = '@default' }) {
    try {
      const response = await this.tasks.tasks.list({
        tasklist,
        showCompleted,
        showHidden: false
      });

      const tasks = response.data.items || [];

      logger.info(`Retrieved ${tasks.length} tasks`);

      return {
        success: true,
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          notes: task.notes,
          status: task.status,
          due: task.due,
          completed: task.completed,
          updated: task.updated
        }))
      };
    } catch (error) {
      logger.error('Error listing tasks:', error);
      throw new Error(`Failed to list tasks: ${error.message}`);
    }
  }

  /**
   * Obtiene una tarea específica
   */
  async getTask(taskId, tasklist = '@default') {
    try {
      const response = await this.tasks.tasks.get({
        tasklist,
        task: taskId
      });

      return {
        success: true,
        task: response.data
      };
    } catch (error) {
      logger.error('Error getting task:', error);
      throw new Error(`Failed to get task: ${error.message}`);
    }
  }

  /**
   * Actualiza una tarea
   */
  async updateTask(taskId, updates, tasklist = '@default') {
    try {
      const { data: existingTask } = await this.tasks.tasks.get({
        tasklist,
        task: taskId
      });

      const updatedTask = {
        ...existingTask,
        ...updates,
        due: updates.due ? new Date(updates.due).toISOString() : existingTask.due
      };

      const response = await this.tasks.tasks.update({
        tasklist,
        task: taskId,
        requestBody: updatedTask
      });

      logger.info(`Task updated: ${taskId}`);

      return {
        success: true,
        task: response.data
      };
    } catch (error) {
      logger.error('Error updating task:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  /**
   * Marca una tarea como completada
   */
  async completeTask(taskId, tasklist = '@default') {
    try {
      const { data: task } = await this.tasks.tasks.get({
        tasklist,
        task: taskId
      });

      task.status = 'completed';
      task.completed = new Date().toISOString();

      const response = await this.tasks.tasks.update({
        tasklist,
        task: taskId,
        requestBody: task
      });

      logger.info(`Task completed: ${taskId}`);

      return {
        success: true,
        task: response.data
      };
    } catch (error) {
      logger.error('Error completing task:', error);
      throw new Error(`Failed to complete task: ${error.message}`);
    }
  }

  /**
   * Elimina una tarea
   */
  async deleteTask(taskId, tasklist = '@default') {
    try {
      await this.tasks.tasks.delete({
        tasklist,
        task: taskId
      });

      logger.info(`Task deleted: ${taskId}`);

      return {
        success: true,
        message: 'Task deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting task:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  /**
   * Obtiene tareas pendientes (útil para comportamiento proactivo)
   */
  async getPendingTasks(tasklist = '@default') {
    try {
      const response = await this.tasks.tasks.list({
        tasklist,
        showCompleted: false,
        showHidden: false
      });

      return response.data.items || [];
    } catch (error) {
      logger.error('Error getting pending tasks:', error);
      return [];
    }
  }

  /**
   * Obtiene tareas vencidas
   */
  async getOverdueTasks(tasklist = '@default') {
    try {
      const response = await this.tasks.tasks.list({
        tasklist,
        showCompleted: false,
        dueMax: new Date().toISOString()
      });

      return response.data.items || [];
    } catch (error) {
      logger.error('Error getting overdue tasks:', error);
      return [];
    }
  }

  /**
   * Lista todas las listas de tareas
   */
  async listTaskLists() {
    try {
      const response = await this.tasks.tasklists.list();

      return {
        success: true,
        tasklists: response.data.items || []
      };
    } catch (error) {
      logger.error('Error listing task lists:', error);
      throw new Error(`Failed to list task lists: ${error.message}`);
    }
  }

  /**
   * Crea una nueva lista de tareas
   */
  async createTaskList(title) {
    try {
      const response = await this.tasks.tasklists.insert({
        requestBody: { title }
      });

      logger.info(`Task list created: ${response.data.id}`);

      return {
        success: true,
        tasklistId: response.data.id,
        tasklist: response.data
      };
    } catch (error) {
      logger.error('Error creating task list:', error);
      throw new Error(`Failed to create task list: ${error.message}`);
    }
  }
}
