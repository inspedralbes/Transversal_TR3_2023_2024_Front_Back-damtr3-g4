FROM node:18-alpine

#RUN npm install -g http-server

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]

#Para volver a arrancar el docker hacer
#docker run -d -p 3000:3000  run -d -p 3000:3000 dockernuxt