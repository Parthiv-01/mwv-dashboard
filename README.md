# MWV Dashboard - Interactive Spatial Data Visualization

A comprehensive React/Next.js dashboard for visualizing spatial and temporal data with interactive maps, polygon drawing, and real-time weather data integration. Built for the MWV Full Stack SDE Internship assignment.

## 🚀 Live Demo

**Deployed Application**: [https://mwv-dashboard-fedn.vercel.app/](https://mwv-dashboard-fedn.vercel.app/)

## 📋 Project Overview

This dashboard provides an interactive interface for visualizing dynamic weather data over a map with timeline controls. Users can draw polygons on the map, apply custom color-coding rules based on temperature data, and analyze spatial-temporal patterns through an intuitive interface.

## ✨ Features Implemented

### Core Requirements ✅

#### 🔹 STEP 1: Timeline Slider
- **Horizontal timeline slider** with 30-day window (±15 days from current date)
- **Dual functionality**:
  - Single point selection for specific hour analysis
  - Range selection for time window analysis
- **Hourly resolution** with visual feedback
- **Interactive controls** with drag and click support

#### 🔹 STEP 2: Interactive Map
- **React Leaflet integration** with OpenStreetMap tiles
- **Map controls**: Pan, zoom, and center reset functionality
- **Polygon persistence** when navigating the map
- **Responsive design** that works across different screen sizes

#### 🔹 STEP 3: Polygon Drawing Tools
- **Interactive polygon creation** with 3-12 point limitation
- **Drawing controls**: Click to add points, right-click to finish
- **Automatic data source assignment** for created polygons
- **Polygon management**: View all polygons with delete functionality
- **Sequential numbering**: Polygons labeled as 1, 2, 3... for easy identification

#### 🔹 STEP 4: Data Source Sidebar
- **Open-Meteo API integration** for real-time weather data
- **Custom color-coding rules** with multiple operators (=, <, >, <=, >=)
- **Visual rule management** with add/delete functionality
- **Temperature threshold configuration** with intuitive UI

#### 🔹 STEP 5: Dynamic Color Visualization
- **Real-time polygon coloring** based on temperature data and custom rules
- **Automatic color updates** when timeline changes
- **Centroid-based data fetching** for accurate polygon representation
- **Rule-based color application** with visual feedback

#### 🔹 STEP 6: Open-Meteo API Integration
- **Real-time weather data** fetching from Open-Meteo Archive API
- **Temperature field mapping** (temperature_2m)
- **Error handling** with consistent mock data fallback
- **Lat/lon based queries** for accurate geographical data

#### 🔹 STEP 7: Dynamic Timeline Updates
- **Automatic data refresh** when timeline slider changes
- **Polygon color updates** based on new time window
- **Average calculation** for range mode selections
- **Smooth visual transitions** for better user experience

### Bonus Features ✅

- ✅ **Map Region Labels**: Clean numbered labels (1, 2, 3...) displayed on polygon centers
- ✅ **Responsive Design**: Mobile-friendly interface with Ant Design components
- ✅ **Error Handling**: Robust API error handling with fallback data
- ✅ **Production Optimization**: SSR disabled for client-side components
- ✅ **TypeScript Implementation**: Full type safety throughout the application
- ✅ **Visual Polish**: Professional UI with hover effects and loading states

## 🛠️ Tech Stack

### Required Technologies
- **Framework**: Next.js 14.0.0 with TypeScript
- **UI Library**: Ant Design 5.11.0 for components
- **State Management**: Zustand 4.4.6 for application state
- **Mapping**: React Leaflet 4.2.1 with OpenStreetMap
- **Styling**: Tailwind CSS for responsive design

### Additional Libraries
- **API Client**: Axios 1.6.0 for HTTP requests
- **Date Handling**: date-fns 2.30.0 for time calculations
- **Timeline Control**: react-range 1.8.14 for slider functionality
- **Icons**: Ant Design Icons 5.2.6 for UI elements

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation & Setup
```bash
git clone https://github.com/Parthiv-01/mwv-dashboard.git
cd mwv-dashboard
npm install
npm run dev
Navigate to [http://localhost:3000](http://localhost:3000)
```

## 📖 How to Use

### 1. Drawing Polygons
1. Click **"Draw Polygon"** button in the tools panel
2. Click on the map to add points (minimum 3, maximum 12)
3. Right-click to finish drawing or reach 12 points automatically
4. Polygon will be numbered sequentially and display temperature data

### 2. Timeline Control
1. Use the **slider** to select specific time periods
2. Toggle between **"Single"** and **"Range"** modes
3. **Single mode**: Analyze specific hour
4. **Range mode**: Analyze average over time window
5. Click **"Reset to Now"** to jump to current time

### 3. Color Rules Configuration
1. Navigate to **"Color Coding Rules"** in the sidebar
2. **Add rules**: Select operator, temperature value, and color
3. **Manage rules**: View active rules and delete as needed
4. **See results**: Polygons automatically update colors based on rules

### 4. Data Analysis
- **Temperature values** display in the Active Polygons panel
- **Color-coded regions** show temperature ranges visually
- **Map labels** (1, 2, 3...) help identify specific polygons
- **Real-time updates** when changing timeline or rules

## 🌐 API Integration

### Open-Meteo Archive API
- **Endpoint**: `https://archive-api.open-meteo.com/v1/archive`
- **Parameters**: latitude, longitude, start_date, end_date, hourly=temperature_2m
- **Data Field**: temperature_2m (2-meter temperature in Celsius)
- **Fallback**: Consistent mock data when API is unavailable

### Example API Call
const response = await axios.get(
https://archive-api.open-meteo.com/v1/archive?latitude=22.57&longitude=88.36&start_date=2025-07-24&end_date=2025-08-08&hourly=temperature_2m
);


## 🔧 Key Implementation Details

### Timeline Slider Logic
- **30-day window**: 15 days before and after current date
- **Hourly resolution**: 720 total hours (30 days × 24 hours)
- **Range calculations**: Automatic start/end time generation
- **Debounced updates**: 500ms delay to prevent excessive API calls

### Polygon Data Management
- **Centroid calculation**: Average of all polygon vertices
- **Sequential naming**: Auto-generated "Polygon 1", "Polygon 2", etc.
- **Color rule application**: Real-time evaluation of temperature thresholds
- **State persistence**: Polygons maintained across timeline changes

### API Error Handling
- **15-second timeout** for API requests
- **Fallback data generation** based on geographical coordinates
- **Consistent mock temperatures** using coordinate-based seeding
- **Error logging** for debugging in production

### Production Optimizations
- **SSR disabled** for map components to prevent window undefined errors
- **Dynamic imports** for client-side only components
- **Error boundaries** for graceful failure handling
- **Optimized builds** with Next.js production configuration

## 🎯 Assignment Requirements Met

### Functional Requirements ✅
- [x] Interactive timeline slider with range/single mode (STEP 1)
- [x] Interactive map with polygon drawing (3-12 points) (STEP 2 & 3)
- [x] Data source sidebar with color rules (STEP 4)
- [x] Dynamic polygon coloring based on data (STEP 5)
- [x] Open-Meteo API integration (STEP 6)
- [x] Timeline-driven data updates (STEP 7)

### Technical Requirements ✅
- [x] React/Next.js with TypeScript
- [x] State management (Zustand)
- [x] Mapping library (React Leaflet)
- [x] UI library (Ant Design)
- [x] Modern development practices

### Bonus Features ✅
- [x] Responsive design for mobile/tablet
- [x] Professional UI with animations
- [x] Robust error handling
- [x] Production deployment
- [x] Clean code architecture

## 🚀 Deployment

The application is deployed on **Vercel** with automatic deployments from the main branch.

**Live URL**: [https://mwv-dashboard-fedn.vercel.app/](https://mwv-dashboard-fedn.vercel.app/)

### Deployment Commands
npm install -g vercel
vercel --prod
