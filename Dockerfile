FROM node:18-alpine3.16 AS build-stage

WORKDIR /tmp

COPY package*.json yarn.lock /tmp/

RUN yarn install --production

COPY . /tmp

ARG TERRAIN_PROVIDER
ENV TERRAIN_PROVIDER=${TERRAIN_PROVIDER}

ENTRYPOINT yarn build

# ------------------------------------------------------

FROM nginx:1.12-alpine AS production-stage

COPY --from=build-stage /tmp/build /usr/share/nginx/html

ENTRYPOINT nginx -g "daemon off;"
