import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { z } from "zod/v4";
import {
  availability,
  bookings,
  chefGallery,
  chefProfiles,
  chefVerification,
  messages,
  notifications,
  packages,
  reviews,
  savedChefs,
  users,
} from "../drizzle/schema";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";

// ─── Helper: generate booking ref ─────────────────────────────────────────────
function generateBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "CM";
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

// ─── Chefs Router ─────────────────────────────────────────────────────────────
export const chefsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        cuisine: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minRating: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { chefs: [], total: 0 };

      const chefs = await db
        .select({
          id: chefProfiles.id,
          userId: chefProfiles.userId,
          bio: chefProfiles.bio,
          experienceYears: chefProfiles.experienceYears,
          cuisines: chefProfiles.cuisines,
          location: chefProfiles.location,
          postcode: chefProfiles.postcode,
          verificationStage: chefProfiles.verificationStage,
          badgeTier: chefProfiles.badgeTier,
          avgRating: chefProfiles.avgRating,
          totalBookings: chefProfiles.totalBookings,
          profilePhotoUrl: chefProfiles.profilePhotoUrl,
          name: users.name,
          email: users.email,
        })
        .from(chefProfiles)
        .innerJoin(users, eq(chefProfiles.userId, users.id))
        .where(
          and(
            eq(chefProfiles.isActive, true),
            gte(chefProfiles.verificationStage, 1),
            input.minRating
              ? gte(chefProfiles.avgRating, String(input.minRating))
              : undefined,
            input.search
              ? or(
                  like(users.name, `%${input.search}%`),
                  like(chefProfiles.bio, `%${input.search}%`),
                  like(chefProfiles.location, `%${input.search}%`)
                )
              : undefined
          )
        )
        .orderBy(desc(chefProfiles.avgRating))
        .limit(input.limit)
        .offset(input.offset);

      return { chefs, total: chefs.length };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [chef] = await db
        .select({
          id: chefProfiles.id,
          userId: chefProfiles.userId,
          bio: chefProfiles.bio,
          experienceYears: chefProfiles.experienceYears,
          cuisines: chefProfiles.cuisines,
          location: chefProfiles.location,
          postcode: chefProfiles.postcode,
          verificationStage: chefProfiles.verificationStage,
          badgeTier: chefProfiles.badgeTier,
          avgRating: chefProfiles.avgRating,
          totalBookings: chefProfiles.totalBookings,
          profilePhotoUrl: chefProfiles.profilePhotoUrl,
          name: users.name,
          email: users.email,
          phone: users.phone,
        })
        .from(chefProfiles)
        .innerJoin(users, eq(chefProfiles.userId, users.id))
        .where(eq(chefProfiles.id, input.id))
        .limit(1);

      if (!chef) return null;

      const chefPackages = await db
        .select()
        .from(packages)
        .where(and(eq(packages.chefId, input.id), eq(packages.isActive, true)));

      const gallery = await db
        .select()
        .from(chefGallery)
        .where(eq(chefGallery.chefId, input.id))
        .limit(12);

      const chefReviews = await db
        .select({
          id: reviews.id,
          overallRating: reviews.overallRating,
          foodRating: reviews.foodRating,
          presentationRating: reviews.presentationRating,
          punctualityRating: reviews.punctualityRating,
          cleanlinessRating: reviews.cleanlinessRating,
          writtenReview: reviews.writtenReview,
          createdAt: reviews.createdAt,
          clientName: users.name,
          clientAvatar: users.avatarUrl,
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.clientId, users.id))
        .where(eq(reviews.chefId, input.id))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      const chefAvailability = await db
        .select()
        .from(availability)
        .where(eq(availability.chefId, input.id));

      return { ...chef, packages: chefPackages, gallery, reviews: chefReviews, availability: chefAvailability };
    }),

  getMyProfile: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const db = await getDb();
    if (!db) return null;

    const [profile] = await db
      .select()
      .from(chefProfiles)
      .where(eq(chefProfiles.userId, ctx.user.id))
      .limit(1);

    return profile ?? null;
  }),

  updateProfile: publicProcedure
    .input(
      z.object({
        bio: z.string().optional(),
        experienceYears: z.number().optional(),
        cuisines: z.array(z.string()).optional(),
        location: z.string().optional(),
        postcode: z.string().optional(),
        profilePhotoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [existing] = await db
        .select()
        .from(chefProfiles)
        .where(eq(chefProfiles.userId, ctx.user.id))
        .limit(1);

      if (existing) {
        await db
          .update(chefProfiles)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(chefProfiles.userId, ctx.user.id));
      } else {
        await db.insert(chefProfiles).values({
          userId: ctx.user.id,
          ...input,
          verificationStage: 0,
          badgeTier: "none",
        });
      }

      const [profile] = await db
        .select()
        .from(chefProfiles)
        .where(eq(chefProfiles.userId, ctx.user.id))
        .limit(1);
      return profile;
    }),

  getMyVerifications: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const db = await getDb();
    if (!db) return [];
    const [chef] = await db
      .select({ id: chefProfiles.id })
      .from(chefProfiles)
      .where(eq(chefProfiles.userId, ctx.user.id))
      .limit(1);
    if (!chef) return [];
    return db
      .select()
      .from(chefVerification)
      .where(eq(chefVerification.chefId, chef.id))
      .orderBy(desc(chefVerification.submittedAt));
  }),

  submitVerification: publicProcedure
    .input(
      z.object({
        stage: z.number().min(0).max(2),
        documentUrls: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [chef] = await db
        .select({ id: chefProfiles.id })
        .from(chefProfiles)
        .where(eq(chefProfiles.userId, ctx.user.id))
        .limit(1);
      if (!chef) throw new Error("Chef profile not found. Please complete your profile first.");
      await db.insert(chefVerification).values({
        chefId: chef.id,
        stage: input.stage,
        documentUrls: input.documentUrls,
        status: "pending",
      });
      return { success: true };
    }),
});

