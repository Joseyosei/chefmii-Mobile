import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  adminRouter,
  availabilityRouter,
  bookingsRouter,
  chefsRouter,
  messagesRouter,
  notificationsRouter,
  packagesRouter,
  reviewsRouter,
  savedChefsRouter,
  seedRouter,
} from "./chefmii-routers";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  chefs: chefsRouter,
  packages: packagesRouter,
  availability: availabilityRouter,
  bookings: bookingsRouter,
  messages: messagesRouter,
  reviews: reviewsRouter,
  notifications: notificationsRouter,
  savedChefs: savedChefsRouter,
  admin: adminRouter,
  seed: seedRouter,
});

export type AppRouter = typeof appRouter;
