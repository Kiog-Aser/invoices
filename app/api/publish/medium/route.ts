import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { content, title, tags, accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing Medium access token' }, { status: 400 });
    }
    // Get user details from Medium
    const userRes = await fetch('https://api.medium.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Invalid Medium access token' }, { status: 401 });
    }
    const user = await userRes.json();
    const userId = user.data.id;
    // Publish draft
    const postRes = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        title: title || 'Draft',
        contentFormat: 'html',
        content,
        tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
        publishStatus: 'draft',
      })
    });
    if (!postRes.ok) {
      const err = await postRes.json().catch(() => ({}));
      return NextResponse.json({ error: err.errors?.[0]?.message || 'Failed to publish to Medium' }, { status: 400 });
    }
    const post = await postRes.json();
    return NextResponse.json({ url: post.data.url });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to publish to Medium' }, { status: 500 });
  }
}
