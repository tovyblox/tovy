-- AddForeignKey
ALTER TABLE "rank" ADD CONSTRAINT "rank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
