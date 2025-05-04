import {PrismaClient} from "../generated/prisma/index.js";

const globalFroPrisma = globalThis;

export const db = globalFroPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalFroPrisma.prisma = db;