// ─── Packages Router ──────────────────────────────────────────────────────────
export const packagesRouter = router({
  listByChef: publicProcedure
    .input(z.object({ chefId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(packages)
        .where(and(eq(packages.chefId, input.chefId), eq(packages.isActive, true)));
    }),

  listMine: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const db = await getDb();
    if (!db) return [];

    const [profile] = await db
      .select()
      .from(chefProfiles)
      .where(eq(chefProfiles.userId, ctx.user.id))
      .limit(1);
    if (!profile) return [];

    return db.select().from(packages).where(eq(packages.chefId, profile.id));
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().positive(),
        minGuests: z.number().min(1).default(1),
        maxGuests: z.number().min(1).default(10),
        sampleMenu: z.string().optional(),
        labourCost: z.number().optional(),
        ingredientsCost: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [profile] = await db
        .select()
        .from(chefProfiles)
        .where(eq(chefProfiles.userId, ctx.user.id))
        .limit(1);
      if (!profile) throw new Error("Chef profile not found. Please complete your profile first.");

      const { price, labourCost, ingredientsCost, ...rest } = input;
      await db.insert(packages).values({
        ...rest,
        chefId: profile.id,
        price: String(price),
        ...(labourCost !== undefined ? { labourCost: String(labourCost) } : {}),
        ...(ingredientsCost !== undefined ? { ingredientsCost: String(ingredientsCost) } : {}),
      });
      return { success: true };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        minGuests: z.number().optional(),
        maxGuests: z.number().optional(),
        sampleMenu: z.string().optional(),
        labourCost: z.number().optional(),
        ingredientsCost: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const { id, price, labourCost, ingredientsCost, ...rest } = input;
      const updateData: Record<string, unknown> = { ...rest };
      if (price !== undefined) updateData.price = String(price);
      if (labourCost !== undefined) updateData.labourCost = String(labourCost);
      if (ingredientsCost !== undefined) updateData.ingredientsCost = String(ingredientsCost);

      await db.update(packages).set(updateData).where(eq(packages.id, id));
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(packages).set({ isActive: false }).where(eq(packages.id, input.id));
      return { success: true };
    }),
});

