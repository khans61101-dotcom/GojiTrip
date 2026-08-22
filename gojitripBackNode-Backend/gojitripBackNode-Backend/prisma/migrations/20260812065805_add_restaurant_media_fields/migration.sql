-- AlterTable
ALTER TABLE "public"."Restaurant" ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "recommendedDishes" TEXT[] DEFAULT ARRAY[]::TEXT[];
