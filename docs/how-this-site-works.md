# VMA Calculator: How This Site Works
### A Plain-Language Guide for Coaches, Athletes, and Non-Tech Teams
*(With Just Enough "Light Tech" to Understand the Magic)*

---

## 1. What Is This Website and Why Was It Built?

The **VMA Calculator** is a specialized web tool built for running coaches, physical education teachers, competitive athletes, and fitness enthusiasts.

Its core mission is simple: **eliminate the math headache and paperwork on the running track.**

In the past, a coach timing runners with a stopwatch had to:
1. Write down meters covered by each athlete on paper.
2. Track who stopped to tie a shoelace or walked through a cramp.
3. Later spend an evening doing tedious arithmetic to convert meters to kilometers, seconds to hours, and adjust for pause times.
4. Look up fitness level tables in a binder.

**This application automates that entire process in real time.** You enter the test numbers, and within milliseconds, the site calculates the runner's true aerobic speed, assigns a standardized fitness tier, displays every intermediate math step transparently, and lets coaches track individual and team improvements across entire seasons.

---

## 2. The Sports Science: What Is VMA and Why Does It Matter?

### What Does "VMA" Mean?
**VMA** is short for ***Vitesse Maximale Aérobie*** (French for **Maximum Aerobic Speed**).

### The "Car Engine" Analogy
Imagine your body is a hybrid car engine:
* **Aerobic Cruising (Walking / Light Jogging):** Your engine runs on clean oxygen. You can maintain this pace comfortably for hours while chatting with a friend.
* **The Maximum Cruising Limit (Your VMA):** As you run faster, your heart and lungs work harder to pump oxygen to your muscles. Eventually, you hit the maximum speed at which your lungs can supply 100% of the oxygen your muscles demand. **That exact running speed is your VMA.**
* **The Redline / Turbo Zone:** If you try to sprint faster than your VMA, your engine runs out of oxygen. Your body switches to emergency anaerobic burning, generating heavy lactic acid, rubbery legs, and total exhaustion within 1 to 2 minutes.

### Why Coaches Care: Setting Training Paces Scientifically
Once an athlete knows their VMA (for example, **14.0 km/h**), their coach can calibrate every single workout scientifically instead of guessing:
* **Warm-up & Recovery (60% VMA):** 8.4 km/h
* **Endurance Base (70–75% VMA):** 9.8 – 10.5 km/h
* **Threshold / Tempo (85% VMA):** 11.9 km/h
* **High-Intensity Interval Training (100–110% VMA):** 14.0 – 15.4 km/h

---

## 3. The Two Supported Tests

The site supports the two gold-standard field tests used in schools, athletics clubs, and military assessments worldwide:

| Feature | The Cooper Test | The Demi-Cooper Test |
| :--- | :--- | :--- |
| **Duration** | **12 minutes** (720 seconds) | **6 minutes** (360 seconds) |
| **Origin** | Created in 1968 by Dr. Kenneth Cooper for the US Air Force | Developed as a shorter, highly practical modern alternative |
| **Goal** | Cover maximum possible distance in 12 minutes | Cover maximum possible distance in 6 minutes |
| **Best For** | Seasoned runners and endurance athletes | Beginners, school classes, and frequent progress check-ins |
| **Physiology** | Tests pacing endurance and aerobic stamina | Runners hit their maximum oxygen uptake ($\text{VO}_2\text{max}$) right around minute 6 |
| **Fatigue & Recovery** | High physical toll; requires several days of recovery | Moderate toll; can easily be repeated every month |

---

## 4. The 5 Fitness Tiers (Color-Coded Classification)

Once VMA is computed in km/h, the application automatically assigns the runner a visual tier:

| Tier | VMA Range | Rating | What It Means in Plain English |
| :--- | :--- | :--- | :--- |
| **Level 1** | **< 10.0 km/h** | Beginner | Starting their running journey; building foundational cardiovascular health. |
| **Level 2** | **10.0 – 12.0 km/h** | Intermediate | Active recreational runner; solid aerobic base for casual 5K/10K runs. |
| **Level 3** | **12.0 – 14.0 km/h** | Good | Regular club runner; strong cardiovascular conditioning and stamina. |
| **Level 4** | **14.0 – 16.0 km/h** | Very Good | Competitive endurance athlete; high aerobic power and sustained speed. |
| **Level 5** | **> 16.0 km/h** | Excellent | Elite / advanced distance runner; exceptional aerobic efficiency. |

