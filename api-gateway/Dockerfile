FROM node:20-alpine
WORKDIR /app
COPY package*json ./
RUN npm install
COPY . .
RUN mkdir -p /db-padroes
COPY ../db-padroes/regras.json /db-padroes/regras.json
EXPOSE 3000
CMD ["node", "index.js"]