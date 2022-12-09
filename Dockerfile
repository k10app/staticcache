FROM nginx
RUN mkdir -p /usr/share/nginx/html/static/
COPY ["default.conf","/etc/nginx/conf.d"]
COPY ["static/*","/usr/share/nginx/html/static/"]
COPY ["index.html","/usr/share/nginx/html/"]