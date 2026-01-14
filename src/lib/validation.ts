import { z } from 'zod';

/**
 * Centralized Validation Schemas
 * All API request validation using Zod
 */

// Quote Item Schema
export const QuoteItemSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    discount: z.number().min(0).optional().default(0),
});

// Quote Creation Schema
export const CreateQuoteSchema = z.object({
    clientId: z.string().min(1, 'Client ID is required'),
    items: z.array(QuoteItemSchema).min(1, 'At least one item is required'),
    agentName: z.string().optional(),
    notes: z.string().optional(),
    paymentTerms: z.string().optional(),
    discount: z.number().min(0).max(100).optional().default(0),
    validityDays: z.number().int().positive().optional().default(15),
    quoteNumber: z.string().optional(),
});

// Quote Update Schema
export const UpdateQuoteSchema = z.object({
    status: z.enum(['draft', 'sent', 'accepted', 'rejected']).optional(),
    agentName: z.string().optional(),
    notes: z.string().optional(),
    paymentTerms: z.string().optional(),
    discount: z.number().min(0).max(100).optional(),
    validityDays: z.number().int().positive().optional(),
});

// Product Schema
export const CreateProductSchema = z.object({
    code: z.string().min(1, 'Product code is required'),
    name: z.string().min(1, 'Product name is required'),
    shortDesc: z.string().optional(),
    longDesc: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    category: z.string().optional(),
    specs: z.string().optional(),
    images: z.string().optional(),
    stockStatus: z.enum(['available', 'out_of_stock', 'discontinued']).optional().default('available'),
    links: z.array(z.object({
        linkType: z.string(),
        url: z.string().url(),
        label: z.string().optional(),
    })).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// Client Schema
export const CreateClientSchema = z.object({
    name: z.string().min(1, 'Client name is required'),
    taxId: z.string().min(1, 'Tax ID (RUC) is required'),
    address: z.string().optional(),
    contact: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided for update'
);

// Settings Schema
export const UpdateSettingsSchema = z.object({
    companyName: z.string().min(1).optional(),
    companyAddress: z.string().optional(),
    companyEmail: z.string().email().optional(),
    companyPhone: z.string().optional(),
    companyTaxId: z.string().optional(),
    logoUrl: z.string().url().optional(),
    font: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    template: z.enum(['modern', 'classic', 'minimal']).optional(),
});

// User Initialization Schema
export const InitUserSchema = z.object({
    email: z.string().email('Invalid email format'),
});
