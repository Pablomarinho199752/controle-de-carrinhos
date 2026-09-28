# Controle de Carrinhos — Android nativo (Checkpoint 1)

Este pacote adiciona Capacitor 8 e um GitHub Action que gera um APK Android instalável a partir do mesmo HTML/CSS/JS já usado no projeto.

## O que adicionar ao repositório
Copie para a raiz do mesmo repositório `controle-de-carrinhos`:

- `package.json`
- `capacitor.config.json`
- pasta `scripts/`
- pasta `assets/`
- pasta `.github/workflows/`

Não apague `index.html`, `app.js`, `firebase-config.js`, `manifest.json`, `service-worker.js` nem a pasta `icons/`.

## Como gerar o APK
1. Abra o repositório no GitHub.
2. Vá em **Actions**.
3. Escolha **Gerar APK Android**.
4. Clique em **Run workflow**.
5. Aguarde o job terminar.
6. Abra a execução concluída e baixe o artefato **Controle-de-Carrinhos-Android**.
7. Dentro dele estará `app-debug.apk`.

## Importante
Este primeiro APK é uma versão **debug** para teste interno. Depois que ele estiver funcionando no celular, o próximo checkpoint será configurar assinatura e gerar um APK/AAB de release.
