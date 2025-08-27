Prisma studio:
 ps aux | grep prisma
lsof -i :5555 (if port is 5555)
kill 16731
npx prisma studio --port 5555

Migration
npx prisma migrate dev --name init
npm prisma validate
npx prisma migrate reset


