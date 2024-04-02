FROM node:18-alpine

RUN apk update && apk upgrade

WORKDIR /

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]