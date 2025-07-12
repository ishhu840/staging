# National Public Health Status Dashboard

## Overview

This is a Flask-based AI-powered health crisis response system designed for Pakistan's national public health monitoring. The application provides real-time health data analysis, weather correlation, AI-generated recommendations, and interactive dashboards for public health officials.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest Update: July 11, 2025)

✓ **Real Data Integration**: Successfully implemented Excel data processing from Pakistan health surveillance
✓ **Map Visualization**: Disease distribution map now shows actual locations with case counts (102 districts)
✓ **High-Risk Area Detection**: Top 5 high-alert areas automatically identified (Larkana, Khairpur, Sanghar, Dadu, Kamber)
✓ **Weather Integration**: Real-time weather data for cities with high disease cases
✓ **API Enhancement**: Added climate monitoring, disease surveillance, and high-risk area endpoints
✓ **AI-Powered Features**: Enhanced AI recommendations and scenario simulations with fallback systems
✓ **JavaScript Enhancement**: Added functions for new dashboard sections and improved error handling
✓ **Geographic Specificity**: All dashboard sections now focus on high-risk areas with explanatory alerts
✓ **Climate Health Alerts**: Fixed display with proper API integration and health impact explanations
✓ **High-Risk Weather**: Current weather conditions now show data specific to high-risk areas
✓ **Educational Footer**: Added comprehensive educational disclaimer and attribution footer

## System Architecture

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Architecture Pattern**: Modular service-oriented design
- **Data Processing**: Pandas for Excel data manipulation and analysis
- **AI Integration**: OpenAI API for health recommendations and analysis
- **Scheduling**: APScheduler for automated data updates
- **Weather Integration**: OpenWeatherMap API for climate data correlation

### Frontend Architecture
- **Template Engine**: Jinja2 (Flask's default templating)
- **CSS Framework**: Bootstrap 5.3.0
- **JavaScript Libraries**: 
  - Leaflet.js for interactive maps
  - Chart.js for data visualization
  - Font Awesome for icons
- **Responsive Design**: Mobile-first approach with Bootstrap grid system

### Key Components

1. **HealthDataProcessor** (`data_processor.py`)
   - Loads and processes health data from Excel files
   - Generates dashboard statistics and analytics
   - Handles data validation and sample data creation

2. **AIAnalyzer** (`ai_analysis.py`)
   - Integrates with OpenAI API for health recommendations
   - Analyzes health data patterns and trends
   - Provides fallback recommendations when AI is unavailable

3. **WeatherService** (`weather_service.py`)
   - Fetches real-time weather data for major Pakistani cities
   - Correlates weather patterns with health data
   - Provides fallback weather data when API is unavailable

4. **DataScheduler** (`scheduler.py`)
   - Manages automated data updates at different intervals
   - Weather updates every 30 minutes
   - Health data updates every 2 hours
   - AI analysis updates every 6 hours

5. **Main Application** (`app.py`)
   - Flask application setup and routing
   - CORS configuration for cross-origin requests
   - Service initialization and error handling

## Data Flow

1. **Data Ingestion**: Excel files are loaded from the `/data` directory
2. **Data Processing**: Raw data is cleaned and transformed using pandas
3. **External Data**: Weather and AI services provide additional context
4. **Analysis**: Combined data is analyzed for patterns and insights
5. **Visualization**: Processed data is served to the frontend via REST API
6. **Scheduling**: Automated updates ensure data freshness

## External Dependencies

### Required APIs
- **OpenAI API**: For AI-powered health recommendations and analysis
- **OpenWeatherMap API**: For real-time weather data correlation

### Python Libraries
- Flask: Web framework
- pandas: Data manipulation and analysis
- numpy: Numerical computations
- APScheduler: Job scheduling
- requests: HTTP client for external APIs
- flask-cors: Cross-origin resource sharing

### Frontend Libraries
- Bootstrap 5.3.0: UI framework
- Leaflet.js: Interactive maps
- Font Awesome: Icon library
- Chart.js: Data visualization (implied from dashboard.js)

## Key Features

1. **Real-time Health Monitoring**: Tracks malaria, dengue, and other diseases
2. **Weather Correlation**: Links climate data with health patterns
3. **AI-Powered Recommendations**: Provides actionable health policy suggestions
4. **Interactive Dashboards**: Visual representation of health data
5. **Automated Updates**: Scheduled data refreshes for current information
6. **Multi-city Coverage**: Monitors health across major Pakistani cities

## Deployment Strategy

- **Development**: Local Flask development server (main.py)
- **Production**: Ready for containerization or cloud deployment
- **Environment Variables**: 
  - `OPENAI_API_KEY`: Required for AI features
  - `OPENWEATHER_API_KEY`: Required for weather data
  - `SESSION_SECRET`: Flask session security
- **Data Storage**: File-based Excel data storage with potential for database migration
- **Fallback Mechanisms**: Graceful degradation when external services are unavailable

## Configuration Notes

- The application includes comprehensive error handling and logging
- Sample data generation ensures the system works even without Excel files
- API key validation prevents crashes when external services are unavailable
- CORS is enabled for potential frontend-backend separation
- The system is designed to be resilient and self-healing with automatic retries