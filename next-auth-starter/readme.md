# Prisma studio
 ps aux | grep prisma
lsof -i :5555 (if port is 5555)
kill 16731

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/next_auth_db" npx prisma studio --port 5555

Migration
npx prisma migrate dev --name init
npm prisma validate
npx prisma migrate reset



# Notes
Si vull correr el front sense docker llavors he de canviar la variable d'entorn a API_BASE_URL=http://localhost:8010

