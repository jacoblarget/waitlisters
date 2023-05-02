FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD password
ENV MYSQL_DATABASE waitlist

COPY waitlist.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
