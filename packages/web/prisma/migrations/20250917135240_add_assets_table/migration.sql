-- CreateTable
CREATE TABLE "Asset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chainName" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "logoPng" TEXT,
    "coinMinimalDenom" TEXT NOT NULL,
    "isBlackList" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
