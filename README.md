# IndiaRide 🧭
### Smart Multimodal Transit & Budget Navigator for Pune, Maharashtra

IndiaRide is an ultra-clean, deterministic multimodal transit navigation web application designed specifically for Indian urban commuters. 

For the MVP, IndiaRide targets **Pune, Maharashtra**, integrating the **Pune Metro** (Maha Metro Purple Line & Aqua Line + District Court interchange) alongside **Auto Rickshaws**, **Bike Taxis**, **Cabs**, and **Walking**.

---

## 1. Core Value Proposition
A commuter inputs:
1. **Starting Location** (e.g. *Hinjewadi Phase 1*)
2. **Destination** (e.g. *Shivajinagar*)
3. **Budget** (e.g. *₹150*)
4. **Preference** (*Cheapest* vs. *Fastest* vs. *Balanced*)

IndiaRide immediately compares all options side-by-side with:
- **Estimated Travel Time**
- **Distance**
- **Exact Fare / Tariff Breakdown**
- **Pune Metro Route with First/Last Mile Connection**
- **Plain-English Recommendation Explanation** (e.g., *"Recommended because it is ₹60 cheaper and only 7 minutes slower."*)

---

## 2. Minimalist UI/UX (Inspired by Xeroxic)
- **Zero Clutter**: No noisy sidebars, no overwhelming charts, no aggressive badges.
- **High-Contrast Simplicity**: Soft off-white backdrop (`#fcfcfd`), crisp dark typography, 1px subtle borders, and generous whitespace.
- **Obvious Primary Action**: Direct, responsive comparison with instant visual feedback on desktop and mobile.

---

## 3. Technology Stack & Architecture

- **Frontend Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4
- **Maps**: Mapbox GL JS (`mapbox-gl`)
- **Location Search**: Mapbox Geocoding API (with built-in Pune landmarks offline fallback)
- **Road Routing**: Mapbox Directions API (with spatial road circuity fallback)
- **Icons**: Lucide React

---

## 4. Configurable Fare Assumptions (`src/config/fares.ts`)

All tariff formulas are kept in a single transparent configuration file:

1. **Auto Rickshaw (Pune RTO Regulated Meter Rates)**:
   - Base fare: ₹25 for the first 1.5 km.
   - Subsequent rate: ₹17.00 per km.
2. **Bike Taxi (Rapido Pune Estimates)**:
   - Base fare: ₹20 (covers first 1 km).
   - Rate: ₹9.00/km + ₹0.75/min buffer + ₹2 platform fee.
3. **Cab / Car (Uber Go / Ola Mini Estimates)**:
   - Base fare: ₹60.
   - Rate: ₹15.50/km + ₹1.50/min traffic buffer + ₹15 booking fee.
4. **Pune Metro (Official Maha Metro Distance Slabs)**:
   - 1–3 stations: ₹10
   - 4–6 stations: ₹15
   - 7–10 stations: ₹20
   - 11–14 stations: ₹25
   - 15–18 stations: ₹30
   - > 18 stations: ₹35
5. **Walking**:
   - 100% Free (₹0) and 0g carbon footprint for distances under 4 km.

---

## 5. API Setup (Optional)

IndiaRide requires **only 1 external API provider**: **Mapbox**.

### How to add your Mapbox Token:
1. Create a free account at [account.mapbox.com](https://account.mapbox.com) (100,000 free requests/month, no credit card required).
2. Copy your public token (`pk.eyJ...`).
3. Create a `.env` file in the root directory:
   ```env
   VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNs...
   ```
4. Start the application:
   ```bash
   npm run dev
   ```

> **Zero-Key Fallback**: If you run without a Mapbox token, IndiaRide automatically activates its **Pune Spatial Transit Canvas** with pre-indexed coordinates for top Pune hubs (Hinjewadi, Shivajinagar, Swargate, PCMC, Kothrud, Viman Nagar, etc.), making the app 100% interactive out of the box!

---

## 6. Development & Testing

```bash
# Install dependencies
npm install

# Run unit tests
node scripts/test-engine.mjs

# Build for production
npm run build

# Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
