// Global variables
let diseaseChart;
let diseaseMap;
let updateInterval;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    initializeDashboard();
    
    // Set up auto-refresh every 5 minutes
    updateInterval = setInterval(refreshData, 300000);
});

// Initialize all dashboard components
function initializeDashboard() {
    loadDashboardData();
    loadWeatherData();
    loadAIRecommendations();
    loadScenarioSimulations();
    loadHealthAlerts();
    loadHighRiskAreas();
    loadDiseaseSurveillance();
    loadClimateMonitoring();
    initializeMap();
    initializeChart();
}

// Load main dashboard statistics
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        const response = await fetch('/api/dashboard-data');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateDashboardStats(data);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorMessage('Failed to load dashboard data. Please check your connection.');
    }
}

// Update dashboard statistics
function updateDashboardStats(data) {
    try {
        // Update main stats
        document.getElementById('malaria-cases').textContent = formatNumber(data.malaria_cases || 0);
        document.getElementById('dengue-cases').textContent = formatNumber(data.dengue_cases || 0);
        document.getElementById('respiratory-cases').textContent = formatNumber(data.respiratory_cases || 0);
        document.getElementById('vaccination-coverage').textContent = formatPercentage(data.vaccination_coverage || 0);
        
        // Update trends
        updateTrend('malaria-trend', data.malaria_trend || 0);
        updateTrend('dengue-trend', data.dengue_trend || 0);
        updateTrend('respiratory-trend', data.respiratory_trend || 0);
        updateTrend('vaccination-trend', data.vaccination_trend || 0);
        
        // Update last updated time
        document.getElementById('last-updated').innerHTML = 
            '<i class="fas fa-clock me-1"></i>Last updated: ' + formatDateTime(new Date());
        
        console.log('Dashboard stats updated successfully');
        
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

// Update trend indicators
function updateTrend(elementId, trendValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let icon, trendClass, trendText;
    
    if (trendValue > 0) {
        icon = 'fas fa-arrow-up';
        trendClass = 'trend-up';
        trendText = `+${trendValue.toFixed(1)}%`;
    } else if (trendValue < 0) {
        icon = 'fas fa-arrow-down';
        trendClass = 'trend-down';
        trendText = `${trendValue.toFixed(1)}%`;
    } else {
        icon = 'fas fa-minus';
        trendClass = 'trend-stable';
        trendText = 'Stable';
    }
    
    element.innerHTML = `
        <i class="${icon} ${trendClass} me-1"></i>
        <small>${trendText}</small>
    `;
}

// Load weather data
async function loadWeatherData() {
    try {
        console.log('Loading weather data...');
        const response = await fetch('/api/weather-data');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateWeatherWidget(data);
        
    } catch (error) {
        console.error('Error loading weather data:', error);
        showErrorMessage('Failed to load weather data.');
    }
}

// Update weather widget
function updateWeatherWidget(data) {
    try {
        const summary = data.national_summary || {};
        const cities = data.cities || [];
        
        // Filter for high-risk areas (cities with high disease cases)
        const highRiskCities = ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta'];
        const highRiskWeather = cities.filter(city => highRiskCities.includes(city.city));
        
        // Show weather for high-risk areas or national summary
        if (highRiskWeather.length > 0) {
            const avgTemp = highRiskWeather.reduce((sum, city) => sum + city.temperature, 0) / highRiskWeather.length;
            const avgHumidity = highRiskWeather.reduce((sum, city) => sum + city.humidity, 0) / highRiskWeather.length;
            const avgWind = highRiskWeather.reduce((sum, city) => sum + city.wind_speed, 0) / highRiskWeather.length;
            const avgPressure = highRiskWeather.reduce((sum, city) => sum + city.pressure, 0) / highRiskWeather.length;
            
            document.getElementById('weather-temp').textContent = `${Math.round(avgTemp)}°C`;
            document.getElementById('weather-description').textContent = 
                `High-Risk Areas: ${highRiskWeather.map(c => c.city).join(', ')}`;
            document.getElementById('weather-humidity').textContent = Math.round(avgHumidity);
            document.getElementById('weather-wind').textContent = avgWind.toFixed(1);
            document.getElementById('weather-pressure').textContent = Math.round(avgPressure);
        } else {
            document.getElementById('weather-temp').textContent = 
                `${Math.round(summary.avg_temperature || 0)}°C`;
            document.getElementById('weather-description').textContent = 
                summary.conditions || 'Data unavailable';
            document.getElementById('weather-humidity').textContent = 
                Math.round(summary.avg_humidity || 0);
            document.getElementById('weather-wind').textContent = 
                (summary.avg_wind_speed || 0).toFixed(1);
            document.getElementById('weather-pressure').textContent = 
                Math.round(summary.avg_pressure || 0);
        }
        
        // Update climate alerts
        updateClimateAlerts(cities);
        
        console.log('Weather data updated successfully');
        
    } catch (error) {
        console.error('Error updating weather widget:', error);
    }
}

// Update climate alerts
function updateClimateAlerts(cities) {
    const alertsContainer = document.getElementById('climate-alerts');
    if (!alertsContainer) return;
    
    let alertsHTML = '';
    let alertCount = 0;
    
    // Load weather alerts from the API
    fetch('/api/weather-alerts')
        .then(response => response.json())
        .then(alertData => {
            const alerts = alertData.alerts || [];
            
            if (alerts.length > 0) {
                alerts.forEach(alert => {
                    const severityClass = alert.severity === 'high' ? 'danger' : 
                                        alert.severity === 'medium' ? 'warning' : 'info';
                    
                    alertsHTML += `
                        <div class="alert alert-${severityClass} alert-dismissible fade show mb-2" role="alert">
                            <strong><i class="fas fa-exclamation-triangle me-2"></i>${alert.city}</strong>
                            <br><small>${alert.message}</small>
                            <br><em class="text-muted">${alert.health_impact || 'Health impact assessment needed'}</em>
                        </div>
                    `;
                    alertCount++;
                });
            } else {
                alertsHTML = `
                    <div class="alert alert-info" role="alert">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Monitoring Active</strong>
                        <br><small>Currently monitoring climate conditions across high-risk areas</small>
                    </div>
                `;
            }
            
            alertsContainer.innerHTML = alertsHTML;
            
            // Update alert count if there's a counter element
            const alertCounter = document.getElementById('climate-alert-count');
            if (alertCounter) {
                alertCounter.textContent = alertCount;
            }
        })
        .catch(error => {
            console.error('Error loading climate alerts:', error);
            alertsContainer.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Alert System Status</strong>
                    <br><small>Climate monitoring system is active. No immediate alerts.</small>
                </div>
            `;
        });
    
    // Also show alerts for cities with high disease cases
    const highCaseCities = cities.filter(city => city.disease_cases > 3000);
    
    highCaseCities.forEach(city => {
        if (city.temperature > 35) {
            alertsHTML += `
                <div class="alert-item alert-high">
                    <i class="fas fa-thermometer-full me-2"></i>
                    <strong>Heat Warning:</strong> ${city.city} - ${city.temperature}°C<br>
                    <small>High temperature increases malaria transmission risk (${formatNumber(city.disease_cases)} cases)</small>
                </div>
            `;
            alertCount++;
        }
        
        if (city.humidity > 75) {
            alertsHTML += `
                <div class="alert-item alert-medium">
                    <i class="fas fa-tint me-2"></i>
                    <strong>High Humidity:</strong> ${city.city} - ${city.humidity}%<br>
                    <small>Creates breeding conditions for disease vectors (${formatNumber(city.disease_cases)} cases)</small>
                </div>
            `;
            alertCount++;
        }
        
        if (city.temperature > 30 && city.humidity > 70) {
            alertsHTML += `
                <div class="alert-item alert-high">
                    <i class="fas fa-bug me-2"></i>
                    <strong>Vector Alert:</strong> ${city.city} - Optimal conditions for disease vectors<br>
                    <small>Temperature ${city.temperature}°C + Humidity ${city.humidity}% = High transmission risk</small>
                </div>
            `;
            alertCount++;
        }
    });
    
    if (alertCount === 0) {
        alertsHTML = `
            <div class="alert-item alert-low">
                <i class="fas fa-check-circle me-2"></i>
                No climate-related health alerts at this time.
            </div>
        `;
    }
    
    alertsContainer.innerHTML = alertsHTML;
}

// Load AI recommendations
async function loadAIRecommendations() {
    try {
        console.log('Loading AI recommendations...');
        const response = await fetch('/api/ai-recommendations');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateAIRecommendations(data);
        
    } catch (error) {
        console.error('Error loading AI recommendations:', error);
        showErrorMessage('Failed to load AI recommendations.');
    }
}

// Update AI recommendations
function updateAIRecommendations(data) {
    const container = document.getElementById('ai-recommendations');
    if (!container) return;
    
    try {
        let html = '';
        
        if (data.priority_actions && data.priority_actions.length > 0) {
            data.priority_actions.forEach(action => {
                const priorityClass = action.priority === 'high' ? 'text-danger' : 
                                   action.priority === 'medium' ? 'text-warning' : 'text-info';
                
                html += `
                    <div class="recommendation-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="mb-1">${action.action}</h6>
                                <small class="text-muted">${action.resources_needed}</small>
                                ${action.target_areas ? `<div class="target-areas mt-2">
                                    <strong>Target Areas:</strong> 
                                    <span class="badge bg-info me-1">${action.target_areas.join('</span> <span class="badge bg-info me-1">')}</span>
                                </div>` : ''}
                            </div>
                            <span class="badge bg-primary ${priorityClass}">${action.priority}</span>
                        </div>
                        <small class="text-muted">Timeline: ${action.timeline}</small>
                    </div>
                `;
            });
        } else {
            html = `
                <div class="recommendation-item">
                    <i class="fas fa-info-circle me-2"></i>
                    No specific recommendations available at this time.
                </div>
            `;
        }
        
        container.innerHTML = html;
        console.log('AI recommendations updated successfully');
        
    } catch (error) {
        console.error('Error updating AI recommendations:', error);
    }
}

// Load scenario simulations
async function loadScenarioSimulations() {
    try {
        console.log('Loading scenario simulations...');
        const response = await fetch('/api/scenario-simulation');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateScenarioSimulations(data);
        
    } catch (error) {
        console.error('Error loading scenario simulations:', error);
        showErrorMessage('Failed to load scenario simulations.');
    }
}

// Update scenario simulations with enhanced AI display
function updateScenarioSimulations(data) {
    const container = document.getElementById('scenario-simulations');
    if (!container) return;
    
    try {
        let html = '';
        
        if (data.scenarios && data.scenarios.length > 0) {
            data.scenarios.forEach((scenario, index) => {
                const probabilityNum = parseInt(scenario.probability.replace('%', ''));
                const probabilityClass = probabilityNum > 40 ? 'success' : probabilityNum > 25 ? 'warning' : 'danger';
                
                html += `
                    <div class="scenario-card mb-4 border-0 shadow-sm">
                        <div class="card-header bg-gradient d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-0">${scenario.name}</h6>
                                <small class="text-muted">${scenario.ai_model || 'AI Model'} • ${scenario.timeline || 'Timeline N/A'}</small>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-${probabilityClass} fs-6">${scenario.probability}</span>
                                <br><small class="text-muted">${scenario.confidence_level || 'Confidence: N/A'}</small>
                            </div>
                        </div>
                        <div class="card-body">
                            <p class="mb-3 text-muted">${scenario.description}</p>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <h6 class="text-primary"><i class="fas fa-cogs me-2"></i>AI-Analyzed Factors:</h6>
                                    <ul class="list-unstyled">
                                        ${scenario.key_factors.map(factor => `
                                            <li class="mb-1"><i class="fas fa-check-circle text-success me-2"></i>
                                                <small>${factor}</small>
                                            </li>`).join('')}
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-success"><i class="fas fa-chart-line me-2"></i>Expected Outcomes:</h6>
                                    <ul class="list-unstyled">
                                        ${Object.entries(scenario.expected_outcomes).map(([key, value]) => `
                                            <li class="mb-1"><i class="fas fa-arrow-right text-info me-2"></i>
                                                <small><strong>${key.replace('_', ' ')}:</strong> ${value}</small>
                                            </li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                            
                            ${scenario.target_districts ? `
                                <div class="mb-3">
                                    <h6 class="text-warning"><i class="fas fa-map-marker-alt me-2"></i>Target Districts:</h6>
                                    <div class="target-districts">
                                        ${scenario.target_districts.map(district => 
                                            `<span class="badge bg-info text-light me-1 mb-1">${district}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="row">
                                <div class="col-md-8">
                                    <h6 class="text-danger"><i class="fas fa-tools me-2"></i>Required Interventions:</h6>
                                    <div class="intervention-tags">
                                        ${scenario.interventions_needed.map(intervention => 
                                            `<span class="badge bg-warning text-dark me-1 mb-1">${intervention}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                                <div class="col-md-4 text-end">
                                    ${scenario.budget_estimate ? `
                                        <h6 class="text-success"><i class="fas fa-dollar-sign me-1"></i>Budget:</h6>
                                        <span class="text-success font-weight-bold">${scenario.budget_estimate}</span>
                                    ` : ''}
                                </div>
                            </div>
                            
                            ${scenario.success_indicators ? `
                                <div class="mt-3 pt-3 border-top">
                                    <h6 class="text-secondary"><i class="fas fa-bullseye me-2"></i>Success Indicators:</h6>
                                    <div class="success-indicators">
                                        ${scenario.success_indicators.map(indicator => 
                                            `<span class="badge bg-secondary text-light me-1 mb-1">${indicator}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            
            // Add AI metadata section if available
            if (data.ai_analysis_metadata) {
                html += `
                    <div class="ai-metadata-card mt-4 p-3 bg-light border rounded">
                        <h6 class="text-primary"><i class="fas fa-robot me-2"></i>AI Analysis Metadata</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <small><strong>Model Accuracy:</strong> ${data.ai_analysis_metadata.model_performance?.prediction_accuracy || 'N/A'}</small><br>
                                <small><strong>Data Quality:</strong> ${data.ai_analysis_metadata.model_performance?.data_quality_score || 'N/A'}</small>
                            </div>
                            <div class="col-md-6">
                                <small><strong>Next Analysis:</strong> ${data.next_analysis_scheduled || 'N/A'}</small><br>
                                <small><strong>Last Updated:</strong> ${formatDateTime(new Date(data.last_updated))}</small>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            html = `
                <div class="scenario-card">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Loading AI scenario simulations...
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        console.log('Scenario simulations updated successfully');
        
    } catch (error) {
        console.error('Error updating scenario simulations:', error);
    }
}

// Load health alerts
async function loadHealthAlerts() {
    try {
        console.log('Loading health alerts...');
        const response = await fetch('/api/alerts');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateHealthAlerts(data);
        
    } catch (error) {
        console.error('Error loading health alerts:', error);
        showErrorMessage('Failed to load health alerts.');
    }
}

// Update health alerts
function updateHealthAlerts(alerts) {
    const container = document.getElementById('health-alerts');
    if (!container) return;
    
    try {
        let html = '';
        
        if (alerts && alerts.length > 0) {
            alerts.forEach(alert => {
                const alertClass = alert.priority === 'high' ? 'alert-high' : 
                                 alert.priority === 'medium' ? 'alert-medium' : 'alert-low';
                
                html += `
                    <div class="alert-item ${alertClass}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>${alert.message}</strong>
                                <div class="mt-1">
                                    <small class="text-muted">
                                        <i class="fas fa-map-marker-alt me-1"></i>
                                        ${alert.location || 'Sindh Province (High-risk districts)'}
                                    </small>
                                </div>
                                <small class="text-muted">${alert.date}</small>
                            </div>
                            <span class="badge bg-secondary">${alert.priority}</span>
                        </div>
                    </div>
                `;
            });
        } else {
            html = `
                <div class="alert-item alert-low">
                    <i class="fas fa-check-circle me-2"></i>
                    No active health alerts at this time.
                </div>
            `;
        }
        
        container.innerHTML = html;
        console.log('Health alerts updated successfully');
        
    } catch (error) {
        console.error('Error updating health alerts:', error);
    }
}

// Initialize the disease distribution map
function initializeMap() {
    try {
        // Check if map container exists
        const mapContainer = document.getElementById('diseaseMap');
        if (!mapContainer) {
            console.warn('Map container not found, skipping map initialization');
            return;
        }
        
        // Initialize Leaflet map centered on Pakistan
        diseaseMap = L.map('diseaseMap').setView([30.3753, 69.3451], 5);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(diseaseMap);
        
        // Load map data
        loadMapData();
        
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Load map data
async function loadMapData() {
    try {
        const response = await fetch('/api/map-data');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Loading ${data.length} map locations`);
        updateMapMarkers(data);
        
    } catch (error) {
        console.error('Error loading map data:', error);
        console.error('Error details:', error.message);
    }
}

// Update map markers
function updateMapMarkers(data) {
    try {
        // Check if map is initialized
        if (!diseaseMap) {
            console.warn('Map not initialized yet, skipping marker update');
            return;
        }
        
        // Clear existing markers
        diseaseMap.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                diseaseMap.removeLayer(layer);
            }
        });
        
        // Add new markers with color-coded risk levels
        data.forEach(location => {
            // Determine risk level and color based on cases
            let riskLevel = 'Low';
            let markerColor = '#28a745'; // Green for low risk
            
            if (location.cases > 3000) {
                riskLevel = 'High';
                markerColor = '#dc3545'; // Red for high risk
            } else if (location.cases > 1000) {
                riskLevel = 'Medium';
                markerColor = '#ffc107'; // Yellow for medium risk
            }
            
            // Create custom colored marker
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            const marker = L.marker([location.lat, location.lng], { icon: customIcon })
                .addTo(diseaseMap)
                .bindPopup(`
                    <strong>${location.location}</strong><br>
                    Cases: ${formatNumber(location.cases)}<br>
                    Risk Level: <span style="color: ${markerColor}; font-weight: bold;">${riskLevel}</span><br>
                    Province: ${location.province}
                `);
        });
        
        console.log(`Map markers updated successfully - ${data.length} markers added`);
        
    } catch (error) {
        console.error('Error updating map markers:', error);
    }
}

// Initialize the disease trends chart
function initializeChart() {
    try {
        const ctx = document.getElementById('diseaseChart').getContext('2d');
        
        diseaseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Malaria Cases',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Dengue Cases',
                        data: [],
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Respiratory Cases',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
        
        // Load chart data
        loadChartData();
        
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

// Load chart data
async function loadChartData() {
    try {
        const response = await fetch('/api/disease-trends');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateChart(data);
        
    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

// Update chart with new data
function updateChart(data) {
    try {
        if (!diseaseChart) return;
        
        // Update labels (dates)
        if (data.malaria && data.malaria.dates) {
            diseaseChart.data.labels = data.malaria.dates;
        }
        
        // Update datasets
        if (data.malaria && data.malaria.cases) {
            diseaseChart.data.datasets[0].data = data.malaria.cases;
        }
        
        if (data.dengue && data.dengue.cases) {
            diseaseChart.data.datasets[1].data = data.dengue.cases;
        }
        
        if (data.respiratory && data.respiratory.cases) {
            diseaseChart.data.datasets[2].data = data.respiratory.cases;
        }
        
        diseaseChart.update();
        console.log('Chart updated successfully');
        
    } catch (error) {
        console.error('Error updating chart:', error);
    }
}

// Refresh all dashboard data
async function refreshData() {
    try {
        console.log('Refreshing all dashboard data...');
        
        // Show loading indicators
        showLoadingIndicators();
        
        // Refresh all data
        await Promise.all([
            loadDashboardData(),
            loadWeatherData(),
            loadAIRecommendations(),
            loadScenarioSimulations(),
            loadHealthAlerts(),
            loadHighRiskAreas(),
            loadDiseaseSurveillance(),
            loadClimateMonitoring(),
            loadMapData(),
            loadChartData()
        ]);
        
        // Hide loading indicators
        hideLoadingIndicators();
        
        console.log('All dashboard data refreshed successfully');
        
    } catch (error) {
        console.error('Error refreshing data:', error);
        showErrorMessage('Failed to refresh data. Please try again.');
    }
}

// Show loading indicators
function showLoadingIndicators() {
    const loadingElements = document.querySelectorAll('.loading-spinner');
    loadingElements.forEach(element => {
        element.style.display = 'inline-block';
    });
}

// Hide loading indicators
function hideLoadingIndicators() {
    const loadingElements = document.querySelectorAll('.loading-spinner');
    loadingElements.forEach(element => {
        element.style.display = 'none';
    });
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
    `;
    
    document.body.insertBefore(errorDiv, document.body.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function formatPercentage(num) {
    return `${num.toFixed(1)}%`;
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Load high-risk areas
async function loadHighRiskAreas() {
    try {
        const response = await fetch('/api/high-risk-areas');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateHighRiskAreas(data);
        
    } catch (error) {
        console.error('Error loading high-risk areas:', error);
    }
}

// Update high-risk areas display
function updateHighRiskAreas(data) {
    const container = document.getElementById('high-risk-areas');
    if (!container) return;
    
    try {
        let html = '';
        
        if (data && data.length > 0) {
            data.forEach((area, index) => {
                const riskClass = area.risk_level === 'High' ? 'danger' : 
                                area.risk_level === 'Medium' ? 'warning' : 'info';
                
                html += `
                    <div class="risk-area-item mb-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">${area.location}</h6>
                                <small class="text-muted">${formatNumber(area.cases)} cases</small>
                            </div>
                            <span class="badge bg-${riskClass}">${area.risk_level}</span>
                        </div>
                    </div>
                `;
            });
        } else {
            html = '<div class="text-muted">No high-risk areas identified</div>';
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error updating high-risk areas:', error);
    }
}

// Load disease surveillance data
async function loadDiseaseSurveillance() {
    try {
        const response = await fetch('/api/disease-surveillance');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateDiseaseSurveillance(data);
        
    } catch (error) {
        console.error('Error loading disease surveillance:', error);
    }
}

// Update disease surveillance display
function updateDiseaseSurveillance(data) {
    const container = document.getElementById('disease-surveillance');
    if (!container) return;
    
    try {
        let html = `
            <div class="surveillance-summary">
                <div class="row">
                    <div class="col-md-6">
                        <div class="surveillance-stat">
                            <h4 class="text-primary">${formatNumber(data.total_cases || 0)}</h4>
                            <p class="text-muted">Total Cases Monitored</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="surveillance-stat">
                            <h4 class="text-success">${data.monitoring_districts || 0}</h4>
                            <p class="text-muted">Districts Under Surveillance</p>
                        </div>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-6">
                        <div class="surveillance-stat">
                            <h4 class="text-warning">${data.active_diseases || 0}</h4>
                            <p class="text-muted">Active Disease Categories</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="surveillance-stat">
                            <h4 class="text-info">${data.coverage_percentage || 0}%</h4>
                            <p class="text-muted">Population Coverage</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (data.disease_breakdown && data.disease_breakdown.length > 0) {
            html += '<div class="disease-breakdown mt-4"><h6>Disease Distribution</h6>';
            data.disease_breakdown.slice(0, 5).forEach(disease => {
                const percentage = disease.percentage;
                const barColor = percentage > 60 ? 'bg-danger' : percentage > 30 ? 'bg-warning' : 'bg-success';
                html += `
                    <div class="disease-item mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <span><strong>${disease.disease}</strong></span>
                            <span class="text-muted">${formatNumber(disease.cases)} cases</span>
                        </div>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar ${barColor}" style="width: ${percentage}%">
                                ${percentage.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error updating disease surveillance:', error);
    }
}

// Load climate monitoring data
async function loadClimateMonitoring() {
    try {
        const response = await fetch('/api/climate-monitoring');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateClimateMonitoring(data);
        
    } catch (error) {
        console.error('Error loading climate monitoring:', error);
    }
}

// Update climate monitoring display
function updateClimateMonitoring(data) {
    const container = document.getElementById('climate-monitoring');
    if (!container) return;
    
    try {
        let html = `
            <div class="climate-summary">
                <div class="row">
                    <div class="col-md-4">
                        <div class="climate-metric">
                            <h5 class="text-primary">${Math.round(data.temperature_trends?.current_avg || 0)}°C</h5>
                            <p class="text-muted">Temperature</p>
                            <small class="text-${data.temperature_trends?.trend === 'Rising' ? 'warning' : 'success'}">${data.temperature_trends?.trend || 'Stable'}</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="climate-metric">
                            <h5 class="text-info">${Math.round(data.humidity_analysis?.current_avg || 0)}%</h5>
                            <p class="text-muted">Humidity</p>
                            <small class="text-${data.humidity_analysis?.disease_risk === 'High' ? 'danger' : 'warning'}">Risk: ${data.humidity_analysis?.disease_risk || 'Low'}</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="climate-metric">
                            <h5 class="text-warning">${Math.round(data.temperature_trends?.heat_index || 0)}°C</h5>
                            <p class="text-muted">Heat Index</p>
                            <small class="text-muted">Feels like</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (data.high_risk_areas) {
            html += `
                <div class="high-risk-areas mt-4">
                    <h6>High-Risk Areas Analysis</h6>
                    ${Object.entries(data.high_risk_areas).map(([region, info]) => `
                        <div class="risk-area-card mb-3 p-3 border rounded">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="text-capitalize text-primary">${region.replace('_', ' ')}</h6>
                                    <p class="mb-1"><strong>Districts:</strong> ${info.districts.join(', ')}</p>
                                    <p class="mb-1"><strong>Total Cases:</strong> ${typeof info.total_cases === 'number' ? formatNumber(info.total_cases) : info.total_cases}</p>
                                    <small class="text-muted">${info.climate_factors}</small>
                                </div>
                                <span class="badge bg-danger">High Risk</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        if (data.health_correlations) {
            html += `
                <div class="health-correlations mt-3">
                    <h6>Health Risk Correlations</h6>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="correlation-item">
                                <strong>Malaria Risk</strong>
                                <br><span class="badge bg-${data.health_correlations.malaria_risk === 'High' ? 'danger' : 'warning'} fs-6">${data.health_correlations.malaria_risk}</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="correlation-item">
                                <strong>Dengue Risk</strong>
                                <br><span class="badge bg-${data.health_correlations.dengue_risk === 'High' ? 'danger' : 'warning'} fs-6">${data.health_correlations.dengue_risk}</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="correlation-item">
                                <strong>Respiratory Risk</strong>
                                <br><span class="badge bg-${data.health_correlations.respiratory_risk === 'High' ? 'danger' : 'success'} fs-6">${data.health_correlations.respiratory_risk}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error updating climate monitoring:', error);
    }
}

// Clean up when page unloads
window.addEventListener('beforeunload', function() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
