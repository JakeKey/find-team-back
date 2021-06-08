# find-team-back

Build and run docker images (api + postgres):
docker-compose up --build -d
[on linux os admin privilages required]

Display all containers:
docker ps --all

Delete running container and it's volumes:
docker rm -vf [container/s]

Host in postgres connection string shuold match postgres Docker service name, here 'postgres-db':
NODE_FTEAM_DB_CONNECT=postgres://dbusername:dbuserpassword@postgres-db:5432/dbname
