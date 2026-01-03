# Vedanco Air - Database

Unified, production-ready database schema for the Vedanco Air private jet charter platform.

## 📁 Structure

```
database/
├── schema/
│   └── 00_master_schema.sql          # Complete unified schema (12 tables)
├── functions/
│   ├── auth_functions.sql            # Session & authentication helpers
│   ├── payment_functions.sql         # ACID-compliant payments
│   └── operator_functions.sql        # Operator workflow utilities
├── migrations/
│   └── 01_initial_deployment.sql     # Full deployment script
├── seed/
│   └── (empty - add test data here)
└── docs/
    ├── README.md                     # Complete documentation
    ├── deployment_guide.md           # Step-by-step deployment
    └── schema_diagram.md             # Visual schema reference
```

## 🚀 Quick Start

### Deploy to Supabase

1. Open **Supabase Dashboard** → **SQL Editor**
2. Run `database/schema/00_master_schema.sql`
3. Run `database/functions/auth_functions.sql`
4. Run `database/functions/payment_functions.sql`
5. Run `database/functions/operator_functions.sql`

**Or use the single deployment file:**
```sql
-- Run in Supabase SQL Editor
\i database/migrations/01_initial_deployment.sql
```

See [deployment_guide.md](docs/deployment_guide.md) for detailed instructions.

## 📊 Database Overview

### Tables (12)
- **profiles** - User information (extends auth.users)
- **operators** - Active operator directory
- **aircraft** - Operator fleet management
- **inquiries** - Customer booking requests
- **quotes** - Operator proposals
- **bookings** - Confirmed reservations
- **orders** - Purchase records
- **transactions** - Payment tracking (ACID-compliant)
- **operator_applications** - Operator onboarding
- **operator_documents** - Compliance documents
- **documents** - User document storage
- **audit_logs** - System activity tracking

### Key Features
✅ **Row Level Security (RLS)** on all tables  
✅ **ACID-compliant payments** with idempotency  
✅ **Auto-created profiles** on user signup  
✅ **Proper foreign keys** and relationships  
✅ **Performance indexes** for dashboards  
✅ **Audit logging** for security  

### Roles
- **Customer**: View own data, create inquiries, accept quotes
- **Operator**: View marketplace, submit quotes, manage fleet
- **Admin**: Full access to all data and operations

## 📖 Documentation

- **[README.md](docs/README.md)** - Complete database documentation
- **[deployment_guide.md](docs/deployment_guide.md)** - Deployment instructions
- **[schema_diagram.md](docs/schema_diagram.md)** - Visual schema reference

## 🔒 Security

- JWT-based authentication via Supabase Auth
- Row Level Security policies for data isolation
- Session management with ban support
- Idempotency keys for payment safety
- Complete audit trail

## 🛠️ Development

### Verify Deployment
```sql
-- Check tables (expect 12)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

### Common Queries
See [docs/README.md](docs/README.md) for common query examples.

## ⚠️ Migration from Old Schema

If you were using the old scattered SQL files:
1. Backup your data first
2. Deploy new schema
3. Migrate data if needed
4. Update application code to match new structure

---

**Version**: 2.0  
**Last Updated**: 2025-12-30
