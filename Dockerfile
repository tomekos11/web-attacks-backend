FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --verbose

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
