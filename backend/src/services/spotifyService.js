import { logger } from '../utils/logger.js';

/**
 * Servicio de Spotify
 * Control de música, playlists y recomendaciones según estado de ánimo
 */
export class SpotifyService {
  constructor(accessToken = null, refreshToken = null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/auth/spotify/callback';
    this.baseUrl = 'https://api.spotify.com/v1';
  }

  /**
   * Obtiene la URL de autorización de Spotify
   */
  getAuthUrl() {
    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'user-top-read'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Intercambia código de autorización por tokens
   */
  async exchangeCodeForTokens(code) {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`Spotify auth error: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in
      };

    } catch (error) {
      logger.error('Error exchanging Spotify code:', error);
      throw error;
    }
  }

  /**
   * Refresca el access token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Spotify refresh error: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      return data.access_token;

    } catch (error) {
      logger.error('Error refreshing Spotify token:', error);
      throw error;
    }
  }

  /**
   * Realiza una petición a la API de Spotify
   */
  async makeRequest(endpoint, options = {}) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (response.status === 401) {
        // Token expirado, intentar refrescar
        await this.refreshAccessToken();
        return this.makeRequest(endpoint, options);
      }

      if (!response.ok && response.status !== 204) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      if (response.status === 204) {
        return null; // No content
      }

      return await response.json();

    } catch (error) {
      logger.error('Spotify API request error:', error);
      throw error;
    }
  }

  /**
   * Obtiene la reproducción actual
   */
  async getCurrentPlayback() {
    try {
      const data = await this.makeRequest('/me/player');
      
      if (!data) {
        return null;
      }

      return {
        isPlaying: data.is_playing,
        track: {
          name: data.item?.name,
          artist: data.item?.artists?.map(a => a.name).join(', '),
          album: data.item?.album?.name,
          duration: data.item?.duration_ms,
          progress: data.progress_ms,
          image: data.item?.album?.images?.[0]?.url
        },
        device: {
          name: data.device?.name,
          type: data.device?.type,
          volume: data.device?.volume_percent
        },
        shuffleState: data.shuffle_state,
        repeatState: data.repeat_state
      };

    } catch (error) {
      logger.error('Error getting current playback:', error);
      return null;
    }
  }

  /**
   * Reproduce música
   */
  async play(contextUri = null, uris = null) {
    try {
      const body = {};
      if (contextUri) body.context_uri = contextUri;
      if (uris) body.uris = uris;

      await this.makeRequest('/me/player/play', {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      return { success: true, message: 'Reproduciendo música' };

    } catch (error) {
      logger.error('Error playing music:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Pausa la música
   */
  async pause() {
    try {
      await this.makeRequest('/me/player/pause', {
        method: 'PUT'
      });

      return { success: true, message: 'Música pausada' };

    } catch (error) {
      logger.error('Error pausing music:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Siguiente canción
   */
  async next() {
    try {
      await this.makeRequest('/me/player/next', {
        method: 'POST'
      });

      return { success: true, message: 'Siguiente canción' };

    } catch (error) {
      logger.error('Error skipping to next:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Canción anterior
   */
  async previous() {
    try {
      await this.makeRequest('/me/player/previous', {
        method: 'POST'
      });

      return { success: true, message: 'Canción anterior' };

    } catch (error) {
      logger.error('Error going to previous:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ajusta el volumen
   */
  async setVolume(volumePercent) {
    try {
      await this.makeRequest(`/me/player/volume?volume_percent=${volumePercent}`, {
        method: 'PUT'
      });

      return { success: true, message: `Volumen ajustado a ${volumePercent}%` };

    } catch (error) {
      logger.error('Error setting volume:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Activa/desactiva shuffle
   */
  async setShuffle(state) {
    try {
      await this.makeRequest(`/me/player/shuffle?state=${state}`, {
        method: 'PUT'
      });

      return { success: true, message: `Shuffle ${state ? 'activado' : 'desactivado'}` };

    } catch (error) {
      logger.error('Error setting shuffle:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca canciones, artistas, álbumes o playlists
   */
  async search(query, type = 'track', limit = 10) {
    try {
      const params = new URLSearchParams({
        q: query,
        type: type,
        limit: limit
      });

      const data = await this.makeRequest(`/search?${params.toString()}`);

      if (type === 'track') {
        return data.tracks.items.map(track => ({
          uri: track.uri,
          name: track.name,
          artist: track.artists.map(a => a.name).join(', '),
          album: track.album.name,
          duration: track.duration_ms,
          image: track.album.images[0]?.url
        }));
      } else if (type === 'playlist') {
        return data.playlists.items.map(playlist => ({
          uri: playlist.uri,
          name: playlist.name,
          owner: playlist.owner.display_name,
          tracks: playlist.tracks.total,
          image: playlist.images[0]?.url
        }));
      }

      return data;

    } catch (error) {
      logger.error('Error searching Spotify:', error);
      return [];
    }
  }

  /**
   * Obtiene playlists del usuario
   */
  async getUserPlaylists(limit = 20) {
    try {
      const data = await this.makeRequest(`/me/playlists?limit=${limit}`);

      return data.items.map(playlist => ({
        uri: playlist.uri,
        id: playlist.id,
        name: playlist.name,
        owner: playlist.owner.display_name,
        tracks: playlist.tracks.total,
        image: playlist.images[0]?.url,
        public: playlist.public
      }));

    } catch (error) {
      logger.error('Error getting user playlists:', error);
      return [];
    }
  }

  /**
   * Obtiene recomendaciones según estado de ánimo/actividad
   */
  async getRecommendationsByMood(mood) {
    const moodToGenre = {
      'concentración': ['ambient', 'classical', 'piano', 'study'],
      'programar': ['electronic', 'chill', 'lo-fi', 'instrumental'],
      'ejercicio': ['workout', 'rock', 'edm', 'hip-hop'],
      'relajación': ['ambient', 'jazz', 'acoustic', 'chill'],
      'fiesta': ['dance', 'pop', 'reggaeton', 'electronic'],
      'trabajo': ['focus', 'classical', 'instrumental', 'ambient'],
      'estudio': ['classical', 'lo-fi', 'piano', 'ambient'],
      'energía': ['rock', 'edm', 'pop', 'workout'],
      'tristeza': ['sad', 'acoustic', 'indie', 'alternative'],
      'felicidad': ['happy', 'pop', 'dance', 'indie']
    };

    const genres = moodToGenre[mood.toLowerCase()] || ['pop'];
    
    try {
      // Buscar playlists relacionadas
      const playlists = await this.search(`${mood} music`, 'playlist', 5);
      
      return {
        mood: mood,
        playlists: playlists,
        suggestion: `Encontré ${playlists.length} playlists para ${mood}`
      };

    } catch (error) {
      logger.error('Error getting mood recommendations:', error);
      return { mood, playlists: [], suggestion: 'No pude obtener recomendaciones' };
    }
  }

  /**
   * Reproduce música según actividad
   */
  async playForActivity(activity) {
    const activityQueries = {
      'programar': 'coding music',
      'estudiar': 'study music',
      'trabajar': 'focus music',
      'ejercicio': 'workout music',
      'relajarse': 'chill music',
      'dormir': 'sleep music',
      'cocinar': 'cooking music',
      'leer': 'reading music'
    };

    const query = activityQueries[activity.toLowerCase()] || `${activity} music`;

    try {
      const playlists = await this.search(query, 'playlist', 1);
      
      if (playlists.length > 0) {
        await this.play(playlists[0].uri);
        return {
          success: true,
          message: `Reproduciendo música para ${activity}`,
          playlist: playlists[0].name
        };
      }

      return {
        success: false,
        message: `No encontré música para ${activity}`
      };

    } catch (error) {
      logger.error('Error playing for activity:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Formatea información de reproducción actual para el prompt
   */
  formatCurrentPlaybackForPrompt(playback) {
    if (!playback || !playback.track) {
      return 'No hay música reproduciéndose actualmente.';
    }

    return `MÚSICA ACTUAL:
- Canción: "${playback.track.name}" por ${playback.track.artist}
- Álbum: ${playback.track.album}
- Estado: ${playback.isPlaying ? 'Reproduciendo' : 'Pausado'}
- Dispositivo: ${playback.device.name} (${playback.device.type})
- Volumen: ${playback.device.volume}%
`;
  }
}
