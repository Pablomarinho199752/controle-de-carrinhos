# Código Zero — Tutor Gemini / Firebase AI Logic

## Configuração publicada em 08/10/2026

- Repositório: `Pablomarinho199752/controle-de-carrinhos`
- Aplicativo: `/codigo-zero/`, sem mudanças no Controle de Carrinhos da raiz.
- Firebase: `codigo-zero-avancado` — **Spark** no último print enviado pelo dono.
- App Web: `Código Zero Web PWA`.
- App ID: `1:901795657238:web:482c24f02c1d5924fde737`.
- App Check: **Registrado / Fraud Defense (reCAPTCHA Enterprise)**, TTL 1 hora,
  conforme a captura de tela do Firebase.
- Chave de site pública e objeto de configuração Web foram integrados no
  arquivo `firebase-tutor-setup.js`, carregado antes de `bootstrap.js`.
- O tutor escolhe **Gemini / Firebase AI Logic** automaticamente em instalações
  sem configuração válida. Preferências já personalizadas para o mesmo app
  podem ser mantidas.
- Modelo padrão: `gemini-3.8-flash`. Provedor no código:
  `GoogleAIBackend` (Gemini Developer API, não Agent Platform/Vertex AI).
- O cache da PWA recebeu nova versão, preservando progresso local.
- **Sem geração automática de chamadas de IA no carregamento**: só ao testar,
  enviar uma mensagem ou usar um dos atalhos do Tutor.

## Verificar se o Tutor Gemini realmente responde

1. Acesse
   https://pablomarinho199752.github.io/controle-de-carrinhos/codigo-zero/
2. Atualize a página (se o app já estava instalado, feche e abra novamente).
3. Abra **Tutor IA** > **Configurar**.
4. Confira se o provedor é **Gemini — Firebase AI Logic**, o modelo é
   `gemini-3.8-flash` e o JSON do Firebase está preenchido automaticamente.
5. Clique em **Testar Gemini**. A resposta esperada é
   `Tutor Gemini conectado.` (ou algo equivalente do modelo).
6. Se o teste falhar, anote a mensagem de erro exata. Verifique:
   - **Firebase > AI Logic**: fluxo de ativação concluído com **Gemini Developer API**;
   - **App Check > Apps**: aplicativo Web registrado;
   - reCAPTCHA Enterprise: domínio `pablomarinho199752.github.io` autorizado;
   - quotas gratuitas disponíveis e projeto ainda no Spark.

> Teste de resposta **ainda não confirmado** por este guia. Estar registrado
> no App Check não garante que o backend Gemini tenha sido habilitado ou que
> o domínio reCAPTCHA esteja autorizado. Não mudar para Blaze para corrigir erro.

## Segurança e custos

- A `apiKey` da configuração Web Firebase e a chave **de site** reCAPTCHA são
  identificadores de uso client-side. **Nunca publicar** chave secreta do
  Gemini Developer API, senha, chave privada ou service account.
- Firebase AI Logic não tem cobrança própria; a Gemini Developer API oferece
  **nível gratuito**, sujeito a cotas por modelo e região.
- Continuar no **Spark**; não cadastrar faturamento nem selecionar
  **Agent Platform Gemini API / Vertex AI** (que exige Blaze).
- O modo **Tutor Local** funciona sem internet. Gemini exige conexão.
- O App Check do lado cliente já pode solicitar tokens; não altere manualmente
  enforcement de outros serviços antes de confirmar seu funcionamento.
- Não haverá cobranças automáticas pelo uso do Firebase no Spark, mas
  serviços externos vinculados a outras contas têm faturamento próprio.
