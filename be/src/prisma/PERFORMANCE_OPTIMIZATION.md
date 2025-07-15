# AstroFinance Database Performance Optimization

This document outlines strategies and recommendations for optimizing the performance of the AstroFinance database.

## Query Optimization

### Common Query Patterns and Optimizations

#### User Account Queries

```typescript
// Inefficient query
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    accounts: true,
    loans: true,
    loanApplications: true,
    // ... many more relations
  }
});

// Optimized query - only fetch what you need
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    accounts: {
      select: {
        id: true,
        accountNumber: true,
        balance: true,
        status: true
      }
    }
  }
});
```

#### Loan Installment Queries

```typescript
// Inefficient query - fetches all installments
const loanInstallments = await prisma.loanInstallment.findMany({
  where: { loanId: loanId }
});

// Optimized query - pagination and specific status
const loanInstallments = await prisma.loanInstallment.findMany({
  where: { 
    loanId: loanId,
    status: 'PENDING'
  },
  orderBy: { dueDate: 'asc' },
  take: 10,
  skip: (page - 1) * 10
});
```

#### Financial Reporting Queries

```typescript
// Inefficient query - might timeout for large datasets
const journalEntries = await prisma.journalEntry.findMany({
  where: {
    entryDate: {
      gte: startDate,
      lte: endDate
    }
  },
  include: {
    journalEntryLines: {
      include: {
        account: true
      }
    }
  }
});

// Optimized query - use aggregation at database level
const accountBalances = await prisma.$queryRaw`
  SELECT 
    a.id, a.accountCode, a.name, a.accountType,
    SUM(CASE WHEN jel.debitAmount > 0 THEN jel.debitAmount ELSE 0 END) as totalDebit,
    SUM(CASE WHEN jel.creditAmount > 0 THEN jel.creditAmount ELSE 0 END) as totalCredit
  FROM accounts_coa a
  LEFT JOIN journal_entry_lines jel ON a.id = jel.accountId
  LEFT JOIN journal_entries je ON jel.journalEntryId = je.id
  WHERE je.entryDate BETWEEN ${startDate} AND ${endDate}
  GROUP BY a.id, a.accountCode, a.name, a.accountType
  ORDER BY a.accountCode
`;
```

## Indexing Strategy

The schema includes strategic indexes on:

1. **Foreign keys** - All foreign key fields have indexes to speed up joins
2. **Frequently filtered fields** - Fields commonly used in WHERE clauses
3. **Sorting fields** - Fields used in ORDER BY clauses
4. **Composite indexes** - For common query patterns that filter on multiple columns

### Additional Index Recommendations

Consider adding the following indexes based on query patterns:

```prisma
// For date range queries on transactions
@@index([createdAt])

// For searching users by name
@@index([fullName])

// For filtering expenses by department and date
@@index([department, expenseDate])
```

## Database Configuration Tuning

### PostgreSQL Configuration Parameters

Adjust these PostgreSQL parameters based on your server specifications:

```
# Memory Configuration
shared_buffers = 2GB                  # 25% of available RAM
work_mem = 64MB                       # Increase for complex sorts/joins
maintenance_work_mem = 256MB          # For maintenance operations
effective_cache_size = 6GB            # 75% of available RAM

# Write Ahead Log
wal_buffers = 16MB                    # 1/32 of shared_buffers
checkpoint_completion_target = 0.9    # Spread out checkpoint writes
max_wal_size = 2GB                    # Increase for busy systems

# Query Planning
random_page_cost = 1.1                # Lower for SSDs
effective_io_concurrency = 200        # Higher for SSDs

# Connection Settings
max_connections = 100                 # Based on expected concurrent users
```

## Connection Pooling

Implement PgBouncer for connection pooling with these recommended settings:

```ini
[databases]
fms_db = host=127.0.0.1 port=5432 dbname=fms_db

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
reserve_pool_size = 5
reserve_pool_timeout = 3
```

## Partitioning Strategy

For tables expected to grow very large, consider implementing partitioning:

### Time-Based Partitioning for Journal Entries

