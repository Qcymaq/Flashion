# Frontend Dockerfile for React
FROM node:20-alpine AS build
WORKDIR /app

# Accept build arguments
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
# Optional bank transfer details (empty = show a "contact the shop" message)
ARG REACT_APP_BANK_NAME
ARG REACT_APP_BANK_ACCOUNT_NUMBER
ARG REACT_APP_BANK_ACCOUNT_HOLDER
ARG REACT_APP_BANK_QR_URL
ENV REACT_APP_BANK_NAME=$REACT_APP_BANK_NAME \
    REACT_APP_BANK_ACCOUNT_NUMBER=$REACT_APP_BANK_ACCOUNT_NUMBER \
    REACT_APP_BANK_ACCOUNT_HOLDER=$REACT_APP_BANK_ACCOUNT_HOLDER \
    REACT_APP_BANK_QR_URL=$REACT_APP_BANK_QR_URL

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 