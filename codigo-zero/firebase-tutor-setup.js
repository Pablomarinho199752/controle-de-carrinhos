/* Código Zero — pré-configuração segura do Tutor Firebase.
 * Este arquivo pertence somente ao app /codigo-zero/.
 * A configuração pública Web do Firebase (apiKey, appId etc.) ainda precisa
 * ser copiada do projeto codigo-zero-avancado. Não use chaves privadas.
 */
(() => {
  'use strict';
  const PROJECT_ID = 'codigo-zero-avancado';
  const RECAPTCHA_SITE_KEY = '6LcvyeQtAAAAAL-E2swBDI21uquWkEYcPbR2MUAt';
  const FREE_TIER_MODEL = 'gemini-3.8-flash';

  // Preencher APENAS com o objeto de configuração Web público do Firebase
  // obtido em Configurações do projeto > Seus apps > Código Zero Web PWA.
  // Nunca colocar aqui uma chave de API secreta do Gemini ou uma service account.
  const FIREBASE_WEB_CONFIG = null;

  let data;
  try {
    const raw = localStorage.getItem('codigoZeroState');
    data = raw ? JSON.parse(raw) : {};
    if (!data || typeof data !== 'object' || Array.isArray(data)) return;
  } catch (error) {
    console.warn('Código Zero: não foi possível ler as preferências do Tutor.', error);
    return;
  }

  const ai = data.ai && typeof data.ai === 'object' && !Array.isArray(data.ai)
    ? data.ai
    : {};

  // Não sobrescrever preferências existentes nem os dados das aulas.
  if (!ai.recaptchaSiteKey) ai.recaptchaSiteKey = RECAPTCHA_SITE_KEY;
  if (!ai.model) ai.model = FREE_TIER_MODEL;
  if (typeof ai.debugLocal !== 'boolean') ai.debugLocal = false;
  if (FIREBASE_WEB_CONFIG) {
    if (FIREBASE_WEB_CONFIG.projectId !== PROJECT_ID ||
        !FIREBASE_WEB_CONFIG.apiKey || !FIREBASE_WEB_CONFIG.appId) {
      console.warn('Código Zero: configuração pública Firebase incompleta ou de outro projeto.');
    } else if (!ai.firebaseConfig) {
      ai.firebaseConfig = JSON.stringify(FIREBASE_WEB_CONFIG);
      ai.provider = 'gemini';
    }
  }

  // Sem as credenciais Web públicas, o tutor local continua disponível;
  // não fazer chamadas à IA nem gerar cobranças no carregamento da página.
  if (!ai.provider) ai.provider = ai.firebaseConfig ? 'gemini' : 'local';
  data.ai = ai;
  try {
    localStorage.setItem('codigoZeroState', JSON.stringify(data));
  } catch (error) {
    console.warn('Código Zero: não foi possível salvar a pré-configuração do Tutor.', error);
  }

  window.codigoZeroFirebaseSetup = Object.freeze({
    projectId: PROJECT_ID,
    appCheckProvider: 'reCAPTCHA Enterprise',
    configured: Boolean(ai.firebaseConfig),
    model: ai.model
  });
})();
