FROM node:18-alpine3.16 AS build-stage

WORKDIR /tmp

COPY package*.json yarn.lock /tmp/

RUN yarn install --production

COPY . /tmp

ARG DEFAULT_TERRAIN_PROVIDER_URL
ENV DEFAULT_TERRAIN_PROVIDER_URL=${DEFAULT_TERRAIN_PROVIDER_URL}

ENTRYPOINT yarn build

# ------------------------------------------------------

FROM nginx:1.12-alpine AS production-stage

COPY --from=build-stage /tmp/build /usr/share/nginx/html

ENTRYPOINT nginx -g "daemon off;"
