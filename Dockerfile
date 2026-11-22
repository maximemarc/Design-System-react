# Vitrine forma. : fichiers statiques construits par Vite, servis par nginx sur 8080, sans root.
# Image publiée par .github/workflows/image.yml (étiquette vX.Y.Z) et déployée sur le cluster
# (dépôt infra-cluster, apps/design-system/). Le pod tourne en lecture seule : nginx n'écrit
# que dans /var/cache/nginx, /run et /tmp, montés en emptyDir par le Deployment.
FROM node:26-alpine AS construction
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.30-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=construction /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /var/cache/nginx /run
USER 101:101
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
