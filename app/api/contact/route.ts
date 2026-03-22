/**
 * Contact / Access-request API
 *
 * POST /api/contact
 * Body: { name, email, company, role, interests, message, tier }
 *
 * - Sends notification email via Gmail SMTP (nodemailer)
 * - Appends lead to public/assets/data/leads.json (local only; does not persist on Vercel)
 * - Returns { ok: true } on success, { ok: false, error: string } on failure
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ── CORS helper ───────────────────────────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse body ────────────────────────────────────────────────────────
    let body: {
      name?: string;
      email?: string;
      company?: string;
      role?: string;
      interests?: string[];
      message?: string;
      tier?: string;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON body' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { name, email, company, role, interests, message, tier } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'name and email are required' },
        { status: 422, headers: corsHeaders() }
      );
    }

    const timestamp = new Date().toISOString();

    // ── 2. Persist lead locally ──────────────────────────────────────────────
    try {
      const leadsPath = path.join(process.cwd(), 'public', 'assets', 'data', 'leads.json');
      let leads: unknown[] = [];
      if (fs.existsSync(leadsPath)) {
        try {
          const raw = fs.readFileSync(leadsPath, 'utf-8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) leads = parsed;
        } catch {
          // File exists but is corrupt — start fresh
        }
      }
      leads.push({ timestamp, name, email, company, role, interests, message, tier });
      fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (fsErr) {
      // Non-fatal: log and continue (will still send email)
      console.error('[contact] Failed to write leads.json:', fsErr);
    }

    // ── 3. Send email ────────────────────────────────────────────────────────
    const gmailAddress  = process.env.GMAIL_ADDRESS;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');

    if (!gmailAddress || !gmailPassword) {
      console.error('[contact] GMAIL_ADDRESS or GMAIL_APP_PASSWORD env vars are not set');
      return NextResponse.json(
        { ok: false, error: 'Email service not configured' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Dynamic import so the module is only loaded server-side
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailAddress,
        pass: gmailPassword,
      },
    });

    const tierLabel = tier === 'enterprise' ? 'Enterprise' : tier === 'pro' ? 'Pro' : tier ?? '—';
    const interestList = Array.isArray(interests) && interests.length > 0
      ? interests.join(', ')
      : '—';

    const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #FAF8F4; margin: 0; padding: 0;">
  <div style="max-width: 520px; margin: 32px auto; background: #FFFCF7;
              border: 1px solid rgba(120,113,108,0.18); border-radius: 10px; overflow: hidden;">

    <!-- Header -->
    <div style="background: #2D3142; padding: 20px 28px;">
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
                  color: #C65D3E; margin-bottom: 6px;">Qhawarina — Nueva solicitud de acceso</div>
      <div style="font-size: 18px; color: #FFFCF7; font-weight: 400;">
        Plan <strong style="color: #C65D3E;">${tierLabel}</strong> · ${name}
      </div>
    </div>

    <!-- Body -->
    <div style="padding: 24px 28px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        ${row('Nombre', name ?? '—')}
        ${row('Correo', email ?? '—')}
        ${row('Organización', company || '—')}
        ${row('Cargo', role || '—')}
        ${row('Intereses', interestList)}
        ${row('Plan solicitado', tierLabel)}
        ${row('Fecha', timestamp)}
      </table>

      ${message?.trim() ? `
      <div style="margin-top: 20px; padding: 14px 16px; background: #FAF8F4;
                  border-radius: 6px; border-left: 3px solid #C65D3E;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.08em; color: #78716c; margin-bottom: 6px;">Mensaje</div>
        <p style="font-size: 13px; color: #2D3142; line-height: 1.6; margin: 0;">
          ${escapeHtml(message.trim())}
        </p>
      </div>` : ''}

      <div style="margin-top: 24px; font-size: 12px; color: #78716c;">
        Responda directamente a este correo o escriba a
        <a href="mailto:${escapeHtml(email ?? '')}" style="color: #C65D3E;">${escapeHtml(email ?? '')}</a>.
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 14px 28px; border-top: 1px solid rgba(120,113,108,0.18);
                font-size: 11px; color: #78716c;">
      qhawarina.pe · Enviado automáticamente desde el formulario de acceso
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Qhawarina" <${gmailAddress}>`,
      to: 'cesarchavezpadilla@gmail.com',
      replyTo: email,
      subject: `[Qhawarina] Solicitud de acceso ${tierLabel} — ${name}`,
      html: htmlBody,
      text: [
        `Nueva solicitud de acceso — Plan: ${tierLabel}`,
        ``,
        `Nombre:       ${name}`,
        `Correo:       ${email}`,
        `Organización: ${company || '—'}`,
        `Cargo:        ${role || '—'}`,
        `Intereses:    ${interestList}`,
        `Mensaje:      ${message?.trim() || '—'}`,
        ``,
        `Fecha: ${timestamp}`,
      ].join('\n'),
    });

    return NextResponse.json({ ok: true }, { headers: corsHeaders() });

  } catch (err: any) {
    console.error('[contact] Unhandled error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 6px 0; color: #78716c; font-weight: 600;
                 text-transform: uppercase; font-size: 10px; letter-spacing: 0.06em;
                 width: 130px; vertical-align: top;">${label}</td>
      <td style="padding: 6px 0; color: #2D3142; vertical-align: top;">${escapeHtml(value)}</td>
    </tr>`;
}
