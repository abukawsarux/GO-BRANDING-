import prisma from "@/lib/prisma";
import { CreditTransactionType } from "@prisma/client";

export class InsufficientCreditsError extends Error {
  constructor(message = "Insufficient credits for this operation") {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

export async function getWorkspaceCredits(workspaceId: string): Promise<number> {
  const balance = await prisma.creditBalance.findUnique({
    where: { workspaceId },
  });

  return balance?.credits ?? 0;
}

export async function deductCredits(params: {
  workspaceId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  referenceId?: string;
}): Promise<number> {
  return await prisma.$transaction(async (tx) => {
    let balanceRecord = await tx.creditBalance.findUnique({
      where: { workspaceId: params.workspaceId },
    });

    if (!balanceRecord) {
      // Initialize with default signup credits if not present
      balanceRecord = await tx.creditBalance.create({
        data: { workspaceId: params.workspaceId, credits: 20 },
      });
    }

    if (balanceRecord.credits < params.amount) {
      throw new InsufficientCreditsError(
        `Workspace requires ${params.amount} credits, but currently has ${balanceRecord.credits}.`
      );
    }

    const newCredits = balanceRecord.credits - params.amount;

    await tx.creditBalance.update({
      where: { workspaceId: params.workspaceId },
      data: { credits: newCredits },
    });

    await tx.creditLedger.create({
      data: {
        workspaceId: params.workspaceId,
        amount: -params.amount,
        balanceAfter: newCredits,
        type: params.type,
        description: params.description,
        referenceId: params.referenceId,
      },
    });

    return newCredits;
  });
}

export async function addCredits(params: {
  workspaceId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  referenceId?: string;
}): Promise<number> {
  return await prisma.$transaction(async (tx) => {
    const balanceRecord = await tx.creditBalance.upsert({
      where: { workspaceId: params.workspaceId },
      update: { credits: { increment: params.amount } },
      create: { workspaceId: params.workspaceId, credits: params.amount },
    });

    await tx.creditLedger.create({
      data: {
        workspaceId: params.workspaceId,
        amount: params.amount,
        balanceAfter: balanceRecord.credits,
        type: params.type,
        description: params.description,
        referenceId: params.referenceId,
      },
    });

    return balanceRecord.credits;
  });
}

