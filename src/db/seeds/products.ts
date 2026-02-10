import { db, pool } from '../../config/database'
import { productsTable } from '../../db/schema'

const TOTAL_PRODUCTS = 10_000
const BATCH_SIZE = 1_000

const productStatuses = ['AVAILABLE', 'GONE'] as const

const buildProduct = (index: number) => ({
  name: `Product ${String(index + 1).padStart(5, '0')}`,
  price: ((index % 500) + 1).toFixed(2),
  status: productStatuses[index % productStatuses.length],
})

const seedProducts = async () => {
  for (let start = 0; start < TOTAL_PRODUCTS; start += BATCH_SIZE) {
    const count = Math.min(BATCH_SIZE, TOTAL_PRODUCTS - start)

    const batch = Array.from({ length: count }, (_, batchIndex) =>
      buildProduct(start + batchIndex)
    )

    await db.insert(productsTable).values(batch)
  }
}

const main = async () => {
  await seedProducts()
  console.log(`Inserted ${TOTAL_PRODUCTS} generic products`)
}

main()
  .catch((error) => {
    console.error('Failed to seed products table', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
