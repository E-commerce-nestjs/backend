import { PrismaClient } from "generated/prisma/client"

export const getAllModels = (prismaClient: PrismaClient) => {
    const models = Reflect.ownKeys(prismaClient).filter((key) => typeof key === 'string').filter((key) => !key.startsWith('$')).filter((key) => !key.includes('onModule')).filter((key) => !key.startsWith('_')).filter((key) => !key.includes('constructor')).filter((key) => !key.includes('cleanDatabase')).map(key => key.charAt(0).toLocaleLowerCase() + key.slice(1))
    return [...new Set(models)]
}