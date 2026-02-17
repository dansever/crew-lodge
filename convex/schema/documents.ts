import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { updatedAtValidator } from './common';

/* -------------------- Documents -------------------- */
// AI-native storage for contracts, invoices, and other unstructured data
export const documents = defineTable({
  // identifiers
  orgId: v.id('orgs'),

  // file storage
  storageId: v.string(), // convex storage ID
  fileName: v.string(),
  fileType: v.string(), // mime type

  // classification
  documentType: v.string(), // 'contract', 'invoice', 'policy', 'other'

  // AI processing status
  status: v.string(), // 'pending', 'processing', 'completed', 'failed'

  // AI extracted intelligence
  summary: v.optional(v.string()),
  extractedData: v.optional(v.any()), // Structured JSON extracted by AI

  // metadata
  tags: v.optional(v.array(v.string())),

  // timestamp
  updatedAt: updatedAtValidator,
})
  .index('by_org_id', ['orgId'])
  .index('by_type', ['documentType'])
  .index('by_status', ['status']);
