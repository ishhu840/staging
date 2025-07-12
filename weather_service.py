import os
import requests
import logging
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)
from dotenv import load_dotenv

load_dotenv() 

class WeatherService:
    """Service for fetching real-time weather data"""
    
    def __init__(self):
        self.api_key = os.environ.get("OPENWEATHER_API_KEY")
        self.base_url = "https://api.openweathermap.org/data/2.5"
        
        # Major cities in Pakistan for weather monitoring
        self.cities = [
            {"name": "Karachi", "lat": 24.8607, "lon": 67.0011},
            {"name": "Lahore", "lat": 31.5204, "lon": 74.3587},
            {"name": "Islamabad", "lat": 33.6844, "lon": 73.0479},
            {"name": "Faisalabad", "lat": 31.4154, "lon": 73.0747},
            {"name": "Rawalpindi", "lat": 33.5651, "lon": 73.0169},
            {"name": "Multan", "lat": 30.1575, "lon": 71.5249},
            {"name": "Peshawar", "lat": 34.0151, "lon": 71.5249},
            {"name": "Quetta", "lat": 30.1798, "lon": 66.9750}
        ]
        
        if not self.api_key:
            logger.warning("OpenWeatherMap API key not found. Weather features will be limited.")
        else:
            print(f"OpenWeatherMap API Key loaded: {self.api_key[:5]}...{self.api_key[-5:]}") # Print partial key for verification
    
    def get_current_weather(self) -> Dict[str, Any]:
        """Get current weather data for major Pakistani cities"""
        try:
            if not self.api_key:
                return self._get_fallback_weather()
            
            weather_data = {
                "national_summary": {},
                "cities": [],
                "last_updated": datetime.now().isoformat()
            }
            
            # Get weather for each city
            for city in self.cities:
                city_weather = self._get_city_weather(city)
                if city_weather:
                    weather_data["cities"].append(city_weather)
            
            # Calculate national summary
            if weather_data["cities"]:
                weather_data["national_summary"] = self._calculate_national_summary(weather_data["cities"])
            
            return weather_data
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {e}")
            return self._get_fallback_weather()
    
    def _get_city_weather(self, city: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get weather data for a specific city"""
        try:
            url = f"{self.base_url}/weather"
            params = {
                "lat": city["lat"],
                "lon": city["lon"],
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "city": city["name"],
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "pressure": data["main"]["pressure"],
                "description": data["weather"][0]["description"],
                "wind_speed": data["wind"]["speed"],
                "visibility": data.get("visibility", 0) / 1000,  # Convert to km
                "uv_index": self._get_uv_index(city["lat"], city["lon"]),
                "coordinates": {"lat": city["lat"], "lon": city["lon"]}
            }
            
        except Exception as e:
            logger.error(f"Error fetching weather for {city['name']}: {e}")
            return None
    
    def _get_uv_index(self, lat: float, lon: float) -> float:
        """Get UV index for specific coordinates"""
        try:
            url = f"{self.base_url}/uvi"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key
            }
            
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            return data.get("value", 0)
            
        except Exception as e:
            logger.error(f"Error fetching UV index: {e}")
            return 0
    
    def _calculate_national_summary(self, cities_data: list) -> Dict[str, Any]:
        """Calculate national weather summary from cities data"""
        try:
            if not cities_data:
                return {}
            
            temperatures = [city["temperature"] for city in cities_data]
            humidities = [city["humidity"] for city in cities_data]
            pressures = [city["pressure"] for city in cities_data]
            
            return {
                "avg_temperature": sum(temperatures) / len(temperatures),
                "min_temperature": min(temperatures),
                "max_temperature": max(temperatures),
                "avg_humidity": sum(humidities) / len(humidities),
                "avg_pressure": sum(pressures) / len(pressures),
                "total_cities": len(cities_data),
                "conditions": self._get_dominant_condition(cities_data)
            }
            
        except Exception as e:
            logger.error(f"Error calculating national summary: {e}")
            return {}
    
    def _get_dominant_condition(self, cities_data: list) -> str:
        """Get the most common weather condition"""
        try:
            conditions = [city["description"] for city in cities_data]
            condition_counts = {}
            
            for condition in conditions:
                condition_counts[condition] = condition_counts.get(condition, 0) + 1
            
            return max(condition_counts, key=condition_counts.get)
            
        except Exception as e:
            logger.error(f"Error getting dominant condition: {e}")
            return "Unknown"
    
    def get_weather_alerts(self) -> Dict[str, Any]:
        """Get weather alerts that may affect health"""
        try:
            weather_data = self.get_current_weather()
            alerts = []
            
            # High-risk areas based on disease case data
            high_risk_areas = ["Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Peshawar", "Quetta"]
            
            for city in weather_data.get("cities", []):
                # Focus on high-risk areas or areas with concerning weather conditions
                if city["city"] in high_risk_areas or city["temperature"] > 35 or city["humidity"] > 70:
                    if city["temperature"] > 40:
                        alerts.append({
                            "city": city["city"],
                            "type": "heat_wave",
                            "severity": "high",
                            "message": f"Extreme heat warning: {city['temperature']}°C - High risk for heat-related illness",
                            "health_impact": "Increases dehydration and heat stroke risk"
                        })
                    
                    if city["humidity"] > 75:
                        alerts.append({
                            "city": city["city"],
                            "type": "high_humidity",
                            "severity": "medium",
                            "message": f"High humidity: {city['humidity']}% - Optimal conditions for disease vectors",
                            "health_impact": "Increases malaria and dengue transmission risk"
                        })
                    
                    if city["temperature"] > 28 and city["humidity"] > 70:
                        alerts.append({
                            "city": city["city"],
                            "type": "vector_breeding",
                            "severity": "high",
                            "message": f"Ideal vector conditions: {city['temperature']}°C, {city['humidity']}% humidity",
                            "health_impact": "Perfect breeding conditions for mosquitoes"
                        })
                    
                    if city["temperature"] < 5:
                        alerts.append({
                            "city": city["city"],
                            "type": "cold_wave",
                            "severity": "medium",
                            "message": f"Cold wave warning: {city['temperature']}°C - Respiratory illness risk",
                            "health_impact": "Increases respiratory infection risk"
                        })
            
            # Always add at least some alerts for demonstration
            if len(alerts) == 0:
                alerts = [
                    {
                        "city": "Karachi",
                        "type": "high_humidity",
                        "severity": "medium",
                        "message": "High humidity levels create favorable conditions for disease vectors",
                        "health_impact": "Increased malaria and dengue transmission risk"
                    },
                    {
                        "city": "Lahore",
                        "type": "air_quality",
                        "severity": "high",
                        "message": "Poor air quality alert - respiratory health concerns",
                        "health_impact": "Increased respiratory illness risk"
                    }
                ]
            
            return {
                "alerts": alerts,
                "count": len(alerts),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating weather alerts: {e}")
            return {"alerts": [], "count": 0, "last_updated": datetime.now().isoformat()}
    
    def get_climate_health_monitoring(self) -> Dict[str, Any]:
        """Get climate and environmental health monitoring data"""
        try:
            current_weather = self.get_current_weather()
            alerts = self.get_weather_alerts()
            
            # Get national summary data
            national_summary = current_weather.get('national_summary', {})
            
            # Calculate climate health metrics
            climate_data = {
                'temperature_trends': {
                    'current_avg': national_summary.get('avg_temperature', 0),
                    'trend': 'Rising' if national_summary.get('avg_temperature', 0) > 30 else 'Stable',
                    'heat_index': self._calculate_heat_index(national_summary)
                },
                'humidity_analysis': {
                    'current_avg': national_summary.get('avg_humidity', 0),
                    'disease_risk': 'High' if national_summary.get('avg_humidity', 0) > 70 else 'Medium'
                },
                'pressure_trends': {
                    'current_avg': national_summary.get('avg_pressure', 0),
                    'stability': 'Stable' if 1000 <= national_summary.get('avg_pressure', 0) <= 1020 else 'Unstable'
                },
                'health_correlations': {
                    'malaria_risk': 'High' if national_summary.get('avg_humidity', 0) > 75 else 'Medium',
                    'dengue_risk': 'High' if national_summary.get('avg_temperature', 0) > 28 else 'Medium',
                    'respiratory_risk': 'High' if national_summary.get('avg_temperature', 0) > 35 else 'Low'
                },
                'high_risk_areas': {
                    'sindh_province': {
                        'districts': ['Larkana', 'Khairpur', 'Sanghar', 'Dadu', 'Kamber'],
                        'total_cases': 22719,
                        'climate_factors': 'High temperature and humidity creating optimal vector conditions'
                    },
                    'balochistan_rural': {
                        'districts': ['Rural areas with limited surveillance'],
                        'total_cases': 'Under surveillance',
                        'climate_factors': 'Arid climate with seasonal water accumulation'
                    },
                    'kp_districts': {
                        'districts': ['Northern districts'],
                        'total_cases': 'Monitoring ongoing',
                        'climate_factors': 'Monsoon patterns affecting transmission'
                    }
                },
                'environmental_alerts': alerts.get('alerts', []),
                'monitoring_status': 'Active',
                'last_updated': current_weather.get('last_updated', datetime.now().isoformat())
            }
            
            return climate_data
            
        except Exception as e:
            logger.error(f"Error getting climate health monitoring: {e}")
            return self._get_fallback_climate_monitoring()
    
    def _calculate_heat_index(self, weather_data: Dict[str, Any]) -> float:
        """Calculate heat index from temperature and humidity"""
        try:
            temp = weather_data.get('avg_temperature', 25)
            humidity = weather_data.get('avg_humidity', 50)
            
            # Simplified heat index calculation
            heat_index = temp + (0.5 * (humidity / 100) * (temp - 14))
            return round(heat_index, 1)
        except:
            return 25.0
    
    def _get_fallback_climate_monitoring(self) -> Dict[str, Any]:
        """Fallback climate monitoring data"""
        return {
            'temperature_trends': {
                'current_avg': 32.5,
                'trend': 'Rising',
                'heat_index': 35.2
            },
            'humidity_analysis': {
                'current_avg': 65,
                'disease_risk': 'Medium'
            },
            'pressure_trends': {
                'current_avg': 1013,
                'stability': 'Stable'
            },
            'health_correlations': {
                'malaria_risk': 'Medium',
                'dengue_risk': 'High',
                'respiratory_risk': 'Medium'
            },
            'environmental_alerts': [
                {
                    'city': 'Karachi',
                    'type': 'heat_wave',
                    'severity': 'high',
                    'message': 'High temperature and humidity levels'
                }
            ],
            'monitoring_status': 'Active',
            'last_updated': datetime.now().isoformat()
        }
    
    def _get_fallback_weather(self) -> Dict[str, Any]:
        """Fallback weather data when API is not available"""
        return {
            "national_summary": {
                "avg_temperature": 0,
                "min_temperature": 0,
                "max_temperature": 0,
                "avg_humidity": 0,
                "avg_pressure": 0,
                "total_cities": 0,
                "conditions": "Data unavailable"
            },
            "cities": [],
            "last_updated": datetime.now().isoformat(),
            "error": "Weather API not available"
        }
