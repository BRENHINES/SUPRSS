# frontend/Dockerfile
# 1/ Build
FROM node:20-alpine AS build
WORKDIR /app

# Installe deps
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Choisis ton gestionnaire (npm par défaut)
RUN npm ci || yarn --frozen-lockfile || pnpm i --frozen-lockfile

# Copie le code
COPY . ./

# Variable Vite (passée en build-arg dans compose)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build
RUN npm run build || yarn build || pnpm build

# 2/ Nginx
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copie le build
COPY --from=build /app/dist ./

# Nginx config avec proxy /api → backend:8000
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
