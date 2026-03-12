import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "client", "chef"]).default("user").notNull(),
  phone: varchar("phone", { length: 32 }),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Chef Profiles ────────────────────────────────────────────────────────────
export const chefProfiles = mysqlTable("chef_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bio: text("bio"),
  experienceYears: int("experienceYears").default(0),
  cuisines: json("cuisines").$type<string[]>().default([]),
  location: varchar("location", { length: 255 }),
  postcode: varchar("postcode", { length: 20 }),
  verificationStage: int("verificationStage").default(0),
  badgeTier: mysqlEnum("badgeTier", ["none", "verified", "pro", "elite"]).default("none"),
  avgRating: decimal("avgRating", { precision: 3, scale: 2 }).default("0.00"),
  totalBookings: int("totalBookings").default(0),
  stripeConnectId: varchar("stripeConnectId", { length: 128 }),
  profilePhotoUrl: text("profilePhotoUrl"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ChefProfile = typeof chefProfiles.$inferSelect;
export type InsertChefProfile = typeof chefProfiles.$inferInsert;

// ─── Packages ─────────────────────────────────────────────────────────────────
export const packages = mysqlTable("packages", {
  id: int("id").autoincrement().primaryKey(),
  chefId: int("chefId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  minGuests: int("minGuests").default(1),
  maxGuests: int("maxGuests").default(10),
  sampleMenu: text("sampleMenu"),
  labourCost: decimal("labourCost", { precision: 10, scale: 2 }),
  ingredientsCost: decimal("ingredientsCost", { precision: 10, scale: 2 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Package = typeof packages.$inferSelect;
export type InsertPackage = typeof packages.$inferInsert;

// ─── Availability ─────────────────────────────────────────────────────────────
export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  chefId: int("chefId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(),
  isAvailable: boolean("isAvailable").default(true),
  startTime: varchar("startTime", { length: 8 }).default("10:00"),
  endTime: varchar("endTime", { length: 8 }).default("22:00"),
});
export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  bookingRef: varchar("bookingRef", { length: 16 }).notNull().unique(),
  clientId: int("clientId").notNull(),
  chefId: int("chefId").notNull(),
  packageId: int("packageId").notNull(),
  date: varchar("date", { length: 16 }).notNull(),
  time: varchar("time", { length: 8 }).notNull(),
  guests: int("guests").notNull(),
  address: text("address"),
  dietaryNotes: text("dietaryNotes"),
  status: mysqlEnum("status", ["pending", "confirmed", "declined", "completed", "cancelled"]).default("pending").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platformFee", { precision: 10, scale: 2 }).notNull(),
  chefEarnings: decimal("chefEarnings", { precision: 10, scale: 2 }).notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull().unique(),
  clientId: int("clientId").notNull(),
  chefId: int("chefId").notNull(),
  foodRating: int("foodRating").notNull(),
  presentationRating: int("presentationRating").notNull(),
  punctualityRating: int("punctualityRating").notNull(),
  cleanlinessRating: int("cleanlinessRating").notNull(),
  overallRating: decimal("overallRating", { precision: 3, scale: 2 }).notNull(),
  writtenReview: text("writtenReview"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Chef Verification ────────────────────────────────────────────────────────
export const chefVerification = mysqlTable("chef_verification", {
  id: int("id").autoincrement().primaryKey(),
  chefId: int("chefId").notNull(),
  stage: int("stage").notNull(),
  documentUrls: json("documentUrls").$type<string[]>().default([]),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  adminNotes: text("adminNotes"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});
export type ChefVerification = typeof chefVerification.$inferSelect;
export type InsertChefVerification = typeof chefVerification.$inferInsert;

// ─── Chef Gallery ─────────────────────────────────────────────────────────────
export const chefGallery = mysqlTable("chef_gallery", {
  id: int("id").autoincrement().primaryKey(),
  chefId: int("chefId").notNull(),
  photoUrl: text("photoUrl").notNull(),
  caption: varchar("caption", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ChefGallery = typeof chefGallery.$inferSelect;
export type InsertChefGallery = typeof chefGallery.$inferInsert;

// ─── Saved Chefs ──────────────────────────────────────────────────────────────
export const savedChefs = mysqlTable("saved_chefs", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  chefId: int("chefId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SavedChef = typeof savedChefs.$inferSelect;
export type InsertSavedChef = typeof savedChefs.$inferInsert;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  read: boolean("read").default(false),
  data: json("data"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
