# use image
FROM node:18-alpine

# sets the working directory 
WORKDIR /trash-collect/

# add the project to the container
ADD ./ /trash-collect/

# install dependencies
RUN yarn install

# build the project
RUN yarn build

# expose the port
EXPOSE 3000

# HEALTHCHECKs
# HEALTHCHECK --interval=30s --timeout=5s \
#   CMD curl -fs http://localhost:3005 || exit 1

CMD ["yarn", "start"]

