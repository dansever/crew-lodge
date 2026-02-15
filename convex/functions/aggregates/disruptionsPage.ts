import { internal } from '../../_generated/api';
import { query } from '../../_generated/server';
import type { Airport, Disruption, Market } from '../../types';

/**
 * Aggregated page data for the disruptions page: active disruptions + airports + markets.
 * Use with preloadQuery for server-side loading.
 */
export const getDisruptionsPageData = query({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    disruptions: Disruption[];
    airports: Airport[];
    markets: Market[];
  }> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const disruptions = await ctx.db
      .query('disruptions')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .filter(q =>
        q.or(
          q.eq(q.field('status'), undefined),
          q.neq(q.field('status'), 'resolved')
        )
      )
      .collect();
    const airports = await ctx.db
      .query('airports')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();
    const markets = await ctx.db
      .query('markets')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();

    return { disruptions, airports, markets };
  },
});
