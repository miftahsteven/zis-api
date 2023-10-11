FROM --platform=linux/amd64 keymetrics/pm2:latest-alpine
WORKDIR /usr/src/app
# Bundle APP files
COPY app app/
COPY app.js .
COPY package*.json ./
COPY ecosystem.config.js .
COPY . .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install 

# Expose the listening port of your app
EXPOSE 4800

# Show current folder structure in logs
RUN ls -al -R

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
