import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from './logger';

/**
 * Unified Error Handler
 * Maps different error types to appropriate HTTP responses
 */

export interface ErrorResponse {
    error: string;
    details?: any;
    requestId?: string;
}

export function handleError(
    error: unknown,
    requestId?: string,
    context?: string
): NextResponse<ErrorResponse> {
    // Log the error with context
    logger.error(`Error in ${context || 'API'}`, error, { requestId });

    // Zod Validation Error
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: 'Validation failed',
                details: error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
                requestId,
            },
            { status: 400 }
        );
    }

    // Prisma Errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return NextResponse.json(
                    {
                        error: 'A record with this value already exists',
                        details: error.meta,
                        requestId,
                    },
                    { status: 409 }
                );
            case 'P2025':
                return NextResponse.json(
                    {
                        error: 'Record not found',
                        requestId,
                    },
                    { status: 404 }
                );
            case 'P2003':
                return NextResponse.json(
                    {
                        error: 'Invalid reference - related record not found',
                        requestId,
                    },
                    { status: 400 }
                );
            default:
                return NextResponse.json(
                    {
                        error: 'Database error occurred',
                        requestId,
                    },
                    { status: 500 }
                );
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json(
            {
                error: 'Invalid data format',
                requestId,
            },
            { status: 400 }
        );
    }

    // Clerk Errors (auth errors)
    if (error && typeof error === 'object' && 'clerkError' in error) {
        return NextResponse.json(
            {
                error: 'Authentication error',
                requestId,
            },
            { status: 401 }
        );
    }

    // Stripe Errors
    if (error && typeof error === 'object' && 'type' in error) {
        const stripeError = error as any;
        if (stripeError.type === 'StripeCardError') {
            return NextResponse.json(
                {
                    error: 'Payment card error',
                    details: stripeError.message,
                    requestId,
                },
                { status: 402 }
            );
        }
        if (stripeError.type === 'StripeInvalidRequestError') {
            return NextResponse.json(
                {
                    error: 'Invalid payment request',
                    requestId,
                },
                { status: 400 }
            );
        }
    }

    // Generic Error
    const message = error instanceof Error ? error.message : 'Internal server error';

    // Don't expose internal error messages in production
    const userMessage = process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : message;

    return NextResponse.json(
        {
            error: userMessage,
            requestId,
        },
        { status: 500 }
    );
}