// ─── Availability Router ──────────────────────────────────────────────────────
export const availabilityRouter = router({
  getByChef: publicProcedure
    .input(z.object({ chefId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(availability).where(eq(availability.chefId, input.chefId));
    }),

  getMine: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const db = await getDb();
    if (!db) return [];

    const [profile] = await db
      .select()
      .from(chefProfiles)
      .where(eq(chefProfiles.userId, ctx.user.id))
      .limit(1);
    if (!profile) return [];

    return db.select().from(availability).where(eq(availability.chefId, profile.id));
  }),

  update: publicProcedure
    .input(
      z.array(
        z.object({
          dayOfWeek: z.number().min(0).max(6),
          isAvailable: z.boolean(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [profile] = await db
        .select()
        .from(chefProfiles)
        .where(eq(chefProfiles.userId, ctx.user.id))
        .limit(1);
      if (!profile) throw new Error("Chef profile not found");

      // Delete existing and re-insert
      await db.delete(availability).where(eq(availability.chefId, profile.id));
      if (input.length > 0) {
        await db.insert(availability).values(
          input.map((a) => ({ ...a, chefId: profile.id }))
        );
      }
      return { success: true };
    }),
});

// ─── Bookings Router ──────────────────────────────────────────────────────────
export const bookingsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        chefId: z.number(),
        packageId: z.number(),
        date: z.string(),
        time: z.string(),
        guests: z.number().min(1),
        address: z.string(),
        dietaryNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [pkg] = await db
        .select()
        .from(packages)
        .where(eq(packages.id, input.packageId))
        .limit(1);
      if (!pkg) throw new Error("Package not found");

      const totalAmount = Number(pkg.price);
      const platformFee = Math.round(totalAmount * 0.15 * 100) / 100;
      const chefEarnings = Math.round((totalAmount - platformFee) * 100) / 100;

      let bookingRef = generateBookingRef();
      // Ensure uniqueness
      let attempts = 0;
      while (attempts < 5) {
        const [existing] = await db
          .select()
          .from(bookings)
          .where(eq(bookings.bookingRef, bookingRef))
          .limit(1);
        if (!existing) break;
        bookingRef = generateBookingRef();
        attempts++;
      }

      await db.insert(bookings).values({
        bookingRef,
        clientId: ctx.user.id,
        chefId: input.chefId,
        packageId: input.packageId,
        date: input.date,
        time: input.time,
        guests: input.guests,
        address: input.address,
        dietaryNotes: input.dietaryNotes,
        status: "pending",
        totalAmount: String(totalAmount),
        platformFee: String(platformFee),
        chefEarnings: String(chefEarnings),
      });

      // Notify chef
      const [chefProfile] = await db
        .select()
        .from(chefProfiles)
        .where(eq(chefProfiles.id, input.chefId))
        .limit(1);

      if (chefProfile) {
        await db.insert(notifications).values({
          userId: chefProfile.userId,
          type: "booking_request",
          title: "New Booking Request",
          message: `You have a new booking request for ${input.date} at ${input.time}`,
          data: JSON.stringify({ bookingRef }),
        });
      }

      return { bookingRef, totalAmount, platformFee, chefEarnings };
    }),

  listMine: publicProcedure
    .input(
      z.object({
        status: z.enum(["pending", "confirmed", "declined", "completed", "cancelled", "all"]).default("all"),
        role: z.enum(["client", "chef"]).default("client"),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) return [];
      const db = await getDb();
      if (!db) return [];

      let chefProfileId: number | undefined;
      if (input.role === "chef") {
        const [profile] = await db
          .select()
          .from(chefProfiles)
          .where(eq(chefProfiles.userId, ctx.user.id))
          .limit(1);
        chefProfileId = profile?.id;
        if (!chefProfileId) return [];
      }

      const whereClause =
        input.role === "client"
          ? input.status === "all"
            ? eq(bookings.clientId, ctx.user.id)
            : and(eq(bookings.clientId, ctx.user.id), eq(bookings.status, input.status))
          : input.status === "all"
          ? eq(bookings.chefId, chefProfileId!)
          : and(eq(bookings.chefId, chefProfileId!), eq(bookings.status, input.status));

      const result = await db
        .select({
          id: bookings.id,
          bookingRef: bookings.bookingRef,
          date: bookings.date,
          time: bookings.time,
          guests: bookings.guests,
          address: bookings.address,
          status: bookings.status,
          totalAmount: bookings.totalAmount,
          platformFee: bookings.platformFee,
          chefEarnings: bookings.chefEarnings,
          dietaryNotes: bookings.dietaryNotes,
          createdAt: bookings.createdAt,
          packageName: packages.name,
          packagePrice: packages.price,
          chefId: bookings.chefId,
          clientId: bookings.clientId,
        })
        .from(bookings)
        .innerJoin(packages, eq(bookings.packageId, packages.id))
        .where(whereClause)
        .orderBy(desc(bookings.createdAt));

      return result;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) return null;
      const db = await getDb();
      if (!db) return null;

      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.id))
        .limit(1);
      return booking ?? null;
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["confirmed", "declined", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(bookings)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(bookings.id, input.id));

      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.id))
        .limit(1);

      if (booking) {
        const notifTitle =
          input.status === "confirmed"
            ? "Booking Confirmed!"
            : input.status === "declined"
            ? "Booking Declined"
            : input.status === "cancelled"
            ? "Booking Cancelled"
            : "Booking Completed";

        await db.insert(notifications).values({
          userId: booking.clientId,
          type: `booking_${input.status}`,
          title: notifTitle,
          message: `Your booking ${booking.bookingRef} has been ${input.status}.`,
          data: JSON.stringify({ bookingRef: booking.bookingRef }),
        });
      }

      return { success: true };
    }),

  getEarnings: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return { total: 0, pending: 0, completed: 0, bookings: [] };
    const db = await getDb();
    if (!db) return { total: 0, pending: 0, completed: 0, bookings: [] };

    const [profile] = await db
      .select()
      .from(chefProfiles)
      .where(eq(chefProfiles.userId, ctx.user.id))
      .limit(1);
    if (!profile) return { total: 0, pending: 0, completed: 0, bookings: [] };

    const allBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.chefId, profile.id))
      .orderBy(desc(bookings.createdAt));

    const completed = allBookings.filter((b) => b.status === "completed");
    const pending = allBookings.filter((b) => b.status === "confirmed");

    const totalEarned = completed.reduce((sum, b) => sum + Number(b.chefEarnings), 0);
    const pendingAmount = pending.reduce((sum, b) => sum + Number(b.chefEarnings), 0);

    return {
      total: Math.round(totalEarned * 100) / 100,
      pending: Math.round(pendingAmount * 100) / 100,
      completed: completed.length,
      bookings: allBookings.slice(0, 20),
    };
  }),
});

