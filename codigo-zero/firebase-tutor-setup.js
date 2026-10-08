/* Código Zero — configuração pública do Tutor Firebase AI Logic.
 * Somente /codigo-zero/; não alterar o Controle de Carrinhos da raiz.
 * A configuração Web abaixo não contém chaves privadas.
 */
(() => {
  'use strict';
  const PROJECT_ID = 'codigo-zero-avancado';
  const RECAPTCHA_SITE_KEY = '6LcvyeQtAAAAAL-E2swBDI21uquWkEYcPbR2MUAt';
  const FREE_TIER_MODEL = 'gemini-3.8-flash';

  // Valores públicos do aplicativo Código Zero Web PWA (Firebase > Config).
  // A chave de API Web não é a chave secreta do Gemini.
  const FIREBASE_WEB_CONFIG = Object.freeze({
    apiKey: "AIzaSyB1I_ko3CZyVYyQk_Fz76qD5Ywi2VfWgtg",
    authDomain: "codigo-zero-avancado.firebaseapp.com",
    projectId: "codigo-zero-avancado",
    storageBucket: "codigo-zero-avancado.firebasestorage.app",
    messagingSenderId: "901795657238",
    appId: "1:901795657238:web:482c24f02c1d5924fde737"
  });

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

  // Preservar progresso/aulas, notas, histórico e preferência de tutor local.
  // Corrigir apenas configuração ausente ou de outro projeto Firebase.
  if (ai.recaptchaSiteKey !== RECAPTCHA_SITE_KEY) ai.recaptchaSiteKey = RECAPTCHA_SITE_KEY;
  if (!ai.model) ai.model = FREE_TIER_MODEL;
  if (typeof ai.debugLocal !== 'boolean') ai.debugLocal = false;

  const configStr = JSON.stringify(FIREBASE_WEB_CONFIG);
  let previousConfig = null;
  try {
    previousConfig = ai.firebaseConfig ? JSON.parse(ai.firebaseConfig) : null;
  } catch (_) {
    // Configuração legada incompleta ou colada com sintaxe inválida.
  }
  const sameApp = previousConfig &&
    previousConfig.projectId === PROJECT_ID &&
    previousConfig.appId === FIREBASE_WEB_CONFIG.appId &&
    previousConfig.apiKey === FIREBASE_WEB_CONFIG.apiKey;

  if (!sameApp) {
    ai.firebaseConfig = configStr;
    // A primeira configuração escolhe Gemini, mas não altera depois
    // uma preferência explícita por usar o Tutor Local offline.
    if (!ai.provider || ai.provider === 'local') ai.provider = 'gemini';
  }
  if (!ai.provider) ai.provider = 'gemini';

  // Nenhuma solicitação à API ocorre aqui: somente ao clicar no Tutor.
  // O SDK usa GoogleAIBackend (Gemini Developer API), não o Vertex/Blaze.
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
