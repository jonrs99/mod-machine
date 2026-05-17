'use strict';
/**
 * Mod Machine — Email Server
 * server.js
 *
 * Serves the static site AND handles form submissions via Google Workspace SMTP.
 *
 * Setup:
 *   1. cp .env.example .env  and fill in your credentials
 *   2. npm install
 *   3. node server.js          (dev)
 *      pm2 start server.js     (production on a VPS)
 *
 * Endpoints:
 *   POST /api/build    — work order / build request
 *   POST /api/inquiry  — field report / general inquiry
 */

const express    = require('express');
const nodemailer = require('nodemailer');
const rateLimit  = require('express-rate-limit');
const helmet     = require('helmet');
const path       = require('path');
require('dotenv').config();

// Warn about missing env vars but don't crash — site still serves without email
const REQUIRED = ['SMTP_USER', 'SMTP_PASS'];
const missing  = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.warn('⚠ Missing env vars:', missing.join(', '));
  console.warn('  Email submissions will fail until these are set in Railway Variables.');
}

const PORT      = process.env.PORT      || 3000;
const SHOP_EMAIL = process.env.SHOP_EMAIL || 'builders@modmachine.shop';
const SITE_URL  = process.env.SITE_URL  || `http://localhost:${PORT}`;

// ── Mail transporter (Google Workspace SMTP) ──────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   'smtp.gmail.com',
  port:   465,
  secure: true,          // TLS
  auth: {
    user: process.env.SMTP_USER,   // builders@modmachine.shop
    pass: process.env.SMTP_PASS,   // Google App Password (16 chars, no spaces)
  },
});

transporter.verify().then(() => {
  console.log('✓ SMTP connection verified — email is live');
}).catch(err => {
  console.warn('⚠ SMTP connection failed:', err.message);
  console.warn('  Email sending will not work until SMTP_USER and SMTP_PASS are set.');
  console.warn('  The site will still serve normally.');
  // Do NOT exit — let the server keep running
});

// ── Express setup ─────────────────────────────────────────────────────────────
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", 'fonts.googleapis.com', "'unsafe-inline'"],
      fontSrc:    ["'self'", 'fonts.gstatic.com'],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'www.extremerate.com'],
    },
  },
}));

app.use(express.json({ limit: '64kb' }));

// Serve static files from the directory server.js lives in
const ROOT = path.resolve(__dirname);
console.log('Static root:', ROOT);
console.log('index.html exists:', require('fs').existsSync(path.join(ROOT, 'index.html')));

app.use(express.static(ROOT, {
  index: 'index.html',
  extensions: ['html'],
}));

// Rate limit: 10 form submissions per IP per 15 minutes
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many submissions — try again in a few minutes.' },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stamp() {
  return new Date().toLocaleString('en-US', {
    timeZone:     'America/New_York',
    dateStyle:    'long',
    timeStyle:    'short',
  }) + ' ET';
}

