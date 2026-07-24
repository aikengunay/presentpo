-- AlterEnum
ALTER TYPE "AttendanceSource" ADD VALUE 'teacher_scan';

-- CreateTable
CREATE TABLE "CheckInToken" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "CheckInToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckInToken_token_key" ON "CheckInToken"("token");

-- CreateIndex
CREATE INDEX "CheckInToken_sessionId_studentId_idx" ON "CheckInToken"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "CheckInToken_expiresAt_idx" ON "CheckInToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "CheckInToken" ADD CONSTRAINT "CheckInToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInToken" ADD CONSTRAINT "CheckInToken_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
