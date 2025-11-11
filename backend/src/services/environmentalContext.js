import { logger } from '../utils/logger.js';

/**
 * Servicio de Contexto Ambiental
 * Proporciona información sobre clima, tráfico y noticias
 */
export class EnvironmentalContext {
  constructor(userLocation = null) {
    this.userLocation = userLocation || {
      city: 'Buenos Aires',
      country: 'Argentina',
      timezone: 'America/Argentina/Buenos_Aires',
      lat: -34.6037,
      lon: -58.3816
    };
    
    // APIs gratuitas
    this.weatherApiKey = process.env.OPENWEATHER_API_KEY;
    this.newsApiKey = process.env.NEWS_API_KEY;
  }

  /**
   * Obtiene el clima actual
   */
  async getCurrentWeather() {
    if (!this.weatherApiKey) {
      logger.warn('OpenWeather API key not configured');
      return null;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.userLocation.lat}&lon=${this.userLocation.lon}&appid=${this.weatherApiKey}&units=metric&lang=es`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
        city: data.name,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
      };

    } catch (error) {
      logger.error('Error fetching weather:', error);
      return null;
    }
  }

  /**
   * Obtiene el pronóstico del clima
   */
  async getWeatherForecast(days = 3) {
    if (!this.weatherApiKey) {
      return null;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.userLocation.lat}&lon=${this.userLocation.lon}&appid=${this.weatherApiKey}&units=metric&lang=es&cnt=${days * 8}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Agrupar por día
      const dailyForecasts = {};
      
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('es-ES');
        
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            date,
            temps: [],
            descriptions: [],
            humidity: [],
            rain: 0
          };
        }
        
        dailyForecasts[date].temps.push(item.main.temp);
        dailyForecasts[date].descriptions.push(item.weather[0].description);
        dailyForecasts[date].humidity.push(item.main.humidity);
        if (item.rain) {
          dailyForecasts[date].rain += item.rain['3h'] || 0;
        }
      });
      
      // Calcular promedios
      const forecast = Object.values(dailyForecasts).map(day => ({
        date: day.date,
        tempMax: Math.round(Math.max(...day.temps)),
        tempMin: Math.round(Math.min(...day.temps)),
        description: day.descriptions[Math.floor(day.descriptions.length / 2)],
        humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
        rain: day.rain > 0
      }));
      
      return forecast.slice(0, days);

    } catch (error) {
      logger.error('Error fetching forecast:', error);
      return null;
    }
  }

  /**
   * Obtiene sugerencias de vestimenta según el clima
   */
  async getClothingSuggestion() {
    const weather = await this.getCurrentWeather();
    
    if (!weather) {
      return 'No pude obtener información del clima para sugerencias de vestimenta.';
    }

    const temp = weather.temperature;
    const description = weather.description.toLowerCase();
    
    let suggestion = '';
    
    // Temperatura
    if (temp < 10) {
      suggestion = '🧥 Hace frío. Te recomiendo abrigo, bufanda y guantes.';
    } else if (temp < 18) {
      suggestion = '🧥 Está fresco. Una chaqueta o suéter sería ideal.';
    } else if (temp < 25) {
      suggestion = '👕 Temperatura agradable. Ropa ligera está bien.';
    } else if (temp < 30) {
      suggestion = '☀️ Hace calor. Usa ropa fresca y ligera.';
    } else {
      suggestion = '🔥 Mucho calor. Ropa muy ligera y mantente hidratado.';
    }
    
    // Condiciones especiales
    if (description.includes('lluvia') || description.includes('llovizna')) {
      suggestion += ' ☔ No olvides paraguas o impermeable.';
    }
    
    if (description.includes('nieve')) {
      suggestion += ' ❄️ Abrígate bien, hay nieve.';
    }
    
    if (weather.windSpeed > 20) {
      suggestion += ' 💨 Hay mucho viento, abrígate bien.';
    }
    
    return suggestion;
  }

  /**
   * Obtiene noticias relevantes
   */
  async getNews(category = 'technology', limit = 5) {
    if (!this.newsApiKey) {
      logger.warn('News API key not configured');
      return null;
    }

    try {
      const url = `https://newsapi.org/v2/top-headlines?country=ar&category=${category}&apiKey=${this.newsApiKey}&pageSize=${limit}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt),
        image: article.urlToImage
      }));

    } catch (error) {
      logger.error('Error fetching news:', error);
      return null;
    }
  }

  /**
   * Genera un resumen del contexto ambiental
   */
  async getContextSummary() {
    const weather = await this.getCurrentWeather();
    const forecast = await this.getWeatherForecast(1);
    const clothing = await this.getClothingSuggestion();
    
    let summary = '';
    
    if (weather) {
      summary += `🌡️ Clima en ${weather.city}: ${weather.temperature}°C, ${weather.description}.\n`;
      summary += `Sensación térmica: ${weather.feelsLike}°C.\n`;
      summary += `${clothing}\n`;
    }
    
    if (forecast && forecast.length > 0) {
      const tomorrow = forecast[0];
      summary += `\n📅 Mañana: ${tomorrow.tempMin}°C - ${tomorrow.tempMax}°C, ${tomorrow.description}.\n`;
      if (tomorrow.rain) {
        summary += `⚠️ Posibilidad de lluvia mañana.\n`;
      }
    }
    
    return summary || 'No pude obtener información del contexto ambiental.';
  }

  /**
   * Verifica si es buen momento para salir
   */
  async isGoodTimeToGoOut() {
    const weather = await this.getCurrentWeather();
    
    if (!weather) {
      return { suitable: null, reason: 'No pude verificar el clima' };
    }

    const temp = weather.temperature;
    const description = weather.description.toLowerCase();
    
    // Condiciones malas
    if (description.includes('tormenta') || description.includes('nieve')) {
      return { 
        suitable: false, 
        reason: `No es buen momento. Hay ${weather.description.toLowerCase()}.` 
      };
    }
    
    if (description.includes('lluvia fuerte')) {
      return { 
        suitable: false, 
        reason: 'Está lloviendo fuerte. Mejor espera un poco.' 
      };
    }
    
    if (temp < 5 || temp > 35) {
      return { 
        suitable: false, 
        reason: `La temperatura es extrema (${temp}°C). No es ideal para salir.` 
      };
    }
    
    // Condiciones aceptables con precaución
    if (description.includes('lluvia') || description.includes('llovizna')) {
      return { 
        suitable: true, 
        reason: 'Puedes salir, pero lleva paraguas. 🌧️' 
      };
    }
    
    // Condiciones buenas
    return { 
      suitable: true, 
      reason: `Buen momento para salir. ${temp}°C y ${weather.description}. ☀️` 
    };
  }

  /**
   * Formatea información del clima para el prompt
   */
  async formatWeatherForPrompt() {
    const weather = await this.getCurrentWeather();
    
    if (!weather) {
      return '';
    }

    return `CLIMA ACTUAL:
- Ubicación: ${weather.city}
- Temperatura: ${weather.temperature}°C (sensación: ${weather.feelsLike}°C)
- Condiciones: ${weather.description}
- Humedad: ${weather.humidity}%
- Viento: ${weather.windSpeed} m/s
`;
  }

  /**
   * Actualiza la ubicación del usuario
   */
  updateLocation(location) {
    this.userLocation = { ...this.userLocation, ...location };
    logger.info('User location updated:', this.userLocation);
  }
}
