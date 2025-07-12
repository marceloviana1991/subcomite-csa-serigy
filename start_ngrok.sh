#!/bin/bash

# Inicie o ngrok em segundo plano e redirecione a saída para um arquivo temporário
ngrok http 8080 > /tmp/ngrok.log &
NGROK_PID=$!

# Aguarde alguns segundos para o ngrok iniciar
sleep 3

# Obtenha a URL pública a partir da API local do ngrok
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https:[^"]*' | cut -d '"' -f4)

# Salve a URL em uma variável de ambiente no .bashrc para uso posterior (persistente)
echo "export NGROK_URL=$NGROK_URL" >> ~/.bashrc
export NGROK_URL=$NGROK_URL

echo "Ngrok está rodando em: $NGROK_URL"
echo "Variável de ambiente NGROK_URL definida."

# (Opcional) Aguarde o usuário finalizar
wait $NGROK_PID

