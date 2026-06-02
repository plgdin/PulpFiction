import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
  const API_KEY = process.env.BUNNY_API_KEY;

  if (!LIBRARY_ID || !API_KEY) {
    return res.status(500).json({ error: 'Missing Bunny CDN environment variables' });
  }

  // Validate Supabase Admin Session prior to Bunny CDN upload slot allocation
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Dynamically initialize verification client
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || ''
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid user session' });
  }

  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Video title is required' });
  }

  try {
    // 1. Create a new video object in Bunny Stream
    const createResponse = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`, {
      method: 'POST',
      headers: {
        'AccessKey': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Bunny CDN Create Error:', errorText);
      return res.status(createResponse.status).json({ error: 'Failed to create video slot in Bunny CDN' });
    }

    const videoData = await createResponse.json();
    const videoId = videoData.guid;

    // 2. Generate a signature for TUS direct upload
    // Signature format: SHA256(library_id + api_key + expiration_time + video_id)
    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    const signatureString = `${LIBRARY_ID}${API_KEY}${expirationTime}${videoId}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    // Return the secure parameters to the frontend
    return res.status(200).json({
      libraryId: LIBRARY_ID,
      videoId: videoId,
      signature: signature,
      expirationTime: expirationTime,
    });
  } catch (error) {
    console.error('Error in bunny-upload-auth:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
