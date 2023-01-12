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

# Change nginx config to work without root
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf  && \
  sed -i '/user  nginx;/d' /etc/nginx/nginx.conf && \
  sed -i 's,/var/run/nginx.pid,/tmp/nginx.pid,' /etc/nginx/nginx.conf && \ 
  sed -i "/^http {/a \    server_tokens off;\n    proxy_temp_path /tmp/proxy_temp;\n    client_body_temp_path /tmp/client_temp;\n    fastcgi_temp_path /tmp/fastcgi_temp;\n    uwsgi_temp_path /tmp/uwsgi_temp;\n    scgi_temp_path /tmp/scgi_temp;\n" /etc/nginx/nginx.conf


COPY --from=build-stage /tmp/build /usr/share/nginx/html

# Add permissions
RUN chgrp -R 0 /var/cache/nginx/ && chmod -R g=u /var/cache/nginx/ && chmod -R g=u /usr/share/nginx/

# Create new user 
RUN adduser -S user -G root
USER user

ENTRYPOINT nginx -g "daemon off;"
