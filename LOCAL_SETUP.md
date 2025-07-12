# Local Laptop Deployment Guide

## Prerequisites
1. Install Python 3.11 or newer
2. Install Git (if not already installed)

## Step 1: Download the Project
```bash
# Download all project files to your laptop
# Copy the entire project folder from Replit to your local machine
```

## Step 2: Install Dependencies
```bash
# Open terminal/command prompt in the project folder
pip install flask flask-cors flask-sqlalchemy gunicorn numpy openai openpyxl pandas psycopg2-binary requests xlrd xlsxwriter apscheduler email-validator
```

## Step 3: Set Environment Variables
Create a file named `.env` in the project folder:
```
OPENAI_API_KEY=your_openai_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
SESSION_SECRET=your_random_secret_key_here
```

## Step 4: Run the Application
```bash
# Method 1: Using Python directly
python main.py

# Method 2: Using Gunicorn (recommended for production)
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
```

## Step 5: Access Your Dashboard
Open your browser and go to:
- `http://localhost:5000` (local access only)
- `http://your-laptop-ip:5000` (network access)

## Important Files to Copy
Make sure you copy these essential files to your laptop:
- `main.py` - Application entry point
- `app.py` - Main Flask application
- `data_processor.py` - Data processing logic
- `ai_analysis.py` - AI recommendations
- `weather_service.py` - Weather data integration
- `scheduler.py` - Automated updates
- `templates/index.html` - Dashboard interface
- `static/` folder - CSS, JavaScript, and styling
- `data/` folder - Your Excel health data files
- `pyproject.toml` - Project configuration

## Network Access
To let others access your dashboard from other devices:
1. Find your laptop's IP address
2. Make sure Windows Firewall/Mac Firewall allows port 5000
3. Share the link: `http://your-laptop-ip:5000`

## Security Notes
- Only run this on trusted networks
- Keep your API keys secure
- Consider using a VPN for remote access

## Troubleshooting
- If port 5000 is busy, change it to another port like 5001
- Make sure all dependencies are installed
- Check that your API keys are working
- Verify Excel files are in the `data/` folder