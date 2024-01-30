FROM node:latest

WORKDIR /developer/nodejs/booking-service

COPY package*.json .sequelizerc startup.sh ./

RUN npm ci

RUN mkdir /src

COPY ./src ./src

RUN chmod +x startup.sh

ENTRYPOINT [ "./startup.sh" ]