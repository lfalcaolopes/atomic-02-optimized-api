import { numeric, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const subscriptionEnum = pgEnum('subscription', ['FREE', 'PREMIUM'])
export const productStatusEnum = pgEnum('product_status', ['AVAILABLE', 'GONE'])

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  subscription: subscriptionEnum('subscription').default('FREE').notNull(),
})

export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  status: productStatusEnum('status').default('AVAILABLE').notNull(),
})
