# Етап збірки
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
# Використовуємо legacy-peer-deps, якщо були конфлікти з версіями
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Етап запуску
FROM nginx:stable-alpine
# Копіюємо ваші зібрані файли React
COPY --from=build /app/build /usr/share/nginx/html

# ВАЖЛИВО: Копіюємо ваш кастомний конфіг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]