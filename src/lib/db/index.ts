import { prisma } from './prisma'

export const db = {
  user: {
    create: async (data: { name?: string; email?: string; image?: string }) => {
      return prisma.user.create({ data })
    },
    findById: async (id: string) => {
      return prisma.user.findUnique({ where: { id } })
    },
    findByEmail: async (email: string) => {
      return prisma.user.findUnique({ where: { email } })
    },
  },
  resume: {
    create: async (data: { userId: string; title: string; content: string }) => {
      return prisma.resume.create({ data })
    },
    findByUserId: async (userId: string) => {
      return prisma.resume.findMany({ where: { userId } })
    },
    update: async (id: string, data: { title?: string; content?: string }) => {
      return prisma.resume.update({ where: { id }, data })
    },
    delete: async (id: string) => {
      return prisma.resume.delete({ where: { id } })
    },
  },
}
