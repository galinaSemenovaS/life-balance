const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Сервер не настроен: проверьте переменные окружения на Vercel (DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET) и сделайте Redeploy.",
  AccessDenied: "Доступ запрещён. Если приложение Google в режиме Testing, добавьте свой email в Test users.",
  Verification: "Ссылка для входа устарела или уже использована. Попробуйте снова.",
  OAuthSignin: "Не удалось начать вход через Google. Проверьте OAuth redirect URI в Google Console.",
  OAuthCallback: "Google вернул ошибку. Проверьте redirect URI и Client ID/Secret на Vercel.",
  OAuthCreateAccount: "Не удалось создать аккаунт. Проверьте подключение к базе данных.",
  Default: "Не удалось войти. Попробуйте ещё раз.",
};

export function getAuthErrorMessage(code?: string | null): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.Default;
}
