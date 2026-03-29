const { createClient } = require('@supabase/supabase-js');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const emailRaw = body.email;
  const email = String(emailRaw == null ? '' : emailRaw)
    .trim()
    .toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const sourceRaw = body.source;
  const allowed = new Set(['hero', 'bottom']);
  const source = allowed.has(sourceRaw) ? sourceRaw : null;

  const supabase = createClient(supabaseUrl, serviceKey);
  const { error } = await supabase.from('waitlist').insert({ email, source });

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'already_registered',
        message: "You're already on the list.",
      });
    }
    console.error('waitlist insert error', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  return res.status(200).json({ ok: true });
};
