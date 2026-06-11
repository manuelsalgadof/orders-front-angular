# ─── Stage 1: Build ──────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Copy manifests first — layer cache para npm ci
COPY package*.json ./
RUN npm ci

# API_URL es configuración pública del frontend, no un secreto
ARG API_URL=http://localhost:8080

# Copy source
COPY . .

# Inyectar API_URL en environment antes del build
RUN sed -i "s|DOCKER_API_URL_PLACEHOLDER|${API_URL}|g" src/environments/environment.ts

# Verificar que el placeholder fue reemplazado — falla el build si sed no encontró nada
RUN grep -q "DOCKER_API_URL_PLACEHOLDER" src/environments/environment.ts && echo "ERROR: API_URL no fue inyectado — placeholder no encontrado en environment.ts" && exit 1 || true

# Build producción
RUN npx ng build --configuration production

# ─── Stage 2: Serve ──────────────────────────────────────────
FROM nginx:1.27-alpine AS serve

# Eliminar config default de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Config nginx seguro para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar solo el bundle compilado (Angular 19 application builder → browser/)
COPY --from=build /app/dist/orders-front/browser /usr/share/nginx/html

EXPOSE 80
