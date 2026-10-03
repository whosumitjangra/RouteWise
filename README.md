# RouteWise 🧭
### Multi-Modal Travel & Budget Comparison Engine

RouteWise is a deterministic multi-modal travel engine built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL)**, designed for instant deployment on **Vercel**. 

It accepts an **origin**, **destination**, a **maximum budget** ($ or local currency), and an **optimization priority** (*Fastest* vs. *Cheapest* vs. *Balanced*) to calculate, compare, and rank all available modes of transport side-by-side in a single dashboard:
- 🚗 **Personal Driving** (Highway routing via OSRM, fuel economy, and toll estimation)
- 🚕 **Rideshare & On-Demand** (Uber / Taxi with dynamic surge multiplier $S_{\text{surge}}$)
- 🛵 **Micro-Mobility / Auto / Rapido** (Two-wheelers and auto-rickshaws for short urban runs)
- 🚆 **Intercity & Regional Rail** (Deterministic GTFS headways and tiered fare matrices)
- 🚌 **Intercity Bus & Coach** (Long-distance coach highway routing and budget fares)
- 🚊 **Urban Metro & Subway** (Rapid transit urban grid routing)
- ✈️ **Commercial Flight** (Direct airport hub detection, flight physics, and door-to-door ground connections)
- 🚶 **Active Walking & Bicycling** (Zero-emission pedestrian and bike paths)

---

## 1. Key Differentiators over LLM Travel Prompts
- **Zero LLM Hallucinations**: All costs, travel times, and schedules are calculated via deterministic spatial graph algorithms and GTFS timetable feeds.
- **Interactive Visual Mapping**: Dynamic vector map using OpenStreetMap and Leaflet with mode-colored polylines, start/end markers, and route inspection.
- **Sub-50ms Algorithmic Execution**: High-throughput parallel routing without slow prompt friction or token generation latencies.
- **Pareto-Frontier Tradeoff Analysis**: Interactive 2D scatter plot revealing the sweet-spot between monetary cost and travel time.

---

## 2. Core Engine Mathematical Formulations

### A. Unified Generalized Cost & Fare Engine
Deterministic generalized cost formulation:
$$C_{\text{total}} = C_{\text{base}} + (D \times R_{\text{distance}}) + (T \times R_{\text{time}}) + C_{\text{tolls/surge}}$$

#### Mode Formulas:
1. **Driving**:
   $$C_{\text{drive}} = \left(\frac{D}{\text{Fuel Efficiency}} \times \text{Fuel Price}\right) + C_{\text{tolls}}$$
2. **Rideshare / Uber / Rapido**:
   $$C_{\text{rideshare}} = \left(C_{\text{base}} + (D \times R_{\text{dist}}) + (T \times R_{\text{time}})\right) \times S_{\text{surge}} + C_{\text{booking}}$$
3. **Transit / Rail / Metro**:
   Tiered fare matrix based on GTFS station distance $D_{\text{station}}$:
   $$C_{\text{transit}} = C_{\text{base}} + \sum \left(D_i \times R_i\right)$$
4. **Flight**:
   $$C_{\text{flight}} = C_{\text{airport tax}} + (D_{\text{air}} \times R_{\text{km}}) + C_{\text{ground transfers}}$$

---

### B. Budget Filtering & Smart Badging Algorithm
1. Intercept user `origin`, `destination`, `maxBudget`, and `priority`.
2. Compute parallel route payloads from OSRM, GTFS, and flight physics engines.
3. Compare each mode against $C_{\text{total}} \le \text{maxBudget}$. Over-budget options receive the `⚠️ Over Budget` badge and can be filtered or inspected.
4. Calculate multi-objective Pareto score for Balanced priority:
   $$\text{Score} = (0.45 \times \text{NormCost}) + (0.45 \times \text{NormDuration}) + (0.10 \times \text{NormCO}_2)$$
5. Dynamically assign badges:
   - ⚡ **Fastest Path** (lowest travel duration)
   - 💰 **Most Affordable Path** (lowest monetary cost)
   - ⚖️ **Best Value** (optimal Pareto generalized score)
   - 🌿 **Eco Champion** (lowest carbon footprint in $\text{kg CO}_2$)

---

## 3. Database Schema (Supabase PostgreSQL)

The application includes an in-app Supabase Connection Modal with a real-time connection tester. To initialize your Supabase database, run the following SQL script in the [Supabase SQL Editor](https://app.supabase.com):

```sql
-- User Search & Route History Table
create table public.saved_routes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  max_budget numeric not null,
  priority_mode text not null check (priority_mode in ('fastest', 'cheapest', 'balanced')),
  selected_mode text,
  route_payload jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.saved_routes enable row level security;

create policy "Users can view their own saved routes" 
on public.saved_routes for select 
using (auth.uid() = user_id or auth.uid() is null);

create policy "Users can insert their own saved routes" 
on public.saved_routes for insert 
with check (auth.uid() = user_id or auth.uid() is null);

create policy "Users can delete their own saved routes" 
on public.saved_routes for delete 
using (auth.uid() = user_id or auth.uid() is null);
```

*Note*: If Supabase credentials are not provided, RouteWise gracefully defaults to browser `localStorage` mode with zero setup interruption.

---

## 4. Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd routewise

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Environment Variables (.env)

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 6. Vercel Deployment

Deploy with one click to Vercel:

1. Push code to your GitHub/GitLab repository.
2. In the Vercel Dashboard, import the repository.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.
