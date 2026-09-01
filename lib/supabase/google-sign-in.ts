type OAuthSignInClient = {
  auth: {
    signInWithOAuth: (args: {
      provider: 'google';
      options: { redirectTo: string };
    }) => Promise<{ error: { message: string } | null }>;
  };
};

/**
 * Unlike the magic-link `sendLink` handler on the login page, the Google
 * button used to await `signInWithOAuth` with no try/catch and ignored the
 * returned `{ error }` entirely — a rejected request (e.g. third-party
 * cookies blocked) or an error response left the button doing nothing with
 * no feedback to the user. Returns the message to show, or null on success
 * (the browser is about to navigate away to Google).
 */
export async function attemptGoogleSignIn(sb: OAuthSignInClient, origin: string): Promise<string | null> {
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` },
    });
    return error ? error.message : null;
  } catch {
    return 'Не удалось начать вход через Google. Попробуйте ещё раз.';
  }
}
