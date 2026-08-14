/** Best-effort provider label for a media URL, based on its host. */
export function detectMediaProvider(url: string): string {
  return url.includes('res.cloudinary.com') ? 'cloudinary' : 'external';
}
