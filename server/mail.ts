import nodemailer from 'nodemailer'

const user = process.env.GMAIL_USER
const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '')

const transport = user && pass ? nodemailer.createTransport({ service: 'gmail', auth: { user, pass } }) : null

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

type Mail = {
  to: string
  subject: string
  intro: string
  action: string
  url: string
  outro: string
}

export async function sendMail({ to, subject, intro, action, url, outro }: Mail) {
  if (!transport) {
    console.log(`\n[mail] ${subject} → ${to}\n${url}\n`)
    return
  }

  await transport.sendMail({
    from: { name: 'mart.notes', address: user! },
    to,
    subject,
    text: `${intro}\n\n${action}: ${url}\n\n${outro}`,
    html: `<!doctype html>
<div style="font-family: Georgia, serif; font-size: 17px; line-height: 1.5; color: #1c1a16; max-width: 32rem">
  <p style="font-size: 22px; margin: 0 0 24px">mart<span style="color: #8d877a; font-style: italic">.notes</span></p>
  <p>${escape(intro)}</p>
  <p style="margin: 28px 0">
    <a href="${escape(url)}" style="background: #1c1a16; color: #f3f0e8; padding: 12px 20px; text-decoration: none; font-family: sans-serif; font-size: 15px">${escape(action)}</a>
  </p>
  <p style="color: #5f5a4f; font-size: 15px">${escape(outro)}</p>
</div>`,
  })
}