---

## 5. The Math Demystified: The 4-Step Process

### Why Simple Math Fails in Real Life
If an athlete ran 2,400 meters in 12 minutes, you might simply divide:
$$\text{Speed} = \frac{2,400\text{ meters}}{12\text{ minutes}} = 12.0\text{ km/h}$$

**However**, what if the runner stopped for 30 seconds to tie a shoelace and walked for 30 seconds? Their *actual running velocity* while running was much faster! A simple stopwatch without pause adjustments distorts their true aerobic capacity.

### How the Site Calculates True Aerobic Velocity:
1. **Determine Total Time in Seconds:**
   * Cooper Test: 720 seconds (12 minutes)
   * Demi-Cooper Test: 360 seconds (6 minutes)
2. **Calculate Effective Running Time:**
   $$\text{Effective Time (seconds)} = \text{Total Test Time} - \text{Stop Time} - \text{Walking Time}$$
3. **Convert to Standard Units:**
   $$\text{Effective Time in Hours} = \frac{\text{Effective Time (seconds)}}{3600}$$
   $$\text{Distance in Kilometers} = \frac{\text{Distance in Meters}}{1000}$$
4. **Compute VMA in km/h:**
   $$\text{VMA (km/h)} = \frac{\text{Distance in Kilometers}}{\text{Effective Time in Hours}}$$
   *(Result is rounded cleanly to two decimal places, e.g. 13.09 km/h)*

---

## 6. Real-World Math in Action: Meet Sarah

