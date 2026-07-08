/**
 * Google OAuth sign-in, extracted from app/auth/login/page.tsx for testing.
 *
 * Bug: `signInWithOAuth` was fired-and-forgotten — its `{ error }` result
 * was never read. `signInWithOAuth` only resolves with the tab still open
 * when the request itself failed (misconfigured provider, network error);
 * on success it navigates away before this promise would even matter. So
 * dropping the error meant a failed OAuth attempt looked like the button
 * silently did nothing — no error state was ever set.
 */

type OAuthSignInClient = {
  auth: {
    signInWithOAuth: (args: {
      provider: 'google';
      options: { redirectTo: string };
    }) => Promise<{ error: { message: string } | null }>;
  };
};

/** Returns the error message to show the user, or null on success. */
export async function signInWithGoogleClient(
  sb: OAuthSignInClient,
  redirectTo: string,
): Promise<string | null> {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  return error ? error.message : null;
}
