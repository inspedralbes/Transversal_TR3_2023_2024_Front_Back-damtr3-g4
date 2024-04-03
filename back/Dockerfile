FROM node:18

WORKDIR /

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]

#Para volver a arrancar el docker del node hacer
#docker run -d -p 3789:3789 dockernode