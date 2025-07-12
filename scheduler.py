import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

class DataScheduler:
    """Scheduler for automatic data updates"""
    
    def __init__(self, data_processor, ai_analyzer, weather_service):
        self.data_processor = data_processor
        self.ai_analyzer = ai_analyzer
        self.weather_service = weather_service
        self.scheduler = BackgroundScheduler()
        self.is_running = False
    
    def start(self):
        """Start the scheduler"""
        try:
            if not self.is_running:
                # Schedule different update intervals for different data types
                
                # Update weather data every 30 minutes
                self.scheduler.add_job(
                    func=self._update_weather,
                    trigger=IntervalTrigger(minutes=30),
                    id='weather_update',
                    name='Update Weather Data',
                    replace_existing=True
                )
                
                # Update health data every 2 hours
                self.scheduler.add_job(
                    func=self._update_health_data,
                    trigger=IntervalTrigger(hours=2),
                    id='health_data_update',
                    name='Update Health Data',
                    replace_existing=True
                )
                
                # Generate AI analysis every 6 hours
                self.scheduler.add_job(
                    func=self._update_ai_analysis,
                    trigger=IntervalTrigger(hours=6),
                    id='ai_analysis_update',
                    name='Update AI Analysis',
                    replace_existing=True
                )
                
                # Daily comprehensive update at 6 AM
                self.scheduler.add_job(
                    func=self.update_all_data,
                    trigger=CronTrigger(hour=6, minute=0),
                    id='daily_update',
                    name='Daily Data Update',
                    replace_existing=True
                )
                
                self.scheduler.start()
                self.is_running = True
                logger.info("Data scheduler started successfully")
                
        except Exception as e:
            logger.error(f"Error starting scheduler: {e}")
    
    def stop(self):
        """Stop the scheduler"""
        try:
            if self.is_running:
                self.scheduler.shutdown()
                self.is_running = False
                logger.info("Data scheduler stopped")
        except Exception as e:
            logger.error(f"Error stopping scheduler: {e}")
    
    def _update_weather(self):
        """Update weather data"""
        try:
            logger.info("Updating weather data...")
            if self.weather_service:
                weather_data = self.weather_service.get_current_weather()
                logger.info(f"Weather data updated: {len(weather_data.get('cities', []))} cities")
        except Exception as e:
            logger.error(f"Error updating weather data: {e}")
    
    def _update_health_data(self):
        """Update health data"""
        try:
            logger.info("Updating health data...")
            if self.data_processor:
                self.data_processor.refresh_data()
                logger.info("Health data updated successfully")
        except Exception as e:
            logger.error(f"Error updating health data: {e}")
    
    def _update_ai_analysis(self):
        """Update AI analysis"""
        try:
            logger.info("Updating AI analysis...")
            if self.ai_analyzer and self.data_processor:
                current_data = self.data_processor.get_current_data()
                recommendations = self.ai_analyzer.generate_recommendations(current_data)
                scenarios = self.ai_analyzer.simulate_scenarios(current_data)
                logger.info("AI analysis updated successfully")
        except Exception as e:
            logger.error(f"Error updating AI analysis: {e}")
    
    def update_all_data(self):
        """Update all data sources"""
        try:
            logger.info("Starting comprehensive data update...")
            
            # Update in sequence
            self._update_health_data()
            self._update_weather()
            self._update_ai_analysis()
            
            logger.info("Comprehensive data update completed")
            
        except Exception as e:
            logger.error(f"Error during comprehensive update: {e}")
    
    def get_scheduler_status(self):
        """Get scheduler status"""
        try:
            jobs = []
            for job in self.scheduler.get_jobs():
                jobs.append({
                    'id': job.id,
                    'name': job.name,
                    'next_run': job.next_run_time.isoformat() if job.next_run_time else None,
                    'trigger': str(job.trigger)
                })
            
            return {
                'running': self.is_running,
                'jobs': jobs,
                'status': 'active' if self.is_running else 'stopped'
            }
            
        except Exception as e:
            logger.error(f"Error getting scheduler status: {e}")
            return {
                'running': False,
                'jobs': [],
                'status': 'error'
            }