// ─── Messages Router ──────────────────────────────────────────────────────────
export const messagesRouter = router({
  listThreads: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const db = await getDb();
    if (!db) return [];

    // Get all bookings where user is client or chef
    const [profile] = await db
      .select()
      .from(chefProfiles)
      .where(eq(chefProfiles.userId, ctx.user.id))
      .limit(1);

    const userBookings = await db
      .select({
        id: bookings.id,
        bookingRef: bookings.bookingRef,
        date: bookings.date,
        status: bookings.status,
        chefId: bookings.chefId,
        clientId: bookings.clientId,
      })
      .from(bookings)
      .where(
        profile
          ? or(eq(bookings.clientId, ctx.user.id), eq(bookings.chefId, profile.id))
          : eq(bookings.clientId, ctx.user.id)
      )
      .orderBy(desc(bookings.createdAt))
      .limit(20);

    return userBookings;
  }),

  listByBooking: publicProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          readAt: messages.readAt,
          createdAt: messages.createdAt,
          senderName: users.name,
          senderAvatar: users.avatarUrl,
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.bookingId, input.bookingId))
        .orderBy(messages.createdAt);
    }),

  send: publicProcedure
    .input(
      z.object({
        bookingId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(messages).values({
        bookingId: input.bookingId,
        senderId: ctx.user.id,
        content: input.content,
      });

      // Notify the other party
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.bookingId))
        .limit(1);

      if (booking) {
        const [chefProfile] = await db
          .select()
          .from(chefProfiles)
          .where(eq(chefProfiles.id, booking.chefId))
          .limit(1);

        const recipientId =
          ctx.user.id === booking.clientId
            ? chefProfile?.userId
            : booking.clientId;

        if (recipientId) {
          await db.insert(notifications).values({
            userId: recipientId,
            type: "new_message",
            title: "New Message",
            message: `You have a new message regarding booking ${booking.bookingRef}`,
            data: JSON.stringify({ bookingId: input.bookingId }),
          });
        }
      }

      return { success: true };
    }),
});

