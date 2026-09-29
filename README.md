# 🌾 AgriVision — Smart Farming Dashboard with AI Saathi

> **AI-powered decision support for smarter, safer and more sustainable farming**

AgriVision is a smart farming web application designed to bring **farm location intelligence, crop planning, weather awareness, plant-health assistance, mandi information and AI-powered agricultural guidance** into a single dashboard.

The platform is built around **AI Saathi**, a virtual agricultural assistant that provides guidance through multiple expert perspectives including Crop Planner, Plant Doctor, Soil Scientist, Weather Expert and Sustainability Guardian.

AgriVision is especially designed with farming conditions in **Telangana, Andhra Pradesh and other regions of India** in mind.

---

## 🚜 Key Features

### 🤖 AI Saathi

AI Saathi is the central agricultural assistant of AgriVision.

It provides guidance through five expert roles:

* 🌱 **Crop Planner** — crop selection based on season, soil and water availability
* 🩺 **Plant Doctor** — plant disease and pest-related guidance
* 🧪 **Soil Scientist** — soil health, fertilizer and organic matter guidance
* 🌦️ **Weather Expert** — irrigation, rainfall and weather-related advice
* 🛡️ **Sustainability Guardian** — responsible use of water, fertilizers and pesticides

AI Saathi receives the selected farm context such as:

* Location
* PIN code
* State
* Agro-region
* Current season
* Selected crop

This allows the assistant to provide more context-aware agricultural guidance.

When an OpenAI API key is configured, AI Saathi uses the OpenAI model through the AI SDK. Without an API key, the application provides an **offline demo response mode**.

---

## 📍 Farm Location

AgriVision allows farmers to select their farm location using:

* 6-digit PIN code
* Village or location name
* Latitude and longitude
* Current device GPS location

The location is displayed on an interactive map.

The selected location becomes the context for other dashboard modules such as:

* Crop recommendations
* Weather alerts
* Mandi information
* AI Saathi

The map functionality is implemented using **Leaflet and React-Leaflet**.

---

## 🌱 Crop Planner

The Crop Planner recommends crops based on agricultural context such as:

* Indian cropping season
* Soil type
* Water requirements
* Temperature range
* Regional suitability
* Crop popularity
* Sustainability considerations

Supported seasonal concepts include:

* **Kharif** — June to October
* **Rabi** — October to March
* **Zaid** — March to June
* Summer
* Winter

Each crop profile can contain information such as:

* Crop name
* Hindi name
* Suitable seasons
* Water requirement
* Temperature range
* Soil type
* Harvest time
* Farming tips
* Sustainability notes
* Fertilizer limits
* Pesticide guidance
* Mandi information
* Recommended selling window

The dashboard also displays a crop suitability score and season-match information.

---

## 💧 Water & Fertilizer Safety

A major design principle of AgriVision is **sustainable farming**.

The application emphasizes:

* Safe water usage
* Maximum water limits
* Responsible fertilizer usage
* Soil protection
* Organic matter management
* Avoiding excessive pesticide use
* Long-term groundwater protection

The AI Saathi system prompt specifically instructs the assistant to provide safe and maximum limits where applicable and to warn about the long-term effects of excessive chemical and water usage.

---

## 🌦️ Smart Weather Alerts

After a farm location is selected, AgriVision retrieves a **7-day weather forecast** using the Open-Meteo API.

The system evaluates weather information and generates agricultural alerts such as:

### 🌧️ Heavy Rain

Farmers may be advised to:

* Delay pesticide spraying
* Improve field drainage
* Protect harvested crops from moisture

### 💧 Low Rainfall

The system may recommend:

* Planning irrigation
* Using soil mulch
* Avoiding unnecessary fertilizer application without sufficient water

### ☀️ Heat Stress

The system can warn about high-temperature conditions and recommend:

* Early morning or evening irrigation
* Protecting young seedlings
* Monitoring crop stress

### 🐛 Pest Risk

Under suitable warm and humid conditions, the system can generate pest-risk guidance and recommend field scouting and Integrated Pest Management practices.

---

## 🩺 Plant Doctor

Plant Doctor provides a farmer-friendly interface for uploading or capturing a plant/leaf image.

Users can:

1. Upload a plant image
2. Preview the image
3. Start an analysis
4. View the generated demo result
5. See risk severity
6. See confidence information
7. View treatment suggestions

The interface is also designed to work with a mobile camera.

### ⚠️ Current Implementation

The current Plant Doctor implementation is a **prototype/demo feature**.

The uploaded image is processed locally in the browser and the displayed analysis is selected from predefined demo analyses.

It does **not currently run a trained plant-disease detection model**.

A future version can connect this interface to a real computer-vision model or agricultural disease-detection API.

---

## 💰 Mandi / Market Prices

