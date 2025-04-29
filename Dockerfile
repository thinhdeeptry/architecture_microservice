FROM node:20-alpine

# Sử dụng ARG để nhận tham số khi build
ARG SERVICE=product-service
ARG PORT=3001

WORKDIR /usr/src/app

# Copy package.json của root và service
COPY package*.json ./
COPY ${SERVICE}/package*.json ./${SERVICE}/

# Cài đặt dependencies
RUN npm install
WORKDIR /usr/src/app/${SERVICE}
RUN npm install

# Copy source code
WORKDIR /usr/src/app
COPY . .

# Build service
WORKDIR /usr/src/app/${SERVICE}
RUN npm run build

# Expose port
EXPOSE ${PORT}

# Start service
CMD ["npm", "run", "start:prod"]