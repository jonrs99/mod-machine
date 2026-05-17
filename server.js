'use strict';
/**
 * Mod Machine — Email Server
 * server.js
 *
 * Uses Resend (resend.com) for transactional email — no SMTP, no port issues.
 * Free tier: 3,000 emails/month.
 *
 * Setup:
 *   1. Sign up at resend.com
 *   2. Add & verify modmachine.shop as a sending domain
 *   3. Create an API key
 *   4. Add RESEND_API_KEY to Railway Variables
 *   5. npm install && node server.js
 */

const express   = require('express');
const { Resend } = require('resend');
const rateLimit = require('express-rate-limit');
const helmet    = require('helmet');
const path      = require('path');
const fs        = require('fs');
require('dotenv').config();

const PORT       = process.env.PORT       || 3000;
const SHOP_EMAIL = process.env.SHOP_EMAIL || 'builders@modmachine.shop';
const RESEND_KEY = process.env.RESEND_API_KEY;

if (!RESEND_KEY) {
  console.warn('⚠ RESEND_API_KEY not set — email submissions will fail.');
  console.warn('  Add it in Railway Variables. Site will still serve normally.');
}

const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

// ── Express setup ─────────────────────────────────────────────────────────────
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '64kb' }));

// Trust Railway's proxy so rate limiting works correctly
app.set('trust proxy', 1);

const ROOT = path.resolve(__dirname);
console.log('Static root:', ROOT);
console.log('index.html exists:', fs.existsSync(path.join(ROOT, 'index.html')));

app.use(express.static(ROOT, { index: 'index.html', extensions: ['html'] }));

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions — try again in a few minutes.' },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stamp() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York', dateStyle: 'long', timeStyle: 'short',
  }) + ' ET';
}