The dashboard provides mandi-price information for the selected crop and location.

The current implementation:

* Displays nearby mandi information
* Shows approximate distance
* Displays price per quintal
* Shows price trend
* Shows crop-specific selling guidance
* Uses a **200 km** nearby-mandi view

### ⚠️ Important

The current mandi values are **indicative demo prices**.

They should not be treated as live market prices.

Farmers should verify current prices through official market sources such as Agmarknet or the relevant local mandi before making a selling decision.

---

## 🌾 Daily Action Plan

The Daily Action Plan provides a simple farmer-oriented view of recommended activities.

It is designed to help convert crop and farm information into practical daily actions such as:

* Field monitoring
* Crop-care activities
* Water management
* Soil-care activities
* Crop-specific recommendations

---

## 🌳 3D Plant Viewer

AgriVision includes a 3D plant visualization component.

The viewer can display a selected crop in an interactive 3D interface and is intended to make the dashboard more engaging and easier to understand.

The project uses:

* Three.js
* React Three Fiber
* React Three Drei

---

## 🏥 Field Health

The Field Health section provides crop-health information through dashboard cards.

It is integrated with the selected crop and the broader farm context to provide a quick overview of field conditions.

---

# 🧠 System Architecture

```text
                        ┌─────────────────────────┐
                        │       AgriVision        │
                        │    Smart Farm Dashboard │
                        └────────────┬────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
       Farm Location            Crop Planner          Weather Alerts
       ─────────────            ────────────          ─────────────
       PIN / Village            Season                7-Day Forecast
       GPS                      Soil                  Rainfall
       Coordinates              Water                 Temperature
       Interactive Map          Region                Pest Risk
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │    Farm Context  │
                            └────────┬─────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
                  ▼                  ▼                  ▼
             Plant Doctor      Mandi Prices      Daily Action Plan
                  │                  │                  │
                  └──────────────────┼──────────────────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │  AI Saathi  │
                              └──────┬──────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │             │              │             │              │
        ▼             ▼              ▼             ▼              ▼
   Crop Planner  Plant Doctor  Soil Scientist  Weather Expert  Sustainability
```

---

# 🛠️ Technology Stack

## Frontend

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS 4**
* **Radix UI**
* **Lucide React**
* **React Hook Form**

## AI

* **AI SDK**
* **@ai-sdk/react**
* **OpenAI**
* `openai/gpt-4o-mini`

## Maps & Location

* **Leaflet**
* **React Leaflet**
* **Mapbox GL**
* Browser Geolocation API

## Visualization

* **Three.js**
* **React Three Fiber**
* **React Three Drei**
* **Recharts**

## Weather

* **Open-Meteo API**

## Utilities

* Zod
* SWR
* date-fns
* Sonner
* Tailwind Merge

---

# 📂 Project Structure

```text
AgriVision/
│
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts
│   │
│   ├── page.tsx
│   └── ...
│
├── components/
│   ├── dashboard/
│   │   ├── dashboard-layout.tsx
│   │   ├── ai-chat-sidebar.tsx
│   │   ├── farm-map.tsx
│   │   ├── crop-recommendations.tsx
│   │   ├── crop-health-cards.tsx
│   │   ├── plant-doctor.tsx
│   │   ├── plant-3d-viewer.tsx
│   │   ├── daily-action-plan.tsx
│   │   ├── weather-alerts.tsx
│   │   ├── market-prices.tsx
│   │   └── stats-cards.tsx
│   │
│   └── ui/
│       └── ...
│
├── hooks/
│   └── ...
│
├── lib/
│   ├── agri-types.ts
│   ├── ai-system-prompt.ts
│   ├── mandi-data.ts
│   ├── region-logic.ts
│   └── ...
│
├── public/
│   └── ...
│
├── .env.example
├── .gitignore
├── components.json
├── next.config.mjs
├── package.json
├── package-lock.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/maddulajayanth517-ux/AgriVision.git
```

## 2. Enter the project directory

```bash
cd AgriVision
```

## 3. Install dependencies

Using npm:

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

---

# 🔐 Environment Variables

Create a `.env.local` file in the project root.

```env
OPENAI_API_KEY=your_openai_api_key_here
```

The repository already provides an `.env.example` file for this configuration.

### Without an OpenAI API Key

The application can still run in **offline demo mode**.

AI Saathi will return predefined agricultural guidance instead of making an OpenAI request.

### With an OpenAI API Key

AI Saathi can generate dynamic responses using the configured OpenAI model.

> **Never commit `.env.local` or real API keys to GitHub.**

---

# ▶️ Running the Application

Start the development server:

```bash
npm run dev
```

The terminal will display the local development address.

Open the displayed address in your browser.

---

# 🏗️ Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Run linting:

```bash
npm run lint
```

Available npm scripts:

