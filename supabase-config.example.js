/**
 * Zkopíruj jako supabase-config.js a doplň hodnoty z Supabase Dashboard → Settings → API.
 * SUPABASE_ANON_KEY: publishable (`sb_publishable_…`) nebo legacy anon JWT (`eyJ…`).
 *
 * Přihlášení přes Google (OAuth): v Supabase → Authentication → URL Configuration přidej do
 * „Redirect URLs“ adresu webové aplikace (např. https://tvoje-domena.cz/app.html a úvodní stránku
 * https://tvoje-domena.cz/ — kvůli návratu ze Google často na Site URL). Lokálně též
 * http://localhost:PORT/app.html. Provider Google musí být zapnutý se stejným OAuth klientem
 * jako v mobilní aplikaci. Client ID do tohoto souboru nedáváš — jen URL + anon klíč.
 */
export const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
export const SUPABASE_ANON_KEY = "your-publishable-or-anon-key";
