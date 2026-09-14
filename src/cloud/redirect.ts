export interface AppLocation {
  origin: string;
  pathname: string;
}

/**
 * Keep authentication on the exact static-host path, including a GitHub Pages
 * repository subpath. Hash routes are deliberately excluded because Supabase
 * uses the fragment for returned session details.
 */
export function authRedirectUrl(location: AppLocation): string {
  return `${location.origin}${location.pathname}`;
}