// ─── Reviews Router ───────────────────────────────────────────────────────────
export const reviewsRouter = router({
  listByChef: publicProcedure
    .input(z.object({ chefId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select({
          id: reviews.id,
          overallRating: reviews.overallRating,
          foodRating: reviews.foodRating,
          presentationRating: reviews.presentationRating,
          punctualityRating: reviews.punctualityRating,
          cleanlinessRating: reviews.cleanlinessRating,
          writtenReview: reviews.writtenReview,
          createdAt: reviews.createdAt,
          clientName: users.name,
          clientAvatar: users.avatarUrl,
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.clientId, users.id))
        .where(eq(reviews.chefId, input.chefId))
        .orderBy(desc(reviews.createdAt));
    }),

  create: publicProcedure
    .input(
      z.object({
        bookingId: z.number(),
        foodRating: z.number().min(1).max(5),
        presentationRating: z.number().min(1).max(5),
        punctualityRating: z.number().min(1).max(5),
        cleanlinessRating: z.number().min(1).max(5),
        writtenReview: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.bookingId))
        .limit(1);
      if (!booking) throw new Error("Booking not found");

      const overallRating =
        (input.foodRating + input.presentationRating + input.punctualityRating + input.cleanlinessRating) / 4;

      await db.insert(reviews).values({
        bookingId: input.bookingId,
        clientId: ctx.user.id,
        chefId: booking.chefId,
        foodRating: input.foodRating,
        presentationRating: input.presentationRating,
        punctualityRating: input.punctualityRating,
        cleanlinessRating: input.cleanlinessRating,
        overallRating: String(Math.round(overallRating * 100) / 100),
        writtenReview: input.writtenReview,
      });

      // Update chef's average rating
      const chefReviews = await db
        .select({ overallRating: reviews.overallRating })
        .from(reviews)
        .where(eq(reviews.chefId, booking.chefId));

      const avgRating =
        chefReviews.reduce((sum, r) => sum + Number(r.overallRating), 0) / chefReviews.length;

      await db
        .update(chefProfiles)
        .set({ avgRating: String(Math.round(avgRating * 100) / 100) })
        .where(eq(chefProfiles.id, booking.chefId));

      return { success: true };
    }),
});

// ─── Notifications Router ─────────────────────────────────────────────────────
export const notificationsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }),

  markRead: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(notifications).set({ read: true }).where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAllRead: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, ctx.user.id));
    return { success: true };
  }),
});

// ─── Saved Chefs Router ───────────────────────────────────────────────────────
export const savedChefsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const db = await getDb();
    if (!db) return [];
    return db
      .select({
        id: savedChefs.id,
        chefId: savedChefs.chefId,
        createdAt: savedChefs.createdAt,
        chefName: users.name,
        chefPhoto: chefProfiles.profilePhotoUrl,
        chefRating: chefProfiles.avgRating,
        chefCuisines: chefProfiles.cuisines,
        badgeTier: chefProfiles.badgeTier,
      })
      .from(savedChefs)
      .innerJoin(chefProfiles, eq(savedChefs.chefId, chefProfiles.id))
      .innerJoin(users, eq(chefProfiles.userId, users.id))
      .where(eq(savedChefs.clientId, ctx.user.id));
  }),

  toggle: publicProcedure
    .input(z.object({ chefId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [existing] = await db
        .select()
        .from(savedChefs)
        .where(and(eq(savedChefs.clientId, ctx.user.id), eq(savedChefs.chefId, input.chefId)))
        .limit(1);

      if (existing) {
        await db
          .delete(savedChefs)
          .where(and(eq(savedChefs.clientId, ctx.user.id), eq(savedChefs.chefId, input.chefId)));
        return { saved: false };
      } else {
        await db.insert(savedChefs).values({ clientId: ctx.user.id, chefId: input.chefId });
        return { saved: true };
      }
    }),
});

