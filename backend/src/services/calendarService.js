import { google } from 'googleapis';
import { setCredentials } from '../config/google.js';
import { logger } from '../utils/logger.js';

export class CalendarService {
  constructor(tokens) {
    this.auth = setCredentials(tokens);
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  /**
   * Crea un nuevo evento en el calendario
   */
  async createEvent({ summary, description, start, end, attendees = [] }) {
    try {
      const event = {
        summary,
        description,
        start: {
          dateTime: start,
          timeZone: 'America/Argentina/Buenos_Aires'
        },
        end: {
          dateTime: end,
          timeZone: 'America/Argentina/Buenos_Aires'
        },
        attendees: attendees.map(email => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 15 }
          ]
        }
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all'
      });

      logger.info(`Event created: ${response.data.id}`);
      
      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        event: response.data
      };
    } catch (error) {
      logger.error('Error creating calendar event:', error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  /**
   * Lista eventos del calendario
   */
  async listEvents({ timeMin, timeMax, maxResults = 10 }) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.data.items || [];

      logger.info(`Retrieved ${events.length} events`);

      return {
        success: true,
        events: events.map(event => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          htmlLink: event.htmlLink,
          attendees: event.attendees?.map(a => a.email) || []
        }))
      };
    } catch (error) {
      logger.error('Error listing calendar events:', error);
      throw new Error(`Failed to list events: ${error.message}`);
    }
  }

  /**
   * Obtiene un evento específico
   */
  async getEvent(eventId) {
    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId
      });

      return {
        success: true,
        event: response.data
      };
    } catch (error) {
      logger.error('Error getting calendar event:', error);
      throw new Error(`Failed to get event: ${error.message}`);
    }
  }

  /**
   * Actualiza un evento existente
   */
  async updateEvent(eventId, updates) {
    try {
      const { data: existingEvent } = await this.calendar.events.get({
        calendarId: 'primary',
        eventId
      });

      const updatedEvent = {
        ...existingEvent,
        ...updates,
        start: updates.start ? {
          dateTime: updates.start,
          timeZone: 'America/Argentina/Buenos_Aires'
        } : existingEvent.start,
        end: updates.end ? {
          dateTime: updates.end,
          timeZone: 'America/Argentina/Buenos_Aires'
        } : existingEvent.end
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: updatedEvent,
        sendUpdates: 'all'
      });

      logger.info(`Event updated: ${eventId}`);

      return {
        success: true,
        event: response.data
      };
    } catch (error) {
      logger.error('Error updating calendar event:', error);
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  /**
   * Elimina un evento
   */
  async deleteEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all'
      });

      logger.info(`Event deleted: ${eventId}`);

      return {
        success: true,
        message: 'Event deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting calendar event:', error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  /**
   * Obtiene eventos próximos (útil para comportamiento proactivo)
   */
  async getUpcomingEvents(minutesAhead = 60) {
    try {
      const now = new Date();
      const future = new Date(now.getTime() + minutesAhead * 60000);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: future.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      logger.error('Error getting upcoming events:', error);
      return [];
    }
  }

  /**
   * Busca eventos por texto
   */
  async searchEvents(query) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        q: query,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return {
        success: true,
        events: response.data.items || []
      };
    } catch (error) {
      logger.error('Error searching calendar events:', error);
      throw new Error(`Failed to search events: ${error.message}`);
    }
  }
}