function emailWrapper(title, bodyHtml) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#0c0c14;font-family:'Segoe UI',Arial,sans-serif;}
  .wrap{max-width:600px;margin:32px auto;background:#1c1c28;border:2px solid #484860;}
  .hd{background:#0c0c14;padding:24px 28px;border-bottom:3px solid #f0c000;}
  .hd h1{margin:0;font-size:22px;color:#f0c000;letter-spacing:2px;text-transform:uppercase;}
  .hd p{margin:6px 0 0;font-size:11px;color:#7272a0;letter-spacing:1.5px;text-transform:uppercase;}
  .bd{padding:28px;}
  .row{display:flex;border-bottom:1px solid #363648;padding:10px 0;}
  .row:last-child{border-bottom:none;}
  .lbl{color:#7272a0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;width:160px;flex-shrink:0;padding-top:2px;}
  .val{color:#e8e8f8;font-size:14px;}
  .msg{color:#e8e8f8;font-size:14px;line-height:1.7;white-space:pre-wrap;margin-top:8px;padding:16px;background:#14141e;border-left:3px solid #f0c000;}
  .ft{padding:16px 28px;background:#14141e;border-top:1px solid #363648;font-size:11px;color:#7272a0;}
  .total{font-size:28px;font-weight:700;color:#f0c000;}
</style></head><body>
<div class="wrap">
  <div class="hd"><h1>MOD MACHINE</h1><p>${esc(title)}</p></div>
  <div class="bd">${bodyHtml}</div>
  <div class="ft">Received ${stamp()} · modmachine.shop</div>
</div></body></html>`;
}

function row(label, value) {
  return `<div class="row"><span class="lbl">${esc(label)}</span><span class="val">${esc(value)}</span></div>`;
}

// ── POST /api/build ───────────────────────────────────────────────────────────
app.post('/api/build', formLimiter, async (req, res) => {
  const { customerName, customerEmail, model, source, shell, buttons,
          screen, audio, power, wireless, total, eta } = req.body;

  if (!customerName || !customerEmail)
    return res.status(400).json({ error: 'Name and email are required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
    return res.status(400).json({ error: 'Invalid email address.' });
  if (!resend)
    return res.status(503).json({ error: 'Email service not configured — contact us directly at ' + SHOP_EMAIL });

  const bodyHtml = `
    ${row('Customer', customerName)}
    ${row('Email', customerEmail)}
    <div class="row"><span class="lbl">Est. Total</span>
      <span class="val total">$${esc(String(total))}</span></div>
    ${row('Est. ETA', eta || '—')}
    <div style="margin:20px 0 8px;color:#7272a0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Build Spec</div>
    ${row('Chassis',  model)}    ${row('Unit',     source)}
    ${row('Shell',    shell)}    ${row('Buttons',  buttons)}
    ${row('Display',  screen)}   ${row('Audio',    audio)}
    ${row('Power',    power)}    ${row('Wireless', wireless)}`;

  try {
    await resend.emails.send({
      from:     'Mod Machine <builders@modmachine.shop>',
      to:       [SHOP_EMAIL],
      replyTo:  `${customerName} <${customerEmail}>`,
      subject:  `Work Order · ${model} · $${total} · ${customerName}`,
      html:     emailWrapper('New Work Order Request', bodyHtml),
    });

    await resend.emails.send({
      from:    'Mod Machine <builders@modmachine.shop>',
      to:      [`${customerName} <${customerEmail}>`],
      subject: 'Mod Machine — Work order received',
      html: emailWrapper('Work Order Received', `
        ${row('Hi', customerName)}
        ${row('Status', '<span style="color:#f0c000">Under review</span>')}
        <div class="row"><span class="lbl">Est. Total</span>
          <span class="val total">$${esc(String(total))}</span></div>
        <p style="color:#b0b0d0;font-size:14px;margin-top:20px;line-height:1.7;">
          We have your work order and will follow up within 48 hours to confirm 
          availability and arrange shipping or sourcing.
        </p>
        <p style="color:#7272a0;font-size:13px;margin-top:12px;">
          Reply to this email with any questions or to attach photos of your unit.
        </p>`),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Build email error:', err.message);
    res.status(500).json({ error: 'Failed to send — email us directly at ' + SHOP_EMAIL });
  }
});

// ── POST /api/inquiry ─────────────────────────────────────────────────────────
app.post('/api/inquiry', formLimiter, async (req, res) => {
  const { name, email, device, serviceType, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ error: 'Name, email and message are required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address.' });
  if (message.trim().length < 10)
    return res.status(400).json({ error: 'Message is too short.' });
  if (!resend)
    return res.status(503).json({ error: 'Email service not configured — contact us directly at ' + SHOP_EMAIL });

  const bodyHtml = `
    ${row('From',         name)}
    ${row('Reply to',     email)}
    ${row('Device',       device      || '—')}
    ${row('Service type', serviceType || '—')}
    <div style="margin:20px 0 8px;color:#7272a0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Message</div>
    <div class="msg">${esc(message)}</div>`;

  try {
    await resend.emails.send({
      from:    'Mod Machine <builders@modmachine.shop>',
      to:      [SHOP_EMAIL],
      replyTo: `${name} <${email}>`,
      subject: `Field Report · ${serviceType || 'Inquiry'} · ${device || 'unknown'} · ${name}`,
      html:    emailWrapper('New Field Report / Inquiry', bodyHtml),
    });

    await resend.emails.send({
      from:    'Mod Machine <builders@modmachine.shop>',
      to:      [`${name} <${email}>`],
      subject: 'Mod Machine — Inquiry received',
      html: emailWrapper('Inquiry Received', `
        ${row('Hi', name)}
        ${row('Status', '<span style="color:#f0c000">Under review</span>')}
        <p style="color:#b0b0d0;font-size:14px;margin-top:20px;line-height:1.7;">
          We have your inquiry and will get back to you within 48 hours.
          Reply to this email to attach photos or add anything you forgot.
        </p>`),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Inquiry email error:', err.message);
    res.status(500).json({ error: 'Failed to send — email us directly at ' + SHOP_EMAIL });
  }
});

// ── Catch-all → index.html ────────────────────────────────────────────────────
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
