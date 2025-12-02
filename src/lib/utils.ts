import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency: string = "S/"): string {
    return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Generate a unique quote number
 */
export function generateQuoteNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `Q-${year}${month}-${random}`;
}

/**
 * Validate RUC (Peruvian Tax ID)
 * Basic validation - 11 digits
 */
export function validateRUC(ruc: string): boolean {
    return /^\d{11}$/.test(ruc);
}

/**
 * Calculate IGV (tax)
 */
export function calculateTax(amount: number, taxRate: number = 0.18): number {
    return amount * taxRate;
}

/**
 * Calculate subtotal for a quote item
 */
export function calculateItemSubtotal(
    quantity: number,
    unitPrice: number,
    discount: number = 0
): number {
    return (quantity * unitPrice) - discount;
}

/**
 * Calculate quote totals
 */
export function calculateQuoteTotals(
    items: Array<{ quantity: number; unitPrice: number; discount: number }>,
    globalDiscount: number = 0,
    taxRate: number = 0.18
) {
    const subtotal = items.reduce(
        (sum, item) => sum + calculateItemSubtotal(item.quantity, item.unitPrice, item.discount),
        0
    );
    const afterDiscount = subtotal - globalDiscount;
    const tax = calculateTax(afterDiscount, taxRate);
    const total = afterDiscount + tax;

    return {
        subtotal,
        discount: globalDiscount,
        afterDiscount,
        tax,
        total
    };
}
