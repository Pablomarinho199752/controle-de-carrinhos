# Código Zero — Tutor Gemini / Firebase AI Logic

Este documento se aplica apenas à pasta `/codigo-zero/`. Não usar a configuração
Firebase do aplicativo Controle de Carrinhos (projeto `emprestimo-de-carro`).

## Estado em 08/10/2026

- Projeto Firebase: `codigo-zero-avancado` — plano Spark (sem faturamento).
- Aplicativo Web: **Código Zero Web PWA**.
- App Check registrado: **reCAPTCHA Enterprise / Fraud Defense**, TTL de 1 hora.
- Chave pública App Check pré-carregada por `firebase-tutor-setup.js`.
- Tutor local disponível normalmente; Tutor Gemini requer a **configuração Web pública**
  do mesmo aplicativo Firebase e autorização do serviço Firebase AI Logic.
- Nenhum upgrade, cartão ou faturamento foi ativado por estas alterações.

## Passo restante para usar o Gemini

1. Em https://console.firebase.google.com/, abra `codigo-zero-avancado`.
2. Em **Configurações do projeto > Geral > Seus apps**, selecione **Código Zero Web PWA**.
3. Em **Configuração do SDK**, selecione **Config** e copie o objeto `firebaseConfig`
   contendo `apiKey`, `authDomain`, `projectId`, `appId` etc.
4. No Código Zero (GitHub Pages), abra **Tutor IA > Configurar**. Selecione
   **Gemini — Firebase AI Logic** e cole a configuração como **JSON válido**
   na caixa **Configuração Web do Firebase (JSON)**. Exemplo apenas de formato:

   ```json
   {
     "apiKey": "VALOR_PUBLICO_DO_SEU_APP",
     "authDomain": "codigo-zero-avancado.firebaseapp.com",
     "projectId": "codigo-zero-avancado",
     "appId": "APP_ID_DO_CODIGO_ZERO"
   }
   ```

   **Importante:** use os valores reais do console; não copie literalmente o
   exemplo. O JSON deve ter aspas em nomes e valores, sem `const firebaseConfig =`.
5. O campo reCAPTCHA Enterprise já deverá estar preenchido automaticamente.
   Mantenha o modelo `gemini-3.8-flash`, salvo indisponibilidade na conta.
6. Clique **Testar Gemini**. Se responder "Tutor Gemini conectado", clique
   **Salvar**. Em seguida, teste a explicação de uma aula e o botão
   **Analise meu código**.

Não ative **Exigir/App Check enforcement** manualmente em novos serviços antes
de confirmar um teste real com token válido. O Firebase AI Logic pode já vir
com enforcement ativado no fluxo de configuração.

## Alternativa de instalação automatizada

O arquivo `firebase-tutor-setup.js` possui uma variável
`FIREBASE_WEB_CONFIG = null`. Quando o objeto Web público correto for
disponibilizado, substitua `null` por esse objeto para pré-configurar
automaticamente novos visitantes. O código existente já lê o campo
`state.ai.firebaseConfig`; a configuração salva localmente tem precedência.

## Segurança e custos

- A chave de **site** reCAPTCHA é pública; não publicar chave secreta,
  service account JSON, chaves privadas ou uma chave secreta do Gemini.
- O plano Spark não tem cobrança automática do Firebase; a API Gemini tem
  franquias gratuitas e limites que podem bloquear novas solicitações.
- **Não** conectar faturamento, não migrar para Blaze e não usar Agent
  Platform/Vertex AI se o objetivo é manter o projeto sem cobranças.
- O aplicativo precisa estar on-line para usar Gemini; o tutor local funciona
  sem internet.
- Se o teste falhar com permissão, cota ou token inválido, verificar o status
  de Firebase AI Logic, App Check e domínio `pablomarinho199752.github.io`.
