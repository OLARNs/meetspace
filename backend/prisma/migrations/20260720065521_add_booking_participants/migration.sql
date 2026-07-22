-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "BookingParticipant" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingParticipant_bookingId_userId_key" ON "BookingParticipant"("bookingId", "userId");

-- AddForeignKey
ALTER TABLE "BookingParticipant" ADD CONSTRAINT "BookingParticipant_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingParticipant" ADD CONSTRAINT "BookingParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
