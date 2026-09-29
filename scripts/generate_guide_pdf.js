const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VMA Calculator: How This Site Works</title>
  <style>
    @page {
      size: A4;
      margin: 13mm 13mm 15mm 13mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      line-height: 1.46;
      font-size: 12.6px;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    .doc-page {
      page-break-after: always;
      box-sizing: border-box;
    }

    .doc-page:last-child {
      page-break-after: avoid;
    }

    /* Typography */
    h1, h2, h3, h4 {
      color: #0f172a;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    h1 {
      font-size: 22px;
      line-height: 1.2;
      margin: 0 0 5px 0;
    }

    h2 {
      font-size: 15px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 13px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 7px;
      color: #1e40af;
    }

    .doc-page > h2:first-child {
      margin-top: 0;
    }

    h3 {
      font-size: 13px;
      margin-top: 10px;
      margin-bottom: 5px;
      color: #334155;
    }

    p {
      margin: 0 0 7px 0;
    }

    strong {
      color: #0f172a;
    }

    /* Header Banner */
    .hero-banner {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%);
      color: white;
      border-radius: 11px;
      padding: 17px 19px;
      margin-bottom: 11px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }

    .hero-banner h1 {
      color: white;
      font-size: 21px;
      margin-bottom: 5px;
    }

    .hero-subtitle {
      font-size: 12.5px;
      opacity: 0.94;
      margin-bottom: 10px;
      font-weight: 400;
      line-height: 1.35;
    }

    .badge-bar {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
    }

    .hero-badge {
      background: rgba(255, 255, 255, 0.22);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 20px;
      padding: 2px 9px;
      font-size: 9.8px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    /* Cards */
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }

    .card-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }

    .card-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }

    /* Callout Boxes */
    .callout {
      border-radius: 8px;
      padding: 9px 12px;
      margin: 8px 0;
      font-size: 12px;
    }

    .callout-intuition {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      color: #1e40af;
    }

    .callout-tech {
      background-color: #faf5ff;
      border-left: 4px solid #8b5cf6;
      color: #5b21b6;
    }

    .callout-coach {
      background-color: #ecfdf5;
      border-left: 4px solid #10b981;
      color: #065f46;
    }

    .callout-title {
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 7px 0 9px 0;
      font-size: 11.6px;
    }

    th, td {
      padding: 5.5px 8px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 700;
      font-size: 10.8px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 9999px;
      font-size: 9.8px;
      font-weight: 700;
      text-align: center;
      white-space: nowrap;
    }

    .badge-l1 { background-color: #fee2e2; color: #991b1b; }
    .badge-l2 { background-color: #fef3c7; color: #92400e; }
    .badge-l3 { background-color: #dbeafe; color: #1e40af; }
    .badge-l4 { background-color: #ede9fe; color: #5b21b6; }
    .badge-l5 { background-color: #d1fae5; color: #065f46; }

    /* Visual Diagrams */
    .diagram-container {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 9px;
      padding: 10px;
      margin: 8px 0;
    }

    .restaurant-grid {
      display: grid;
      grid-template-columns: 1.05fr 1fr 1fr;
      gap: 8px;
      text-align: center;
    }

    .layer-box {
      border-radius: 7px;
      padding: 9px 7px;
      border: 1.5px solid #cbd5e1;
    }

    .layer-frontend {
      background-color: #eff6ff;
      border-color: #93c5fd;
    }

    .layer-backend {
      background-color: #faf5ff;
      border-color: #c4b5fd;
    }

    .layer-db {
      background-color: #ecfdf5;
      border-color: #6ee7b7;
    }

    .layer-title {
      font-weight: 700;
      font-size: 11.8px;
      margin-bottom: 1px;
    }

    .layer-sub {
      font-size: 9.8px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 3px;
    }

    .layer-desc {
      font-size: 10.5px;
      color: #334155;
      line-height: 1.3;
      text-align: left;
    }

    .step-flow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 7px 0;
      gap: 4px;
    }

    .step-node {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      padding: 6px 4px;
      text-align: center;
    }

    .step-num {
      width: 18px;
      height: 18px;
      background: #2563eb;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9.8px;
      font-weight: bold;
      margin: 0 auto 2px auto;
    }

    .step-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1px;
    }

    .step-sub {
      font-size: 9px;
      color: #64748b;
    }

    .step-arrow {
      color: #94a3b8;
      font-size: 11.5px;
      font-weight: bold;
    }

    /* Math Box */
    .math-card {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 9px 11px;
      margin: 7px 0;
    }

    .formula-line {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 600;
      color: #166534;
      background: #dcfce7;
      padding: 3px 8px;
      border-radius: 5px;
      display: inline-block;
      margin: 2px 0 4px 0;
    }

    .numbered-pipeline {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 8px 0;
    }

    .pipeline-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 11.5px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
    }

    .pipeline-badge {
      background: #2563eb;
      color: white;
      font-size: 10px;
      font-weight: bold;
      border-radius: 4px;
      padding: 1px 6px;
      white-space: nowrap;
      margin-top: 1px;
    }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="doc-page">
    <!-- HERO BANNER -->
    <div class="hero-banner">
      <div class="badge-bar" style="margin-bottom: 8px;">
        <span class="hero-badge">Plain-Language Guide</span>
        <span class="hero-badge">Sports Science + Web Tech</span>
        <span class="hero-badge">Executive Overview</span>
      </div>
      <h1>VMA Calculator: How This Site Works</h1>
      <div class="hero-subtitle">
        A clear, non-technical walkthrough explaining how this web application measures aerobic running fitness, performs precision math, and safely organizes athlete records.
      </div>
      <div style="font-size: 10.5px; opacity: 0.9; display: flex; gap: 14px;">
        <span>📅 Date: March 2026</span>
        <span>🏃 Tests: Cooper (12m) & Demi-Cooper (6m)</span>
        <span>💻 Tech Stack: React 18, Node.js, PostgreSQL</span>
      </div>
    </div>

    <!-- SECTION 1 -->
    <h2>1. What Is This Website and Why Was It Built?</h2>
    <p>
      The <strong>VMA Calculator</strong> is a specialized web tool built for running coaches, physical education teachers, competitive athletes, and fitness enthusiasts.
    </p>
    <p>
      Its mission is simple: <strong>eliminate the math headache and paperwork on the running track.</strong> In the past, a coach timing runners with a stopwatch had to write meters on paper, note who stopped to tie a shoelace, and later spend an evening doing tedious arithmetic to convert meters, seconds, and pause times into usable fitness numbers.
    </p>
    <p>
      <strong>This application automates that entire process in real time.</strong> You enter the test numbers, and within a fraction of a second, the site calculates the runner's aerobic speed, assigns a standardized fitness tier, displays every intermediate math step, and lets coaches track improvement across entire seasons.
    </p>

    <div class="card-grid-3">
      <div class="card" style="border-top: 3px solid #3b82f6;">
        <div style="font-size: 17px; margin-bottom: 2px;">⏱️</div>
        <div style="font-weight: 700; font-size: 12px; color: #1e40af;">Instant Calculations</div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px;">
          Calculates accurate aerobic speed in milliseconds with real-time live preview as you type.
        </div>
      </div>
      <div class="card" style="border-top: 3px solid #10b981;">
        <div style="font-size: 17px; margin-bottom: 2px;">📈</div>
        <div style="font-weight: 700; font-size: 12px; color: #065f46;">Long-Term History</div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px;">
          Securely tracks individual runners and whole rosters over time with charts and progression trends.
        </div>
      </div>
      <div class="card" style="border-top: 3px solid #8b5cf6;">
        <div style="font-size: 17px; margin-bottom: 2px;">📄</div>
        <div style="font-weight: 700; font-size: 12px; color: #5b21b6;">Professional Reports</div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px;">
          Generates branded single-athlete PDF certificates and bulk CSV exports for Excel.
        </div>
      </div>
    </div>

    <!-- SECTION 2 -->
    <h2>2. The Sports Science: What Is VMA and Why Does It Matter?</h2>
    <p>
      You don't need a sports physiology degree to understand what this site calculates. It all centers around one metric: <strong>VMA</strong> (<em>Vitesse Maximale Aérobie</em>, or <strong>Maximum Aerobic Speed</strong> in English).
    </p>

    <div class="callout callout-intuition">
      <div class="callout-title">💡 The "Car Engine" Analogy</div>
      Imagine your body is a hybrid car engine:
      <ul style="margin: 3px 0 0 0; padding-left: 15px; font-size: 11.8px;">
        <li><strong>Aerobic Cruising (Walking / Light Jogging):</strong> Your engine runs on clean oxygen. You can maintain this pace comfortably for hours while chatting.</li>
        <li><strong>The Maximum Cruising Limit (Your VMA):</strong> As you run faster, your heart and lungs work harder to pump oxygen to your muscles. Eventually, you hit the maximum speed at which your lungs can supply 100% of the oxygen your muscles demand. <strong>That exact running speed is your VMA.</strong></li>
        <li><strong>The Redline / Turbo Zone:</strong> If you try to sprint faster than your VMA, your engine runs out of oxygen. Your body switches to emergency anaerobic burning, generating heavy lactic acid, rubbery legs, and total exhaustion within 1 to 2 minutes.</li>
      </ul>
    </div>

    <div class="callout callout-coach">
      <div class="callout-title">🏃 Why Coaches Care: Setting Training Paces Scientifically</div>
      Knowing an athlete's VMA (for example, <strong>14.0 km/h</strong>) allows a coach to calibrate every workout:
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 3px; font-size: 11.2px;">
        <div>• <strong>Warm-up & Recovery (60% VMA):</strong> 8.4 km/h</div>
        <div>• <strong>Endurance Base (70–75% VMA):</strong> 9.8 – 10.5 km/h</div>
        <div>• <strong>Threshold / Tempo (85% VMA):</strong> 11.9 km/h</div>
        <div>• <strong>Interval Speedwork (100–110% VMA):</strong> 14.0 – 15.4 km/h</div>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="doc-page">
    <h2>3. The Two Supported Tests</h2>
    <p>
      The site supports the two gold-standard field tests used in schools, athletics clubs, and military assessments:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 22%;">Feature</th>
          <th style="width: 39%;">The Cooper Test</th>
          <th style="width: 39%;">The Demi-Cooper Test</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Duration</strong></td>
          <td><strong>12 minutes</strong> (720 seconds)</td>
          <td><strong>6 minutes</strong> (360 seconds)</td>
        </tr>
        <tr>
          <td><strong>Origin</strong></td>
          <td>Created in 1968 by Dr. Kenneth Cooper for the US Air Force</td>
          <td>Shorter, highly practical modern alternative</td>
        </tr>
        <tr>
          <td><strong>Goal</strong></td>
          <td>Cover maximum possible distance in 12 minutes</td>
          <td>Cover maximum possible distance in 6 minutes</td>
        </tr>
        <tr>
          <td><strong>Best For</strong></td>
          <td>Seasoned runners and endurance athletes</td>
          <td>Beginners, school classes, and frequent progress check-ins</td>
        </tr>
        <tr>
          <td><strong>Physiology</strong></td>
          <td>Tests pacing endurance and aerobic stamina</td>
          <td>Runners hit their maximum oxygen uptake (VO₂max) right at minute 6</td>
        </tr>
        <tr>
          <td><strong>Fatigue & Recovery</strong></td>
          <td>High physical toll; requires several days of recovery</td>
          <td>Moderate toll; can easily be repeated every month</td>
        </tr>
      </tbody>
    </table>

    <h2>4. The 5 Fitness Tiers (Color-Coded Classification)</h2>
    <p>
      Once VMA is computed in km/h, the application automatically assigns the runner a visual tier:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 14%;">Tier</th>
          <th style="width: 18%;">VMA Range</th>
          <th style="width: 20%;">Rating</th>
          <th style="width: 48%;">What It Means in Plain English</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-l1">Level 1</span></td>
          <td><strong>&lt; 10.0 km/h</strong></td>
          <td>Beginner</td>
          <td>Starting their running journey; building foundational cardiovascular health.</td>
        </tr>
        <tr>
          <td><span class="badge badge-l2">Level 2</span></td>
          <td><strong>10.0 – 12.0 km/h</strong></td>
          <td>Intermediate</td>
          <td>Active recreational runner; solid aerobic base for casual 5K/10K runs.</td>
        </tr>
        <tr>
          <td><span class="badge badge-l3">Level 3</span></td>
          <td><strong>12.0 – 14.0 km/h</strong></td>
          <td>Good</td>
          <td>Regular club runner; strong cardiovascular conditioning and stamina.</td>
        </tr>
        <tr>
          <td><span class="badge badge-l4">Level 4</span></td>
          <td><strong>14.0 – 16.0 km/h</strong></td>
          <td>Very Good</td>
          <td>Competitive endurance athlete; high aerobic power and sustained speed.</td>
        </tr>
        <tr>
          <td><span class="badge badge-l5">Level 5</span></td>
          <td><strong>&gt; 16.0 km/h</strong></td>
          <td>Excellent</td>
          <td>Elite / advanced distance runner; exceptional aerobic efficiency.</td>
        </tr>
      </tbody>
    </table>

    <h2>5. The Math Demystified: The 4-Step Process</h2>
    <p>
      Why can't you just divide total meters by total minutes on a phone? Because <strong>in the real world, runners take breathers, pause to tie a shoe, or walk through a stitch</strong>.
    </p>

    <div class="math-card">
      <div style="font-weight: 700; color: #166534; font-size: 12.5px; margin-bottom: 3px;">
        How the Site Calculates True Aerobic Velocity:
      </div>
      <div style="font-size: 11.5px; color: #1e293b;">
        <div><strong>Step 1: Determine Total Time in Seconds</strong> (Cooper = 720 s, Demi-Cooper = 360 s).</div>
        <div style="margin-top: 3px;"><strong>Step 2: Calculate Effective Running Time</strong> by subtracting pauses:</div>
        <div class="formula-line">Effective Time (seconds) = Total Test Time − Stop Time − Walking Time</div>
        <div><strong>Step 3: Convert to Standard Units</strong> (Hours = seconds ÷ 3,600 &nbsp;|&nbsp; Kilometers = meters ÷ 1,000).</div>
        <div style="margin-top: 3px;"><strong>Step 4: Compute VMA in km/h:</strong></div>
        <div class="formula-line">VMA (km/h) = Distance in Kilometers ÷ Effective Time in Hours</div>
        <div style="font-size: 10.5px; color: #166534;">(Result is rounded cleanly to two decimal places, e.g. 13.09 km/h)</div>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 3 ==================== -->
  <div class="doc-page">
    <h2>6. Real-World Math in Action: Meet Sarah</h2>
    <p>
      To see how these numbers come together, let's walk through a concrete example:
    </p>

    <div class="callout callout-coach">
      <div class="callout-title">🏃 Case Study: Sarah's Cooper Test</div>
      Sarah runs the 12-minute Cooper Test. She covers <strong>2,400 meters</strong>, but had to pause for <strong>30 seconds</strong> to tie her shoelace and walked for <strong>30 seconds</strong> when she felt a stitch.
      <ul style="margin: 4px 0 0 0; padding-left: 17px; font-size: 11.2px; line-height: 1.42;">
        <li><strong>Total Test Duration:</strong> 720 seconds (12 minutes)</li>
        <li><strong>Effective Running Time:</strong> 720 − 30 − 30 = <strong>660 seconds</strong> (11 minutes of pure running)</li>
        <li><strong>Effective Time in Hours:</strong> 660 ÷ 3,600 = <strong>0.1833 hours</strong></li>
        <li><strong>Distance in Kilometers:</strong> 2,400 meters ÷ 1,000 = <strong>2.4 km</strong></li>
        <li><strong>Sarah's True VMA:</strong> 2.4 ÷ 0.1833 = <strong style="color: #047857; font-size: 12px;">13.09 km/h</strong></li>
        <li><strong>Assigned Tier:</strong> <span class="badge badge-l3">Level 3 — Good</span> (Solid club runner)</li>
      </ul>
    </div>

    <h2>7. The User Journey: How Someone Uses the Site</h2>
    <p>
      The website is designed for maximum speed and simplicity on any mobile or desktop screen:
    </p>

    <div class="step-flow">
      <div class="step-node">
        <div class="step-num">1</div>
        <div class="step-title">Choose Test</div>
        <div class="step-sub">12m or 6m</div>
      </div>
      <div class="step-arrow">→</div>
      <div class="step-node">
        <div class="step-num">2</div>
        <div class="step-title">Input Stats</div>
        <div class="step-sub">Meters & pauses</div>
      </div>
      <div class="step-arrow">→</div>
      <div class="step-node">
        <div class="step-num">3</div>
        <div class="step-title">Live Preview</div>
        <div class="step-sub">Instant calculation</div>
      </div>
      <div class="step-arrow">→</div>
      <div class="step-node">
        <div class="step-num">4</div>
        <div class="step-title">Result Card</div>
        <div class="step-sub">VMA & Level Badge</div>
      </div>
      <div class="step-arrow">→</div>
      <div class="step-node">
        <div class="step-num">5</div>
        <div class="step-title">Save & Export</div>
        <div class="step-sub">Charts, PDF, CSV</div>
      </div>
    </div>

    <div class="card-grid-2">
      <div class="card">
        <div style="font-weight: 700; color: #1e40af; margin-bottom: 2px;">👤 Guest Mode (Zero Friction)</div>
        <div style="font-size: 11px; color: #475569;">
          Anyone can visit the website on a smartphone or tablet and compute a score immediately. No account, no credit card, no sign-up wall. Great for spontaneous testing at the track.
        </div>
      </div>
      <div class="card">
        <div style="font-weight: 700; color: #065f46; margin-bottom: 2px;">🔐 Member Mode (For Coaches)</div>
        <div style="font-size: 11px; color: #475569;">
          Signing in stores results permanently in the database. Unlocks the interactive visual dashboard, search & filtering by level, individual progression line charts, and bulk PDF/CSV export.
        </div>
      </div>
    </div>

    <h3>Smart Built-in Features & Reporting Suite</h3>
    <div class="card-grid-3">
      <div class="card" style="border-left: 3px solid #3b82f6;">
        <div style="font-weight: 700; color: #1e40af; font-size: 11.2px;">⚡ Live VMA Preview</div>
        <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
          As you type meters and seconds, the site calculates the VMA instantly on screen before you even click submit!
        </div>
      </div>
      <div class="card" style="border-left: 3px solid #10b981;">
        <div style="font-weight: 700; color: #065f46; font-size: 11.2px;">📊 Visual Analytics</div>
        <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
          Interactive bar and line charts show team level distributions and track individual athlete progress across tests.
        </div>
      </div>
      <div class="card" style="border-left: 3px solid #8b5cf6;">
        <div style="font-weight: 700; color: #5b21b6; font-size: 11.2px;">📄 PDF & CSV Exports</div>
        <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
          Generate official printable test certificates for runners or download full spreadsheet rosters for Excel.
        </div>
      </div>
    </div>

    <div class="callout callout-intuition" style="margin-top: 4px;">
      <div class="callout-title">🌙 Dark Mode Included</div>
      The site features a full dark-mode toggle (sun/moon icon in the header) that saves your preference automatically, perfect for evening track sessions or indoor analysis.
    </div>
  </div>

  <!-- ==================== PAGE 4 ==================== -->
  <div class="doc-page">
    <h2>8. Under the Hood: Light Technical Explanation</h2>
    <p>
      How does the website work from a software perspective? You can think of the entire system as a <strong>busy, high-end restaurant</strong>:
    </p>

    <div class="diagram-container">
      <div class="restaurant-grid">
        <!-- FRONTEND -->
        <div class="layer-box layer-frontend">
          <div style="font-size: 19px; margin-bottom: 1px;">🍽️</div>
          <div class="layer-title" style="color: #1e40af;">The Front-End</div>
          <div class="layer-sub">"The Dining Room" (React)</div>
          <div class="layer-desc">
            Everything the visitor sees on screen: buttons, input forms, color-coded badges, dark-mode toggle, and interactive charts. Runs right inside your browser.
          </div>
        </div>

        <!-- BACKEND -->
        <div class="layer-box layer-backend">
          <div style="font-size: 19px; margin-bottom: 1px;">👨‍🍳</div>
          <div class="layer-title" style="color: #6b21a8;">The Back-End</div>
          <div class="layer-sub">"The Kitchen" (Node.js)</div>
          <div class="layer-desc">
            The server's brain. Receives orders from the front-end, verifies permissions, performs the scientific formulas, and cooks up the response.
          </div>
        </div>

        <!-- DATABASE -->
        <div class="layer-box layer-db">
          <div style="font-size: 19px; margin-bottom: 1px;">🗄️</div>
          <div class="layer-title" style="color: #065f46;">The Database</div>
          <div class="layer-sub">"The Pantry" (PostgreSQL)</div>
          <div class="layer-desc">
            The fortified digital vault. Stores user accounts, scrambled passwords, and complete test histories so no record is lost when the browser closes.
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 6px; font-size: 10px; color: #64748b; font-weight: 600;">
        ⇄ The Waiter carrying orders: <strong>The API (Application Programming Interface)</strong> carries digital messages back and forth.
      </div>
    </div>

    <h3>The 5-Step Journey of a Click (What Happens in 50 Milliseconds)</h3>
    <div class="numbered-pipeline">
      <div class="pipeline-item">
        <span class="pipeline-badge">Step 1</span>
        <div><strong>Input:</strong> Coach fills in Sarah's distance (2,400m) and pause seconds (30s stop, 30s walk).</div>
      </div>
      <div class="pipeline-item">
        <span class="pipeline-badge">Step 2</span>
        <div><strong>Front-End Check:</strong> React checks that numbers are positive and stop time does not exceed 720 seconds.</div>
      </div>
      <div class="pipeline-item">
        <span class="pipeline-badge">Step 3</span>
        <div><strong>API Dispatch:</strong> Browser packages the data into a small JSON message and sends it via HTTP to the server.</div>
      </div>
      <div class="pipeline-item">
        <span class="pipeline-badge">Step 4</span>
        <div><strong>Server Calculation:</strong> Node.js calculates effective hours, divides distance, and determines Level 3.</div>
      </div>
      <div class="pipeline-item">
        <span class="pipeline-badge">Step 5</span>
        <div><strong>Database & UI:</strong> If signed in, PostgreSQL writes a permanent row; React renders the result card instantly!</div>
      </div>
    </div>

    <h2>9. Security & Accounts: How Your Data Stays Protected</h2>
    <div class="card-grid-2">
      <div class="card" style="border-left: 4px solid #ef4444;">
        <div style="font-weight: 700; color: #991b1b; font-size: 11.5px;">🔒 Password Hashing (The "Meat Grinder")</div>
        <p style="font-size: 10.8px; color: #475569; margin-top: 2px;">
          The database <strong>never</strong> stores your actual password text! Instead, it passes your password through a cryptographic algorithm called <strong>bcrypt</strong>. It's like grinding steak into hamburger: you can make the burger, but nobody can turn it back into steak! Even the site creator cannot read your password.
        </p>
      </div>
      <div class="card" style="border-left: 4px solid #3b82f6;">
        <div style="font-weight: 700; color: #1e40af; font-size: 11.5px;">🎫 Digital VIP Wristbands (JWT Tokens)</div>
        <p style="font-size: 10.8px; color: #475569; margin-top: 2px;">
          When you log in, the server gives your browser an encrypted pass called a <strong>JWT</strong> (JSON Web Token). Think of it as a VIP wristband at a festival: once checked at the main gate, you don't need to show ID every time you buy water. Your browser flashes the wristband for 7 days.
        </p>
      </div>
    </div>

    <div class="callout callout-intuition" style="margin-top: 2px;">
      <div class="callout-title">🛡️ Strict Coach Data Isolation</div>
      Every coach's data is strictly partitioned in the database. Coach John can only see Coach John's athletes; Coach Sarah cannot see Coach John's data. Athlete confidentiality is completely preserved.
    </div>
  </div>

  <!-- ==================== PAGE 5 ==================== -->
  <div class="doc-page">
    <h2>10. How the Site Reaches Your Phone (Networking Made Simple)</h2>
    <p>
      How can an athlete on a sports track open this application on their iPhone or Android when the code is running on a server computer miles away?
    </p>

    <div class="card" style="border-left: 4px solid #f59e0b; margin-bottom: 9px;">
      <div style="font-weight: 700; color: #b45309; font-size: 12px;">1. The Smart Receptionist (Reverse Proxy)</div>
      <div style="font-size: 11.2px; color: #475569; margin-top: 2px;">
        A tiny traffic director program (<code>proxy.js</code>) listens on port 8080. When incoming visitors arrive, the receptionist checks what they need:
        <ul style="margin: 2px 0 0 0; padding-left: 15px;">
          <li><em>"Looking for the web page, buttons, or design?"</em> → Handled by the fast static front-end.</li>
          <li><em>"Looking to calculate VMA or save a test?"</em> → Forwarded directly to the Node.js API.</li>
        </ul>
      </div>
    </div>

    <div class="card" style="border-left: 4px solid #2563eb; margin-bottom: 11px;">
      <div style="font-weight: 700; color: #1e40af; font-size: 12px;">2. The Secure Highway (Cloudflare Tunnel)</div>
      <div style="font-size: 11.2px; color: #475569; margin-top: 2px;">
        In the old days, putting a computer on the internet meant punching holes in your office router (port forwarding), which created serious security risks. This project uses <strong>Cloudflare Tunnels</strong>:
        <ul style="margin: 2px 0 0 0; padding-left: 15px;">
          <li>The server establishes a private, encrypted outbound tunnel to Cloudflare's global network.</li>
          <li>Cloudflare gives the app a secure public address (like <code>https://your-tunnel.trycloudflare.com</code>).</li>
          <li>Anyone in the world can open that link with full bank-grade HTTPS encryption, while the local computer stays 100% shielded behind its firewall!</li>
        </ul>
      </div>
    </div>

    <h2>11. Quick Reference & Plain-Language Glossary</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Term</th>
          <th style="width: 75%;">What It Means in One Simple Sentence</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>VMA</strong></td>
          <td>The maximum running speed where your body can still supply 100% of needed oxygen to muscles.</td>
        </tr>
        <tr>
          <td><strong>Effective Time</strong></td>
          <td>The true time spent running, calculated by subtracting pauses and walking breaks from test time.</td>
        </tr>
        <tr>
          <td><strong>Front-End (React)</strong></td>
          <td>The interactive visual screen you tap on your phone or computer browser.</td>
        </tr>
        <tr>
          <td><strong>Back-End (Node.js)</strong></td>
          <td>The server "kitchen" that validates inputs, applies scientific math, and enforces rules.</td>
        </tr>
        <tr>
          <td><strong>Database (PostgreSQL)</strong></td>
          <td>The permanent digital filing cabinet storing user accounts, athlete profiles, and test histories.</td>
        </tr>
        <tr>
          <td><strong>API</strong></td>
          <td>The communication channel carrying questions and answers between the front-end and back-end.</td>
        </tr>
        <tr>
          <td><strong>JWT Token</strong></td>
          <td>A digital VIP wristband that keeps you securely logged into the site for 7 days.</td>
        </tr>
        <tr>
          <td><strong>Password Hashing</strong></td>
          <td>Scrambling passwords through a one-way mathematical grinder so they can never be stolen in plain text.</td>
        </tr>
        <tr>
          <td><strong>Reverse Proxy</strong></td>
          <td>A smart receptionist directing incoming web visitors to either the visual site or the calculation API.</td>
        </tr>
        <tr>
          <td><strong>Cloudflare Tunnel</strong></td>
          <td>A secure encrypted internet bridge exposing the website worldwide without opening router holes.</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #cbd5e1; font-size: 10.5px; color: #94a3b8; text-align: center;">
      VMA Calculator Application Guide • Prepared for Coaches, Athletes, and Non-Technical Stakeholders • 2026
    </div>
  </div>

</body>
</html>
`;

async function buildPdf() {
  const outputPath = path.resolve(__dirname, '..', 'docs', 'how-this-site-works.pdf');
  console.log('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  console.log('Setting HTML content...');
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  console.log('Rendering PDF...');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; font-size: 8px; color: #94a3b8; font-family: sans-serif; padding: 0 13mm; display: flex; justify-content: space-between;">
        <span>VMA Calculator — Plain-Language Guide</span>
        <span>Cooper & Demi-Cooper Assessments</span>
      </div>
    `,
    footerTemplate: `
      <div style="width: 100%; font-size: 8px; color: #94a3b8; font-family: sans-serif; padding: 0 13mm; display: flex; justify-content: space-between;">
        <span>Confidential & Educational</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '13mm',
      bottom: '13mm',
      left: '11mm',
      right: '11mm',
    },
  });

  await browser.close();
  const stats = fs.statSync(outputPath);
  console.log('✅ PDF successfully generated at: ' + outputPath + ' (' + stats.size + ' bytes)');
}

buildPdf().catch((err) => {
  console.error('❌ Error generating PDF:', err);
  process.exit(1);
});
