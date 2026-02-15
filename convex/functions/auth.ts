import { UserIdentity } from 'convex/server';
import { internal } from '../_generated/api';
import { internalQuery, query } from '../_generated/server';

/**
 * Get the current user's authentication identity.
 * Returns the identity object if authenticated, throws error if not.
 *
 * @return structure:
 * {
 *  "clerkOrgId": "org_39Z*******Vu8",
 *  "email": "john.does@crew-lodge.com",
 *  "issuer": "https://crew-lodge-123.clerk.accounts.dev",
 *  "name": "John Doe",
 *  "slug": "crew-lodge Inc.",
 *  "subject": "user_39Z*******gyx",
 *  "tokenIdentifier": "https://crew-lodge-123.clerk.accounts.dev|org_39ZN**********"
 * }
 */
export const getAuthInternal = internalQuery({
  args: {},
  handler: async (ctx): Promise<UserIdentity> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    return identity;
  },
});

export const getAuthPublic = query({
  args: {},
  handler: async (ctx): Promise<UserIdentity> => {
    console.log('getAuth called');
    const identity = await ctx.runQuery(
      internal.functions.auth.getAuthInternal
    );
    return identity;
  },
});
