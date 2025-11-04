# FROM node:20-alpine

# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# EXPOSE 4050
# CMD ["node", "src/server.js"]


FROM node:20-alpine
ENV PORT=4050
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc
EXPOSE 4050
CMD ["node", "dist/index.js"]

# # Etap 1: build
# FROM node:20 AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# # Etap 2: uruchomienie
# FROM node:20-alpine
# ENV PORT=4050
# WORKDIR /app
# COPY --from=builder /app/dist ./dist
# COPY package*.json ./
# RUN npm install --only=production
# CMD ["node", "dist/index.js"]
