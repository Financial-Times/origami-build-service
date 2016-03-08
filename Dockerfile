FROM mhart/alpine-node:4

# Set the working directory
WORKDIR /app

# Install additional dependencies required to build modules
# TODO comment on _why_ these are here
RUN apk add --no-cache --update g++ gcc git make python

# Install Node.js dependencies
COPY package.json /app/
RUN npm install -g nodemon && npm cache clean
RUN npm install --production && npm cache clean

# Copy across the application
COPY . /app/

# Heroku ignores this command and will use their designated port set as an environment variable
EXPOSE 8080

CMD ["npm", "start"]