```sql
CREATE TABLE journal_entries_partition (
    id UUID NOT NULL,
    entry_number VARCHAR(255) NOT NULL,
    entry_date DATE NOT NULL,
    -- other columns
    PRIMARY KEY (id, entry_date)
) PARTITION BY RANGE (entry_date);

-- Create partitions by month
CREATE TABLE journal_entries_y2023m01 PARTITION OF journal_entries_partition
    FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');

CREATE TABLE journal_entries_y2023m02 PARTITION OF journal_entries_partition
    FOR VALUES FROM ('2023-02-01') TO ('2023-03-01');

-- And so on...
```

### List Partitioning for Loan Data

```sql
CREATE TABLE loans_partition (
    id UUID NOT NULL,
    loan_type_id VARCHAR(255) NOT NULL,
    -- other columns
    PRIMARY KEY (id, loan_type_id)
) PARTITION BY LIST (loan_type_id);

-- Create partitions by loan type
CREATE TABLE loans_personal PARTITION OF loans_partition
    FOR VALUES IN ('personal-loan-type-id');

CREATE TABLE loans_business PARTITION OF loans_partition
    FOR VALUES IN ('business-loan-type-id');

-- And so on...
```

## Caching Strategy

Implement application-level caching for:

1. **Reference Data** - Loan types, tax rates, chart of accounts
2. **User Profiles** - Cache user data with short TTL
3. **Report Templates** - Cache report definitions
4. **Navigation Structure** - Cache the entire navigation tree

Example Redis implementation:

```typescript
// Cache loan types
const getLoanTypes = async () => {
  const cacheKey = 'loan-types';
  const cachedData = await redisClient.get(cacheKey);
  
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  
  const loanTypes = await prisma.loanType.findMany({
    where: { isActive: true }
  });
  
  await redisClient.set(cacheKey, JSON.stringify(loanTypes), 'EX', 3600); // 1 hour TTL
  return loanTypes;
};
```

## Query Monitoring and Optimization

Set up query monitoring to identify slow queries:

```sql
-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT 
    query,
    calls,
    total_time / calls as avg_time,
    rows / calls as avg_rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 20;
```

## Bulk Operations

For bulk operations, use batch processing:

```typescript
// Inefficient - one query per record
for (const installment of installments) {
  await prisma.loanInstallment.create({
    data: installment
  });
}

// Optimized - batch create
await prisma.loanInstallment.createMany({
  data: installments
});

// For updates that Prisma doesn't support with createMany
await prisma.$transaction(
  installments.map(installment => 
    prisma.loanInstallment.update({
      where: { id: installment.id },
      data: { status: 'PAID' }
    })
  )
);
```

## Read/Write Splitting

For high-traffic systems, implement read/write splitting:

```typescript
// Database configuration
const prismaWrite = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_WRITE_URL
    }
  }
});

const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL
    }
  }
});

// Usage
// Write operations
await prismaWrite.user.create({ data: newUser });

// Read operations
const users = await prismaRead.user.findMany();
```

## Regular Maintenance

Schedule these maintenance tasks:

1. **VACUUM ANALYZE** - Weekly to reclaim space and update statistics
2. **REINDEX** - Monthly to rebuild fragmented indexes
3. **Database statistics update** - Weekly

```sql
-- Full maintenance script
VACUUM ANALYZE;
REINDEX DATABASE fms_db;
```

## Performance Testing

Implement performance testing with realistic data volumes:

1. Generate test data that mimics production patterns
2. Test with 10x expected initial data volume
3. Measure query response times under load
4. Identify bottlenecks and optimize

## Monitoring Metrics

Monitor these key performance indicators:

1. Query response time (95th percentile)
2. Database CPU and memory usage
3. Index hit ratio
4. Cache hit ratio
5. Connection count
6. Transaction throughput
7. Disk I/O

## Scaling Recommendations

As the system grows:

1. **Vertical scaling** - Increase CPU/RAM for the database server
2. **Read replicas** - Add read replicas for reporting queries
3. **Connection pooling** - Implement PgBouncer
4. **Sharding** - Consider sharding by customer or region for very large deployments