function emailWrapper(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<style>
  body { margin:0; padding:0; background:#0c0c14; font-family:'Segoe UI',Arial,sans-serif; }
  .wrap { max-width:600px; margin:32px auto; background:#1c1c28; border:2px solid #484860; }
  .hd { background:#0c0c14; padding:24px 28px; border-bottom:3px solid #f0c000; }
  .hd h1 { margin:0; font-size:22px; color:#f0c000; letter-spacing:2px; text-transform:uppercase; }
  .hd p  { margin:6px 0 0; font-size:11px; color:#7272a0; letter-spacing:1.5px; text-transform:uppercase; }
  .bd { padding:28px; }
  .row { display:flex; border-bottom:1px solid #363648; padding:10px 0; }
  .row:last-child { border-bottom:none; }
  .lbl { color:#7272a0; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; width:160px; flex-shrink:0; padding-top:2px; }
  .val { color:#e8e8f8; font-size:14px; }
  .msg { color:#e8e8f8; font-size:14px; line-height:1.7; white-space:pre-wrap; margin-top:8px; padding:16px; background:#14141e; border-left:3px solid #f0c000; }
  .ft  { padding:16px 28px; background:#14141e; border-top:1px solid #363648; font-size:11px; color:#7272a0; }
  .total { font-size:28px; font-weight:700; color:#f0c000; }
</style>
</head><body>
<div class="wrap">
  <div class="hd">
    <h1>MOD MACHINE</h1>
    <p>${esc(title)}</p>
  </div>
  <div class="bd">${bodyHtml}</div>
  <div class="ft">Received ${stamp()} · modmachine.shop</div>
</div>
</body></html>`;
}

function row(label, value) {
  return `<div class="row"><span class="lbl">${esc(label)}</span><span class="val">${esc(value)}</span></div>`;
}

// ── POST /api/build ───────────────────────────────────────────────────────────
app.post('/api/build', formLimiter, async (req, res) => {
  const {
    customerName, customerEmail,
    model, source, shell, buttons,
    screen, audio, power, wireless,
    total, eta,
  } = req.body;

  // Validate required fields
  if (!customerName || !customerEmail) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const bodyHtml = `
    ${row('Customer',  customerName)}
    ${row('Email',     customerEmail)}
    <div class="row"><span class="lbl">Est. Total</span>
      <span class="val total">$${esc(String(total))}</span></div>
    ${row('Est. ETA',  eta || '—')}
    <div style="margin:20px 0 8px;color:#7272a0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
      Build Spec
    </div>
    ${row('Chassis',   model)}
    ${row('Unit',      source)}
    ${row('Shell',     shell)}
    ${row('Buttons',   buttons)}
    ${row('Display',   screen)}
    ${row('Audio',     audio)}
    ${row('Power',     power)}
    ${row('Wireless',  wireless)}
  `;

  try {
    await transporter.sendMail({
      from:     `"Mod Machine" <${process.env.SMTP_USER}>`,
      to:       SHOP_EMAIL,
      replyTo:  `"${customerName}" <${customerEmail}>`,
      subject:  `Work Order · ${model} · $${total} · ${customerName}`,
      html:     emailWrapper('New Work Order Request', bodyHtml),
    });

    // Auto-reply to customer
    await transporter.sendMail({
      from:    `"Mod Machine" <${process.env.SMTP_USER}>`,
      to:      `"${customerName}" <${customerEmail}>`,
      subject: 'Mod Machine — We received your work order',
      html: emailWrapper('Work Order Received', `
        <div class="row"><span class="lbl">Hi</span><span class="val">${esc(customerName)}</span></div>
        <div class="row"><span class="lbl">Status</span><span class="val" style="color:#f0c000">Under review</span></div>
        <div class="row"><span class="lbl">Est. Total</span><span class="val total">$${esc(String(total))}</span></div>
        <p style="color:#b0b0d0;font-size:14px;margin-top:20px;line-height:1.7;">
          We have your work order and will follow up within 48 hours to confirm 
          availability, discuss your build, and arrange shipping or sourcing.
        </p>
        <p style="color:#7272a0;font-size:13px;margin-top:12px;">
          Reply to this email with any questions or to attach photos of your unit.
        </p>
      `),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Build email error:', err.message);
    res.status(500).json({ error: 'Failed to send — please try emailing us directly at ' + SHOP_EMAIL });
  }
});

// ── POST /api/inquiry ─────────────────────────────────────────────────────────
app.post('/api/inquiry', formLimiter, async (req, res) => {
  const { name, email, device, serviceType, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message is too short.' });
  }

  const bodyHtml = `
    ${row('From',         name)}
    ${row('Reply to',     email)}
    ${row('Device',       device       || '—')}
    ${row('Service type', serviceType  || '—')}
    <div style="margin:20px 0 8px;color:#7272a0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
      Message
    </div>
    <div class="msg">${esc(message)}</div>
  `;

  try {
    await transporter.sendMail({
      from:    `"Mod Machine" <${process.env.SMTP_USER}>`,
      to:      SHOP_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject: `Field Report · ${serviceType || 'Inquiry'} · ${device || 'unknown device'} · ${name}`,
      html:    emailWrapper('New Field Report / Inquiry', bodyHtml),
    });

    // Auto-reply to customer
    await transporter.sendMail({
      from:    `"Mod Machine" <${process.env.SMTP_USER}>`,
      to:      `"${name}" <${email}>`,
      subject: 'Mod Machine — We got your inquiry',
      html: emailWrapper('Inquiry Received', `
        <div class="row"><span class="lbl">Hi</span><span class="val">${esc(name)}</span></div>
        <div class="row"><span class="lbl">Status</span><span class="val" style="color:#f0c000">Under review</span></div>
        <p style="color:#b0b0d0;font-size:14px;margin-top:20px;line-height:1.7;">
          We have your inquiry and will get back to you within 48 hours. 
          Reply to this email to attach photos or add anything you forgot.
        </p>
        <p style="color:#7272a0;font-size:13px;margin-top:12px;">
          For urgent matters, you can also reach us directly at ${SHOP_EMAIL}.
        </p>
      `),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Inquiry email error:', err.message);
    res.status(500).json({ error: 'Failed to send — please try emailing us directly at ' + SHOP_EMAIL });
  }
});

// ── Catch-all → index.html (SPA fallback) ────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n⚙  Mod Machine server running`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Email:   ${SHOP_EMAIL}`);
  console.log(`   Static:  serving index.html + assets\n`);
});