// ─── Admin Router ─────────────────────────────────────────────────────────────
export const adminRouter = router({
  stats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) return { users: 0, chefs: 0, bookings: 0, revenue: 0 };

    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [chefCount] = await db.select({ count: sql<number>`count(*)` }).from(chefProfiles);
    const [bookingCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);
    const [revenueResult] = await db
      .select({ total: sql<number>`sum(platformFee)` })
      .from(bookings)
      .where(eq(bookings.status, "completed"));

    return {
      users: Number(userCount?.count ?? 0),
      chefs: Number(chefCount?.count ?? 0),
      bookings: Number(bookingCount?.count ?? 0),
      revenue: Number(revenueResult?.total ?? 0),
    };
  }),

  listChefApplications: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) return [];

    return db
      .select({
        id: chefVerification.id,
        chefId: chefVerification.chefId,
        stage: chefVerification.stage,
        status: chefVerification.status,
        adminNotes: chefVerification.adminNotes,
        submittedAt: chefVerification.submittedAt,
        reviewedAt: chefVerification.reviewedAt,
        documentUrls: chefVerification.documentUrls,
        chefName: users.name,
        chefEmail: users.email,
      })
      .from(chefVerification)
      .innerJoin(chefProfiles, eq(chefVerification.chefId, chefProfiles.id))
      .innerJoin(users, eq(chefProfiles.userId, users.id))
      .where(eq(chefVerification.status, "pending"))
      .orderBy(desc(chefVerification.submittedAt));
  }),

  reviewApplication: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(chefVerification)
        .set({ status: input.status, adminNotes: input.adminNotes, reviewedAt: new Date() })
        .where(eq(chefVerification.id, input.id));

      if (input.status === "approved") {
        const [verification] = await db
          .select()
          .from(chefVerification)
          .where(eq(chefVerification.id, input.id))
          .limit(1);

        if (verification) {
          const newStage = verification.stage;
          const newBadge =
            newStage >= 2 ? "pro" : newStage >= 1 ? "verified" : "none";

          await db
            .update(chefProfiles)
            .set({
              verificationStage: newStage,
              badgeTier: newBadge as "none" | "verified" | "pro" | "elite",
            })
            .where(eq(chefProfiles.id, verification.chefId));
        }
      }

      return { success: true };
    }),

  listAllBookings: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt))
      .limit(100);
  }),

  listAllUsers: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) return [];

    return db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
  }),
});

