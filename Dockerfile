FROM node:18-alpine3.16 AS build-stage

WORKDIR /tmp

COPY package*.json /tmp

RUN npm ci

COPY . /tmp

ARG TERRAIN_PROVIDER
ENV TERRAIN_PROVIDER=${TERRAIN_PROVIDER}

ENTRYPOINT yarn run build

# -------------------------------------

FROM nginx:1.12-alpine AS production-stage

COPY --from=build-stage /tmp/build /usr/share/nginx/html

ENTRYPOINT nginx -g "daemon off;"
