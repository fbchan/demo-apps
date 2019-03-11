FROM node:9-alpine
ADD https://get.aquasec.com/microscanner .
RUN chmod +x microscanner
RUN ./microscanner OWExYmFhMzU1MDI2
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]
