# FROM --platform=linux/amd64 node:18-alpine
# FROM --platform=linux/amd64 keymetrics/pm2:latest-alpine
# WORKDIR /usr/src/app
# # Bundle APP files
# COPY app app/
# COPY app.js .
# COPY yarn*.json ./
# COPY package*.json ./
# COPY ecosystem.config.js .
# COPY . .

# # Install app dependencies
# ENV NPM_CONFIG_LOGLEVEL warn
# RUN yarn install 

# # Expose the listening port of your app
# EXPOSE 4800

# # Show current folder structure in logs
# RUN ls -al -R

# RUN npx prisma generate
# CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]

FROM --platform=linux/amd64 node:18-alpine
# Create app directory
WORKDIR /usr/src/app

RUN npm install pm2 -g

COPY package*.json ./
COPY ecosystem.config.js .

COPY app app/
COPY app.js .

RUN npm install

COPY . . 
EXPOSE 4800

RUN npx prisma generate
CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]