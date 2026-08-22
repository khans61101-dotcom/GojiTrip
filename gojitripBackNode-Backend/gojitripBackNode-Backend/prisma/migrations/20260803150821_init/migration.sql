-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transport" (
    "id" SERIAL NOT NULL,
    "operatorName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "whatsAppNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "seatCapacity" INTEGER NOT NULL,
    "route" TEXT NOT NULL,
    "pickupPoint" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "fare" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "luggagePolicy" TEXT NOT NULL,
    "driverPhotoUrl" TEXT,
    "vehiclePhotos" TEXT[],
    "licenceVerified" BOOLEAN NOT NULL DEFAULT false,
    "activeStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowLog" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityTitle" TEXT NOT NULL,
    "previousStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "changedByRole" TEXT NOT NULL,
    "changedByName" TEXT NOT NULL,
    "comment" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