// ─── Seed Router (dev only) ───────────────────────────────────────────────────
export const seedRouter = router({
  run: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Check if seed data already exists
    const existingChefs = await db.select().from(chefProfiles).limit(1);
    if (existingChefs.length > 0) return { message: "Seed data already exists" };

    const seedChefs = [
      {
        name: "Marcus Thompson",
        email: "marcus@chefmii.com",
        bio: "Award-winning Caribbean chef with 15 years of experience bringing the vibrant flavours of the Caribbean to private dining experiences across London.",
        cuisines: ["Caribbean", "Fusion"],
        location: "London, UK",
        postcode: "SW1A 1AA",
        experienceYears: 15,
        avgRating: "4.9",
        totalBookings: 127,
        badgeTier: "elite" as const,
        verificationStage: 2,
        photoUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop",
        packages: [
          { name: "Caribbean Feast for 4", description: "A full Caribbean dining experience with jerk chicken, rice & peas, plantain, and rum cake dessert.", price: "180", minGuests: 4, maxGuests: 8 },
          { name: "Intimate Dinner for 2", description: "Romantic 3-course Caribbean dinner with lobster bisque, grilled snapper, and coconut panna cotta.", price: "120", minGuests: 2, maxGuests: 2 },
          { name: "Party Catering (10+)", description: "Full event catering with Caribbean BBQ spread, sides, and desserts for large gatherings.", price: "350", minGuests: 10, maxGuests: 30 },
        ],
      },
      {
        name: "Amara Osei",
        email: "amara@chefmii.com",
        bio: "Passionate West African chef specialising in authentic Ghanaian and Nigerian cuisine. I bring the warmth and richness of West African cooking to your home.",
        cuisines: ["West African", "Nigerian", "Ghanaian"],
        location: "Birmingham, UK",
        postcode: "B1 1BB",
        experienceYears: 10,
        avgRating: "4.8",
        totalBookings: 89,
        badgeTier: "elite" as const,
        verificationStage: 2,
        photoUrl: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&h=400&fit=crop",
        packages: [
          { name: "West African Dinner for 4", description: "Jollof rice, egusi soup, fried plantain, and suya skewers — a true West African feast.", price: "160", minGuests: 4, maxGuests: 8 },
          { name: "Sunday Family Lunch", description: "Traditional Sunday spread with fufu, light soup, and grilled tilapia.", price: "140", minGuests: 4, maxGuests: 10 },
        ],
      },
      {
        name: "Sofia Rossi",
        email: "sofia@chefmii.com",
        bio: "Born in Florence, trained at Le Cordon Bleu Paris. I create authentic Italian dining experiences that transport you straight to Tuscany.",
        cuisines: ["Italian", "Mediterranean"],
        location: "London, UK",
        postcode: "EC1A 1BB",
        experienceYears: 12,
        avgRating: "4.9",
        totalBookings: 203,
        badgeTier: "elite" as const,
        verificationStage: 2,
        photoUrl: "https://images.unsplash.com/photo-1583394293214-0b3b8e6b3b3b?w=400&h=400&fit=crop",
        packages: [
          { name: "Tuscan Dinner for 2", description: "Romantic 4-course Tuscan menu: bruschetta, ribollita, bistecca fiorentina, tiramisu.", price: "150", minGuests: 2, maxGuests: 4 },
          { name: "Italian Family Feast", description: "Antipasti spread, fresh pasta, osso buco, and cannoli for the whole family.", price: "220", minGuests: 6, maxGuests: 12 },
          { name: "Pizza & Pasta Night", description: "Interactive pizza and pasta making experience with dinner for 4.", price: "130", minGuests: 4, maxGuests: 6 },
        ],
      },
      {
        name: "Kenji Tanaka",
        email: "kenji@chefmii.com",
        bio: "Former sushi chef at Nobu London, now bringing the art of Japanese cuisine to private homes. Specialising in omakase and teppanyaki experiences.",
        cuisines: ["Japanese", "Sushi", "Asian Fusion"],
        location: "London, UK",
        postcode: "W1K 1AA",
        experienceYears: 18,
        avgRating: "5.0",
        totalBookings: 156,
        badgeTier: "elite" as const,
        verificationStage: 2,
        photoUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
        packages: [
          { name: "Omakase Experience for 2", description: "Chef's choice 8-course Japanese tasting menu with premium sashimi and seasonal ingredients.", price: "280", minGuests: 2, maxGuests: 4 },
          { name: "Sushi Masterclass & Dinner", description: "Learn to make sushi then enjoy a full Japanese dinner for 4.", price: "200", minGuests: 4, maxGuests: 6 },
          { name: "Teppanyaki Party", description: "Live teppanyaki cooking show with wagyu beef, seafood, and vegetables.", price: "320", minGuests: 6, maxGuests: 10 },
        ],
      },
      {
        name: "Priya Sharma",
        email: "priya@chefmii.com",
        bio: "Third-generation Indian chef from Jaipur, now based in Manchester. My cooking celebrates the diversity of Indian regional cuisine, from Punjabi to Keralan.",
        cuisines: ["Indian", "South Asian", "Vegan"],
        location: "Manchester, UK",
        postcode: "M1 1AA",
        experienceYears: 8,
        avgRating: "4.7",
        totalBookings: 74,
        badgeTier: "pro" as const,
        verificationStage: 2,
        photoUrl: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=400&fit=crop",
        packages: [
          { name: "Indian Banquet for 6", description: "A lavish spread of curries, biryanis, breads, and desserts representing India's diverse regions.", price: "190", minGuests: 6, maxGuests: 12 },
          { name: "Vegan Indian Feast", description: "Plant-based Indian cooking at its finest — dal makhani, aloo gobi, saag, and mango lassi.", price: "150", minGuests: 4, maxGuests: 8 },
        ],
      },
      {
        name: "Antoine Dubois",
        email: "antoine@chefmii.com",
        bio: "Michelin-starred chef from Lyon, bringing classical French technique to intimate private dining. Former sous chef at Restaurant Gordon Ramsay.",
        cuisines: ["French", "European", "Fine Dining"],
        location: "London, UK",
        postcode: "SW3 1AA",
        experienceYears: 20,
        avgRating: "4.9",
        totalBookings: 98,
        badgeTier: "elite" as const,
        verificationStage: 2,
        photoUrl: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&h=400&fit=crop",
        packages: [
          { name: "Classic French Dinner for 2", description: "5-course French tasting menu: amuse-bouche, soupe à l'oignon, duck confit, cheese, crème brûlée.", price: "250", minGuests: 2, maxGuests: 4 },
          { name: "French Bistro Evening", description: "Relaxed French bistro experience for 6 with charcuterie, moules marinière, steak frites, and tarte tatin.", price: "280", minGuests: 6, maxGuests: 8 },
        ],
      },
      {
        name: "Lara Vega",
        email: "lara@chefmii.com",
        bio: "Plant-based chef and nutritionist creating vibrant, flavour-forward vegan and Mediterranean cuisine. Proving that plant-based eating is anything but boring.",
        cuisines: ["Vegan", "Mediterranean", "Plant-Based"],
        location: "Brighton, UK",
        postcode: "BN1 1AA",
        experienceYears: 7,
        avgRating: "4.8",
        totalBookings: 62,
        badgeTier: "pro" as const,
        verificationStage: 2,
        photoUrl: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&h=400&fit=crop",
        packages: [
          { name: "Vegan Mediterranean Dinner", description: "A colourful Mediterranean feast: mezze, stuffed peppers, mushroom risotto, and baklava.", price: "140", minGuests: 4, maxGuests: 8 },
          { name: "Plant-Based Brunch for 4", description: "Indulgent vegan brunch: avocado toast, shakshuka, smoothie bowls, and pastries.", price: "90", minGuests: 4, maxGuests: 6 },
        ],
      },
      {
        name: "David Okafor",
        email: "david@chefmii.com",
        bio: "BBQ pit master and grill specialist with 12 years of experience. From Texas-style brisket to South African braai, I bring the fire to your garden.",
        cuisines: ["BBQ", "American", "South African"],
        location: "Leeds, UK",
        postcode: "LS1 1AA",
        experienceYears: 12,
        avgRating: "4.6",
        totalBookings: 113,
        badgeTier: "elite" as const,
        verificationStage: 2,
        photoUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop",
        packages: [
          { name: "Garden BBQ Party", description: "Full BBQ spread for 8: brisket, ribs, pulled pork, corn, coleslaw, and mac & cheese.", price: "280", minGuests: 8, maxGuests: 20 },
          { name: "Texas Smokehouse Dinner", description: "Authentic Texas BBQ for 4: smoked brisket, jalapeño cornbread, baked beans, and peach cobbler.", price: "180", minGuests: 4, maxGuests: 6 },
        ],
      },
    ];

    for (const chefData of seedChefs) {
      // Create user
      const [userResult] = await db.insert(users).values({
        openId: `seed_${chefData.email.split("@")[0]}`,
        name: chefData.name,
        email: chefData.email,
        loginMethod: "seed",
        role: "chef",
      });

      const userId = (userResult as { insertId: number }).insertId;

      // Create chef profile
      const [profileResult] = await db.insert(chefProfiles).values({
        userId,
        bio: chefData.bio,
        cuisines: chefData.cuisines as unknown as string[],
        location: chefData.location,
        postcode: chefData.postcode,
        experienceYears: chefData.experienceYears,
        avgRating: chefData.avgRating,
        totalBookings: chefData.totalBookings,
        badgeTier: chefData.badgeTier,
        verificationStage: chefData.verificationStage,
        profilePhotoUrl: chefData.photoUrl,
        isActive: true,
      });

      const chefId = (profileResult as { insertId: number }).insertId;

      // Create packages
      for (const pkg of chefData.packages) {
        await db.insert(packages).values({
          chefId,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          minGuests: pkg.minGuests,
          maxGuests: pkg.maxGuests,
          isActive: true,
        });
      }

      // Create default availability (Mon-Sat)
      for (let day = 1; day <= 6; day++) {
        await db.insert(availability).values({
          chefId,
          dayOfWeek: day,
          isAvailable: true,
          startTime: "10:00",
          endTime: "22:00",
        });
      }
    }

    return { message: "Seed data created successfully", count: seedChefs.length };
  }),
});
