import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create prisma client with logging
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
    ],
});

// Configure events
if (prisma instanceof PrismaClient) {
    // Log slow queries (> 200ms)
    (prisma as any).$on('query', (e: any) => {
        if (e.duration > 200) {
            logger.warn('Slow database query detected', {
                duration: e.duration,
                query: e.query,
            });
        }
    });

    (prisma as any).$on('error', (e: any) => {
        logger.error('Database error', e.message);
    });

    (prisma as any).$on('warn', (e: any) => {
        logger.warn('Database warning', e.message);
    });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