| Command         | Purpose                  |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Create production build  |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

---

# 🔄 How AgriVision Works

### Step 1 — Select Farm Location

The farmer enters:

```text
PIN code
      OR
Village / Location
      OR
Latitude, Longitude
      OR
Current GPS Location
```

AgriVision resolves the location and displays it on the farm map.

### Step 2 — Generate Farm Context

The application uses the selected location to determine relevant regional and seasonal information.

### Step 3 — Select a Crop

The Crop Planner displays suitable crop options along with:

* Suitability
* Season match
* Water requirement
* Soil information
* Crop-care information

### Step 4 — Monitor Weather

The weather module retrieves a 7-day forecast and generates agricultural alerts.

### Step 5 — Check Crop Health

The farmer can open Field Health or use Plant Doctor to upload a crop image.

### Step 6 — Check Market Information

After selecting a crop and location, the application displays nearby indicative mandi information.

### Step 7 — Ask AI Saathi

The farmer can ask questions related to:

* Crops
* Soil
* Water
* Weather
* Pests
* Diseases
* Fertilizers
* Sustainable farming

AI Saathi receives the selected farm context along with the question.

---

# 🧑‍🌾 Example AI Saathi Questions

```text
Which Kharif crop is suitable for red soil with less water?

How much water does cotton need per acre?

Should I irrigate before tomorrow's rain?

What should I do if rice leaves develop yellow spots?

How can I improve soil health naturally?

What precautions should I take before using pesticides?
```

---

# 🔒 Safety & Sustainability Design

AgriVision is designed around responsible agricultural decision support.

The AI guidance emphasizes:

* Avoiding excessive irrigation
* Avoiding excessive fertilizer use
* Protecting groundwater
* Maintaining soil organic matter
* Following pesticide labels
* Using Integrated Pest Management
* Consulting agricultural experts when uncertain

AI Saathi is instructed not to invent live mandi prices and to recommend verification of market information before selling decisions.

---

# ⚠️ Prototype Limitations

AgriVision is currently a **working prototype / demonstration platform**.

Some modules use demo or rule-based data rather than fully connected production services.

### Current limitations

* Plant Doctor currently uses predefined demo analyses rather than a trained disease-detection model.
* Mandi prices are indicative demo values and are not live market prices.
* Weather alerts are generated from Open-Meteo forecast data using application-defined rules.
* Crop recommendations are based on the application's agricultural data and scoring logic.
* AI Saathi requires an OpenAI API key for dynamic AI responses.
* Agricultural recommendations should be validated with local agricultural experts for real-world field decisions.

---

# 🚀 Future Enhancements

Possible future improvements include:

### 🤖 Advanced Crop Disease Detection

Integrate a trained computer-vision model for:

* Disease classification
* Pest detection
* Severity estimation
* Leaf segmentation
* Treatment recommendations

### 🌦️ Advanced Weather Intelligence

Add:

* Hyperlocal weather
* Rainfall probability
* Extreme-weather notifications
* Irrigation scheduling
* Historical weather analysis

### 💹 Live Mandi Integration

Connect to official agricultural market data sources to provide:

* Live mandi prices
* Price history
* Market comparison
* Selling recommendations
* Price trend analysis

### 🛰️ Remote Sensing

Future versions can integrate satellite information for:

* NDVI
* Crop stress detection
* Vegetation monitoring
* Drought monitoring
* Field-level crop health

### 📱 Mobile Application

The dashboard can be extended into a dedicated mobile application with:

* Camera-based crop diagnosis
* Voice-based AI Saathi
* Regional languages
* Offline support
* Push notifications

---

# 🎯 Project Goals

AgriVision aims to make agricultural technology:

* **Accessible** — simple interfaces for farmers
* **Context-aware** — location and season based
* **Practical** — focused on actionable recommendations
* **Sustainable** — protects soil and water resources
* **AI-assisted** — provides conversational agricultural guidance
* **Scalable** — designed for future integration with real agricultural data and AI models

---

# 🌱 Vision

> **One dashboard for the farm. One AI Saathi for the farmer.**

AgriVision brings multiple agricultural information sources together so that farmers can make more informed decisions about **what to grow, when to act, how to protect crops, how to manage resources and where to verify market information**.

---

# 📌 Project Status

**Status:** 🚧 Active Prototype

**Application:** Smart Farming Dashboard

**AI Assistant:** AI Saathi

**Primary Region Focus:** Telangana, Andhra Pradesh & India

**Frontend:** Next.js + React + TypeScript

**AI Integration:** OpenAI through AI SDK

**Maps:** Leaflet / React Leaflet

**Weather:** Open-Meteo

---

# 👨‍💻 Author

**Maddula Jayanth**

AgriVision — Smart Farming Dashboard with AI Saathi
