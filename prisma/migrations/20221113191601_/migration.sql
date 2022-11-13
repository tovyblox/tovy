-- AddForeignKey
ALTER TABLE "inactivityNotice" ADD CONSTRAINT "inactivityNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
