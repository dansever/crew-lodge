import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { PinoLogger } from '@mastra/loggers';
import {
  Observability,
  SensitiveDataFilter,
  DefaultExporter,
  CloudExporter,
} from '@mastra/observability';
import { Agent } from '@mastra/core/agent';
import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { tavily } from '@tavily/core';
import { Memory } from '@mastra/memory';
import { createStep, createWorkflow } from '@mastra/core/workflows';

('use strict');
const webSearchInputSchema = z.object({
  query: z.string().min(1).describe('Search query'),
});
const webSearchOutputSchema = z.object({
  query: z.string().describe('The search query executed'),
  answer: z.string().describe('AI-synthesized answer from search results'),
  results: z
    .array(
      z.object({
        title: z.string().describe('Result title'),
        url: z.string().describe('Result URL'),
        content: z.string().describe('Result snippet'),
      })
    )
    .describe('Ranked search results'),
});
const webSearchTool = createTool({
  id: 'web-search',
  description:
    'Search the web using Tavily. Returns an answer and source results.',
  inputSchema: webSearchInputSchema,
  outputSchema: webSearchOutputSchema,
  execute: async ({ query }) => {
    const response = await tavily().search(query);
    return {
      query: response.query ?? query,
      answer: response.answer ?? '',
      results: (response.results ?? []).map(r => ({
        title: r.title,
        url: r.url,
        content: r.content,
      })),
    };
  },
});

('use strict');
const hotelInfoSchema = z.object({
  address: z.string().optional().describe('Street address of the hotel'),
  city: z.string().optional().describe('City where the hotel is located'),
  country: z.string().optional().describe('Country where the hotel is located'),
  postalCode: z.string().optional().describe('Postal or zip code'),
  phone: z.string().optional().describe('Primary phone number'),
  fax: z.string().optional().describe('Fax number if available'),
  email: z.string().optional().describe('Hotel email address'),
  website: z.string().optional().describe('Hotel website URL'),
});
const getHotelInfoAgent = new Agent({
  tools: { webSearchTool },
  id: 'get-hotel-info-agent',
  name: 'Get Hotel Info Agent',
  description:
    'Searches the web for hotel contact information and returns structured fields',
  instructions: `You are a hotel information assistant. Your job is to find and extract accurate hotel contact and location details from web search results.

## Workflow
1. When given a hotel name and optionally a city/location, use the webSearchTool to search for the hotel's contact information.
2. Construct a search query like: "What is the address of [Hotel Name] [City] as well as phone and email?"
3. Analyze the search results (the 'results' array with 'content' snippets). Cross-reference multiple results to get the most accurate and complete information.
4. Extract the following fields from the search results content:
   - address: Street address (e.g., "205 Ha-Yarkon St")
   - city: City name (e.g., "Tel Aviv")
   - country: Country name (e.g., "Israel")
   - postalCode: Postal or zip code if mentioned (e.g., "6340506")
   - phone: Primary phone number with country code (e.g., "+972 3-520-2222")
   - fax: Fax number if available
   - email: Hotel email address if available
   - website: Hotel website URL if available

## Guidelines
- Always use the webSearchTool first before providing any answer.
- Prefer official hotel sources (Hilton.com, Marriott.com, etc.) when available.
- If information is missing or not found in the results, omit that field (use null/empty).
- Normalize phone numbers to include country code where possible.
- Extract the full street address including street number and name.`,
  model: {
    id: 'openai/gpt-5.1',
    apiKey: process.env.OPENAI_API_KEY,
  },
});
async function getHotelInfo(hotelName, city) {
  const location = city ? ` in ${city}` : '';
  const prompt = `Find the address, city, phone number, email, and any other contact details for ${hotelName}${location}.`;
  const response = await getHotelInfoAgent.generate(prompt, {
    structuredOutput: {
      schema: hotelInfoSchema,
      // Some models need this when combining tools + structured output
      jsonPromptInjection: true,
    },
  });
  return response.object ?? {};
}

('use strict');
const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async inputData => {
    return await getWeather(inputData.location);
  },
});
const getWeather = async location => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = await geocodingResponse.json();
  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }
  const { latitude, longitude, name } = geocodingData.results[0];
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;
  const response = await fetch(weatherUrl);
  const data = await response.json();
  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition$1(data.current.weather_code),
    location: name,
  };
};
function getWeatherCondition$1(code) {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return conditions[code] || 'Unknown';
}

