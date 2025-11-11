import { logger } from '../utils/logger.js';

/**
 * Servicio de Aprendizaje Continuo
 * Gestión de cursos, recordatorios de estudio y flashcards
 */
export class LearningService {
  constructor(userId) {
    this.userId = userId;
    this.courses = [];
    this.flashcards = [];
    this.studySessions = [];
    this.reminders = [];
  }

  /**
   * Agrega un curso
   */
  addCourse(courseData) {
    const course = {
      id: Date.now().toString(),
      title: courseData.title,
      platform: courseData.platform || 'custom', // udemy, coursera, youtube, custom
      url: courseData.url,
      progress: 0,
      totalLessons: courseData.totalLessons || 0,
      completedLessons: 0,
      estimatedHours: courseData.estimatedHours || 0,
      category: courseData.category || 'general',
      startDate: new Date().toISOString(),
      targetCompletionDate: courseData.targetDate,
      notes: [],
      createdAt: new Date().toISOString()
    };

    this.courses.push(course);
    logger.info(`Course added: ${course.title}`);
    
    return course;
  }

  /**
   * Actualiza progreso de curso
   */
  updateCourseProgress(courseId, lessonsCompleted) {
    const course = this.courses.find(c => c.id === courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    course.completedLessons = lessonsCompleted;
    course.progress = course.totalLessons > 0 
      ? Math.round((lessonsCompleted / course.totalLessons) * 100)
      : 0;

    if (course.progress === 100) {
      course.completedAt = new Date().toISOString();
    }

    return course;
  }

  /**
   * Obtiene cursos activos
   */
  getActiveCourses() {
    return this.courses.filter(c => c.progress < 100);
  }

  /**
   * Obtiene cursos completados
   */
  getCompletedCourses() {
    return this.courses.filter(c => c.progress === 100);
  }

  /**
   * Crea un flashcard
   */
  createFlashcard(flashcardData) {
    const flashcard = {
      id: Date.now().toString(),
      question: flashcardData.question,
      answer: flashcardData.answer,
      category: flashcardData.category || 'general',
      difficulty: flashcardData.difficulty || 'medium', // easy, medium, hard
      tags: flashcardData.tags || [],
      reviewCount: 0,
      lastReviewed: null,
      nextReview: new Date().toISOString(),
      correctCount: 0,
      incorrectCount: 0,
      createdAt: new Date().toISOString()
    };

    this.flashcards.push(flashcard);
    logger.info(`Flashcard created: ${flashcard.question.substring(0, 50)}...`);
    
    return flashcard;
  }

  /**
   * Obtiene flashcards para revisar (Spaced Repetition)
   */
  getFlashcardsForReview(limit = 10) {
    const now = new Date();
    
    return this.flashcards
      .filter(f => new Date(f.nextReview) <= now)
      .sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview))
      .slice(0, limit);
  }

  /**
   * Registra respuesta de flashcard (Spaced Repetition Algorithm)
   */
  reviewFlashcard(flashcardId, correct) {
    const flashcard = this.flashcards.find(f => f.id === flashcardId);
    
    if (!flashcard) {
      throw new Error('Flashcard not found');
    }

    flashcard.reviewCount++;
    flashcard.lastReviewed = new Date().toISOString();

    if (correct) {
      flashcard.correctCount++;
      
      // Aumentar intervalo de revisión (Spaced Repetition)
      const intervals = {
        0: 1,      // 1 día
        1: 3,      // 3 días
        2: 7,      // 1 semana
        3: 14,     // 2 semanas
        4: 30,     // 1 mes
        5: 60      // 2 meses
      };
      
      const intervalDays = intervals[Math.min(flashcard.correctCount, 5)] || 60;
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + intervalDays);
      flashcard.nextReview = nextReview.toISOString();
      
    } else {
      flashcard.incorrectCount++;
      
      // Resetear a revisión pronto si es incorrecta
      const nextReview = new Date();
      nextReview.setHours(nextReview.getHours() + 4); // 4 horas
      flashcard.nextReview = nextReview.toISOString();
    }

    return flashcard;
  }

  /**
   * Crea recordatorio de estudio
   */
  createStudyReminder(reminderData) {
    const reminder = {
      id: Date.now().toString(),
      title: reminderData.title,
      description: reminderData.description,
      courseId: reminderData.courseId,
      time: reminderData.time, // HH:MM
      days: reminderData.days || ['monday', 'wednesday', 'friday'], // días de la semana
      active: true,
      createdAt: new Date().toISOString()
    };

    this.reminders.push(reminder);
    logger.info(`Study reminder created: ${reminder.title}`);
    
    return reminder;
  }

  /**
   * Registra sesión de estudio
   */
  logStudySession(sessionData) {
    const session = {
      id: Date.now().toString(),
      courseId: sessionData.courseId,
      duration: sessionData.duration, // minutos
      topics: sessionData.topics || [],
      notes: sessionData.notes || '',
      date: new Date().toISOString()
    };

    this.studySessions.push(session);
    
    // Actualizar progreso del curso si se especifica
    if (sessionData.lessonsCompleted && sessionData.courseId) {
      const course = this.courses.find(c => c.id === sessionData.courseId);
      if (course) {
        this.updateCourseProgress(sessionData.courseId, sessionData.lessonsCompleted);
      }
    }

    return session;
  }

  /**
   * Obtiene estadísticas de aprendizaje
   */
  getLearningStats() {
    const totalCourses = this.courses.length;
    const activeCourses = this.getActiveCourses().length;
    const completedCourses = this.getCompletedCourses().length;
    
    const totalFlashcards = this.flashcards.length;
    const flashcardsToReview = this.getFlashcardsForReview(1000).length;
    
    const totalStudyTime = this.studySessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionTime = this.studySessions.length > 0 
      ? Math.round(totalStudyTime / this.studySessions.length)
      : 0;

    // Sesiones de la última semana
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentSessions = this.studySessions.filter(s => new Date(s.date) >= weekAgo);

    return {
      courses: {
        total: totalCourses,
        active: activeCourses,
        completed: completedCourses,
        completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
      },
      flashcards: {
        total: totalFlashcards,
        toReview: flashcardsToReview,
        mastered: this.flashcards.filter(f => f.correctCount >= 5).length
      },
      studyTime: {
        total: totalStudyTime,
        average: averageSessionTime,
        thisWeek: recentSessions.reduce((sum, s) => sum + s.duration, 0),
        sessionsThisWeek: recentSessions.length
      }
    };
  }

  /**
   * Sugiere próximo tema de estudio
   */
  suggestNextStudy() {
    const activeCourses = this.getActiveCourses();
    
    if (activeCourses.length === 0) {
      return {
        type: 'flashcards',
        message: 'No tienes cursos activos. ¿Quieres revisar flashcards?'
      };
    }

    // Priorizar curso con fecha límite más cercana
    const coursesWithDeadline = activeCourses.filter(c => c.targetCompletionDate);
    
    if (coursesWithDeadline.length > 0) {
      const nextCourse = coursesWithDeadline.sort((a, b) => 
        new Date(a.targetCompletionDate) - new Date(b.targetCompletionDate)
      )[0];

      return {
        type: 'course',
        course: nextCourse,
        message: `Continúa con "${nextCourse.title}" (${nextCourse.progress}% completado)`
      };
    }

    // Si no hay deadlines, sugerir curso con menos progreso
    const leastProgress = activeCourses.sort((a, b) => a.progress - b.progress)[0];
    
    return {
      type: 'course',
      course: leastProgress,
      message: `Continúa con "${leastProgress.title}" (${leastProgress.progress}% completado)`
    };
  }

  /**
   * Formatea estadísticas para mostrar
   */
  formatStats(stats) {
    return `📚 Estadísticas de Aprendizaje:

Cursos:
- Total: ${stats.courses.total}
- Activos: ${stats.courses.active}
- Completados: ${stats.courses.completed}
- Tasa de completación: ${stats.courses.completionRate}%

Flashcards:
- Total: ${stats.flashcards.total}
- Pendientes de revisar: ${stats.flashcards.toReview}
- Dominadas: ${stats.flashcards.mastered}

Tiempo de Estudio:
- Total: ${Math.round(stats.studyTime.total / 60)} horas
- Promedio por sesión: ${stats.studyTime.average} minutos
- Esta semana: ${Math.round(stats.studyTime.thisWeek / 60)} horas (${stats.studyTime.sessionsThisWeek} sesiones)`;
  }

  /**
   * Formatea lista de cursos
   */
  formatCourseList(courses) {
    if (courses.length === 0) {
      return 'No tienes cursos registrados.';
    }

    let text = `Tienes ${courses.length} curso(s):\n\n`;
    
    courses.forEach((course, index) => {
      text += `${index + 1}. ${course.title}\n`;
      text += `   Progreso: ${course.progress}%`;
      if (course.platform !== 'custom') {
        text += ` (${course.platform})`;
      }
      text += '\n';
      if (course.targetCompletionDate) {
        const deadline = new Date(course.targetCompletionDate);
        text += `   Fecha límite: ${deadline.toLocaleDateString('es-ES')}\n`;
      }
      text += '\n';
    });

    return text;
  }
}
