export interface YouTubeParseSuccess {
  ok: true;
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
  normalizedUrl: string;
}

export interface YouTubeParseError {
  ok: false;
  errorKey: 'empty' | 'invalid_url' | 'unsupported_host' | 'missing_id';
}

export type YouTubeParseResult = YouTubeParseSuccess | YouTubeParseError;

const YT_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export function isValidYouTubeVideoId(id: string | undefined | null): boolean {
  if (!id) return false;
  return YT_ID_REGEX.test(id.trim());
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Parses and validates standard YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
export function parseYouTubeUrl(raw: string): YouTubeParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, errorKey: 'empty' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, errorKey: 'invalid_url' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { ok: false, errorKey: 'invalid_url' };
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  let candidateId: string | null = null;

  if (host === 'youtu.be') {
    const seg = parsed.pathname.split('/').filter(Boolean)[0];
    candidateId = seg ?? null;
  } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments[0] === 'watch') {
      candidateId = parsed.searchParams.get('v');
    } else if (segments[0] === 'embed' || segments[0] === 'shorts') {
      candidateId = segments[1] ?? null;
    } else {
      return { ok: false, errorKey: 'missing_id' };
    }
  } else {
    return { ok: false, errorKey: 'unsupported_host' };
  }

  if (!candidateId || !YT_ID_REGEX.test(candidateId)) {
    return { ok: false, errorKey: 'missing_id' };
  }

  return {
    ok: true,
    videoId: candidateId,
    embedUrl: getYouTubeEmbedUrl(candidateId),
    thumbnailUrl: getYouTubeThumbnailUrl(candidateId),
    normalizedUrl: `https://www.youtube.com/watch?v=${candidateId}`,
  };
}
