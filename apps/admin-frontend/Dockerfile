FROM nginx:alpine

# Clear default welcome page so only admin assets are served
RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY index.html login.html products.html users.html orders.html /usr/share/nginx/html/
COPY admin.css admin-auth.js api.js dashboard.js products.js users.js orders.js /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
