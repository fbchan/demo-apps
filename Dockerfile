FROM node:9-alpine
RUN apk add --no-cache ca-certificates && update-ca-certificates
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]
