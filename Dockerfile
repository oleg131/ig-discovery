# build
FROM node:10.6-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install --ignore-scripts
COPY . /app
RUN npm run build

# production
FROM abiosoft/caddy:1.0.1
COPY --from=build /app/build /build
COPY ./Caddyfile /etc/Caddyfile
ENTRYPOINT ["/usr/bin/caddy"]
CMD ["--conf", "/etc/Caddyfile", "--log", "stdout"]