* **Athlete:** Sarah
* **Test:** Cooper Test (12 minutes = 720 seconds)
* **Distance covered:** 2,400 meters
* **Stops / Walking:** 30 seconds paused for shoelace + 30 seconds walking through a stitch
* **Step 1:** $\text{Effective Time} = 720 - 30 - 30 = \mathbf{660\text{ seconds}}$ (11 minutes of pure running)
* **Step 2:** $\text{Effective Time in Hours} = 660 / 3600 = \mathbf{0.1833\text{ hours}}$
* **Step 3:** $\text{Distance in km} = 2400 / 1000 = \mathbf{2.4\text{ km}}$
* **Step 4:** $\text{Sarah's True VMA} = 2.4 / 0.1833 = \mathbf{13.09\text{ km/h}}$
* **Classification:** **Level 3 — Good** (Solid club runner)

---

## 7. The User Journey: How Someone Uses the Site

The site is built for maximum speed and simplicity on any phone, tablet, or desktop:

```
[1. Choose Test] ──▶ [2. Input Stats] ──▶ [3. Live Preview] ──▶ [4. Result Card] ──▶ [5. Save & Export]
   (12m or 6m)        (Meters/Pauses)     (Instant Calc)        (VMA & Level)        (PDFs & Charts)
```

### Guest Mode vs. Member Mode
* **Guest Mode (Zero Friction):** Anyone can visit the site and calculate their score immediately. No account, no credit card, no sign-up wall. Great for spontaneous testing at the track.
* **Member Mode (For Coaches & Regular Athletes):** Signing in permanently saves every test to the database. Unlocks the interactive visual dashboard, search and filtering by level, athlete progression line charts, and bulk PDF/CSV export.

### Smart Built-in Features
* **⚡ Live VMA Preview:** As you type numbers into the form, the site calculates your VMA in real time before you even click the submit button!
* **🛡️ Form Guardrails:** Automatically blocks impossible inputs (e.g. entering 400 seconds of rest on a 360-second test, negative numbers, or invalid ages).
* **📊 Visual Analytics:** Interactive bar and line charts show team level distributions and track individual progress across multiple tests over time.
* **📄 PDF & CSV Exports:** Generate official printable test certificates for runners or download full spreadsheet rosters for Excel.
* **🌙 Dark Mode:** Includes a full light/dark mode toggle (sun/moon icon in the header) that saves your preference automatically.

---

## 8. Under the Hood: Light Technical Explanation

To understand how the website works behind the scenes, think of a **busy, high-end restaurant**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE RESTAURANT ANALOGY                            │
├───────────────────────┬──────────────────────────┬──────────────────────────┤
│      FRONT-END        │         BACK-END         │         DATABASE         │
│   (The Dining Room)   │       (The Kitchen)      │    (Pantry & Cabinet)    │
│                       │                          │                          │
│ • Menus & decor       │ • Master chef & cooks    │ • Secure ingredient room │
│ • Customer seats      │ • Checks the recipe      │ • Permanent receipts log │
│ • Waiter takes order  │ • Prepares the dish      │ • Never forgets a record │
│ • Built with: React   │ • Built with: Node.js    │ • Built with: PostgreSQL │
└───────────────────────┴──────────────────────────┴──────────────────────────┘
  ⇄ The Waiter & Order Tickets: The API carries digital messages (JSON) back & forth.
```

### The 5-Step Journey of a Click (What Happens in 50 Milliseconds)
1. **Input:** Coach enters Sarah's distance (2,400m) and pause times (30s stop, 30s walk).
2. **Front-End Check:** React verifies numbers are positive and stop time does not exceed test duration.
3. **API Dispatch:** The browser packages the numbers into a tiny digital slip (called **JSON**, e.g., `{"distanceMeters": 2400, "age": 28}`) and sends it via HTTP to the server.
4. **Server Calculation:** Node.js calculates effective hours, divides distance, and determines Level 3.
5. **Database & UI:** If signed in, PostgreSQL writes a permanent record; the server sends JSON back; React renders the result card on screen instantly!

---

## 9. Security & Accounts: How Your Data Stays Protected

* **Password Hashing (The "Meat Grinder"):** The database **never** stores your actual password! Instead, it passes your password through a one-way cryptographic algorithm called **bcrypt**. It is like grinding steak into hamburger: you can make the burger, but nobody can turn it back into steak. Even the site creator cannot see your password.
* **Digital VIP Wristbands (JWT Tokens):** When you log in, the server gives your browser an encrypted token called a **JWT** (JSON Web Token). Like a VIP wristband at a music festival, your browser flashes the token with every request for 7 days so you stay logged in without typing your password each time.
* **Strict Coach Data Isolation:** Every coach's data is strictly partitioned. Coach John can only see Coach John's athletes; Coach Sarah cannot see Coach John's data.

---

## 10. How the Site Reaches Your Phone (Networking Made Simple)

How can an athlete on a sports track open this application on their iPhone or Android when the code is running on a server computer miles away?

1. **The Smart Receptionist (Reverse Proxy):**
   A tiny traffic director program (`proxy.js`) listens on port 8080. When visitors arrive:
   * *"Looking for the web page, buttons, or design?"* $\to$ Handled by the fast static front-end.
   * *"Looking to calculate VMA or save a test (`/api`)?"* $\to$ Forwarded directly to the Node.js API.
2. **The Secure Highway (Cloudflare Tunnel):**
   In the old days, hosting a website required opening dangerous firewall ports on your internet router. This project uses **Cloudflare Tunnels**:
   * The server establishes a private, encrypted outbound tunnel to Cloudflare's global network.
   * Cloudflare gives the app a secure public address (like `https://your-tunnel.trycloudflare.com`).
   * Anyone in the world can open that link with full bank-grade HTTPS encryption, while the local computer stays 100% shielded behind its firewall.

---

## 11. Quick Reference & Plain-Language Glossary

| Term | What It Means in One Simple Sentence |
| :--- | :--- |
| **VMA** | The maximum running speed where your body can still supply 100% of needed oxygen to muscles. |
| **Effective Time** | The true time spent running, calculated by subtracting pauses and walking breaks from test time. |
| **Front-End (React)** | The interactive visual screen you tap on your phone or computer browser. |
| **Back-End (Node.js)** | The server "kitchen" that validates inputs, applies scientific math, and enforces rules. |
| **Database (PostgreSQL)** | The permanent digital filing cabinet storing user accounts, athlete profiles, and test histories. |
| **API** | The communication channel carrying questions and answers between the front-end and back-end. |
| **JWT Token** | A digital VIP wristband that keeps you securely logged into the site for 7 days. |
| **Password Hashing** | Scrambling passwords through a one-way mathematical grinder so they can never be stolen in plain text. |
| **Reverse Proxy** | A smart receptionist directing incoming web visitors to either the visual site or the calculation API. |
| **Cloudflare Tunnel** | A secure encrypted internet bridge exposing the website worldwide without opening router holes. |

---

*VMA Calculator Application Guide • Prepared for Coaches, Athletes, and Non-Technical Stakeholders • 2026*
