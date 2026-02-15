import { defineTable } from "convex/server";
import { v } from "convex/values";

/* -------------------- Audit Log -------------------- */
export const auditLog = defineTable({
  // identifiers
  orgId: v.id("orgs"),
  userId: v.optional(v.id("users")),
  // data
  action: v.string(),
  entityType: v.optional(v.string()),
  entityId: v.optional(v.string()),
  oldValues: v.optional(v.any()),
  newValues: v.optional(v.any()),
})
  .index("by_org_id", ["orgId"])
  .index("by_entity", ["entityType", "entityId"]);
