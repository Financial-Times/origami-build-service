FROM heroku/cedar:14

# Create an app user and be that user. Treat /app as the user's home directory.
RUN useradd -d /app -m app
RUN /bin/su app
ENV HOME /app
WORKDIR /app
RUN mkdir -p /app/.profile.d

# Node will be installed in /app/heroku/node, app in /app/user
RUN mkdir -p /app/heroku/node
RUN mkdir -p /app/user

# Install node and configure PATH
ENV NODE_ENGINE 4.3.1
RUN curl -s https://s3pository.heroku.com/node/v$NODE_ENGINE/node-v$NODE_ENGINE-linux-x64.tar.gz | tar --strip-components=1 -xz -C /app/heroku/node
ENV PATH /app/heroku/node/bin:/app/bin:/app/user/node_modules/.bin:$PATH
RUN echo "export PATH=\"/app/heroku/node/bin:/app/bin:/app/user/node_modules/.bin:\$PATH\"" > /app/.profile.d/nodejs.sh

# Configure git to use HTTPS instead of SSH
RUN echo '[url "https://"]\n    insteadOf = git://' > /app/.gitconfig

# Ruby is already installed in cedar-14. Configure gem location and install sass gem
# (only required for /v1 build service endpoint)
ENV GEM_HOME /app/.gems
RUN echo "export GEM_HOME=/app/.gems\n" >> /app/.profile.d/gems.sh
ENV PATH /app/.gems/bin:$PATH
RUN echo "export PATH=\"/app/.gems/bin:\$PATH\"" >> /app/.profile.d/gems.sh
RUN gem install sass

# Make the app directory the CWD for running the service
WORKDIR /app/user
RUN echo "cd /app/user" >> /app/.profile.d/nodejs.sh

# Copy only the package.json prior to the npm install, allows cached node_modules to be used even if other source files (below) change
COPY package.json /app/user/

RUN npm install

COPY appversion /app/user/
COPY app.json /app/user/
COPY about.json /app/user/
COPY index.js /app/user/
COPY lib /app/user/lib
COPY docs /app/user/docs
COPY test /app/user/test
COPY tools /app/user/tools

# For dev, allow mounting of filesystem from outside the container
VOLUME /app/user/lib
VOLUME /app/user/node_modules/origami-build-tools