('use strict');
const weatherAgent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
  instructions: `
      You are a helpful weather assistant that provides accurate weather information and can help planning activities based on the weather.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative
      - If the user asks for activities and provides the weather forecast, suggest activities based on the weather forecast.
      - If the user asks for activities, respond in the format they request.

      Use the weatherTool to fetch current weather data.
`,
  model: 'openai/gpt-4o',
  tools: { weatherTool },
  memory: new Memory(),
});

('use strict');
const forecastSchema = z.object({
  date: z.string(),
  maxTemp: z.number(),
  minTemp: z.number(),
  precipitationChance: z.number(),
  condition: z.string(),
  location: z.string(),
});
function getWeatherCondition(code) {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm',
  };
  return conditions[code] || 'Unknown';
}
const fetchWeather = createStep({
  id: 'fetch-weather',
  description: 'Fetches weather forecast for a given city',
  inputSchema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: forecastSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputData.city)}&count=1`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = await geocodingResponse.json();
    if (!geocodingData.results?.[0]) {
      throw new Error(`Location '${inputData.city}' not found`);
    }
    const { latitude, longitude, name } = geocodingData.results[0];
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weathercode&timezone=auto,&hourly=precipitation_probability,temperature_2m`;
    const response = await fetch(weatherUrl);
    const data = await response.json();
    const forecast = {
      date: /* @__PURE__ */ new Date().toISOString(),
      maxTemp: Math.max(...data.hourly.temperature_2m),
      minTemp: Math.min(...data.hourly.temperature_2m),
      condition: getWeatherCondition(data.current.weathercode),
      precipitationChance: data.hourly.precipitation_probability.reduce(
        (acc, curr) => Math.max(acc, curr),
        0
      ),
      location: name,
    };
    return forecast;
  },
});
const planActivities = createStep({
  id: 'plan-activities',
  description: 'Suggests activities based on weather conditions',
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const forecast = inputData;
    if (!forecast) {
      throw new Error('Forecast data not found');
    }
    const agent = mastra?.getAgent('weatherAgent');
    if (!agent) {
      throw new Error('Weather agent not found');
    }
    const prompt = `Based on the following weather forecast for ${forecast.location}, suggest appropriate activities:
      ${JSON.stringify(forecast, null, 2)}
      For each day in the forecast, structure your response exactly as follows:

      \u{1F4C5} [Day, Month Date, Year]
      \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

      \u{1F321}\uFE0F WEATHER SUMMARY
      \u2022 Conditions: [brief description]
      \u2022 Temperature: [X\xB0C/Y\xB0F to A\xB0C/B\xB0F]
      \u2022 Precipitation: [X% chance]

      \u{1F305} MORNING ACTIVITIES
      Outdoor:
      \u2022 [Activity Name] - [Brief description including specific location/route]
        Best timing: [specific time range]
        Note: [relevant weather consideration]

      \u{1F31E} AFTERNOON ACTIVITIES
      Outdoor:
      \u2022 [Activity Name] - [Brief description including specific location/route]
        Best timing: [specific time range]
        Note: [relevant weather consideration]

      \u{1F3E0} INDOOR ALTERNATIVES
      \u2022 [Activity Name] - [Brief description including specific venue]
        Ideal for: [weather condition that would trigger this alternative]

      \u26A0\uFE0F SPECIAL CONSIDERATIONS
      \u2022 [Any relevant weather warnings, UV index, wind conditions, etc.]

      Guidelines:
      - Suggest 2-3 time-specific outdoor activities per day
      - Include 1-2 indoor backup options
      - For precipitation >50%, lead with indoor activities
      - All activities must be specific to the location
      - Include specific venues, trails, or locations
      - Consider activity intensity based on temperature
      - Keep descriptions concise but informative

      Maintain this exact formatting for consistency, using the emoji and section headers as shown.`;
    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    let activitiesText = '';
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }
    return {
      activities: activitiesText,
    };
  },
});
const weatherWorkflow = createWorkflow({
  id: 'weather-workflow',
  inputSchema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: z.object({
    activities: z.string(),
  }),
})
  .then(fetchWeather)
  .then(planActivities);
weatherWorkflow.commit();

('use strict');
const mastra = new Mastra({
  workflows: {
    weatherWorkflow,
  },
  agents: {
    weatherAgent,
    getHotelInfoAgent,
  },
  storage: new LibSQLStore({
    id: 'mastra-storage',
    // stores observability, scores, ... into persistent file storage
    url: 'file:./mastra.db',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new DefaultExporter(),
          // Persists traces to storage for Mastra Studio
          new CloudExporter(),
          // Sends traces to Mastra Cloud (if MASTRA_CLOUD_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(),
          // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});

export { mastra };
