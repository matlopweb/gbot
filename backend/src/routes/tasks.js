import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { TasksService } from '../services/tasksService.js';
import { getUserTokens } from '../utils/tokenStore.js';
import { decryptToken } from '../utils/encryption.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Middleware para obtener el servicio de tareas
async function getTasksService(req, res, next) {
  try {
    const { userId } = req.user;
    const storedTokens = await getUserTokens(userId);

    if (!storedTokens) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated with Google'
      });
    }

    // Desencriptar tokens
    const tokens = {
      access_token: decryptToken(storedTokens.access_token),
      refresh_token: storedTokens.refresh_token ? decryptToken(storedTokens.refresh_token) : null,
      expiry_date: storedTokens.expiry_date
    };

    req.tasksService = new TasksService(tokens);
    next();
  } catch (error) {
    logger.error('Error initializing tasks service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize tasks service'
    });
  }
}

router.use(authenticate);
router.use(getTasksService);

/**
 * Crear tarea
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, notes, due, tasklist } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const result = await req.tasksService.createTask({
      title,
      notes,
      due,
      tasklist
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Listar tareas
 */
router.get('/', async (req, res, next) => {
  try {
    const { showCompleted, tasklist } = req.query;

    const result = await req.tasksService.listTasks({
      showCompleted: showCompleted === 'true',
      tasklist
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Obtener tarea específica
 */
router.get('/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { tasklist } = req.query;

    const result = await req.tasksService.getTask(taskId, tasklist);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Actualizar tarea
 */
router.put('/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { tasklist, ...updates } = req.body;

    const result = await req.tasksService.updateTask(taskId, updates, tasklist);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Completar tarea
 */
router.post('/:taskId/complete', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { tasklist } = req.body;

    const result = await req.tasksService.completeTask(taskId, tasklist);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Eliminar tarea
 */
router.delete('/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { tasklist } = req.query;

    const result = await req.tasksService.deleteTask(taskId, tasklist);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Listar listas de tareas
 */
router.get('/lists/all', async (req, res, next) => {
  try {
    const result = await req.tasksService.listTaskLists();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Crear lista de tareas
 */
router.post('/lists', async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const result = await req.tasksService.createTaskList(title);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Obtener tareas pendientes
 */
router.get('/pending/all', async (req, res, next) => {
  try {
    const { tasklist } = req.query;
    const tasks = await req.tasksService.getPendingTasks(tasklist);
    
    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Obtener tareas vencidas
 */
router.get('/overdue/all', async (req, res, next) => {
  try {
    const { tasklist } = req.query;
    const tasks = await req.tasksService.getOverdueTasks(tasklist);
    
    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    next(error);
  }
});

export default router;
