# Vedanco Air Database Documentation

## Overview

This is the unified database schema for **Vedanco Air**, a private jet charter platform. The database supports multiple user roles (customers, operators, admins) with strict data isolation and security through Row Level Security (RLS).

## Architecture

### Database System
- **PostgreSQL** (via Supabase)
- **Extensions**: uuid-ossp, pg_stat_statements
- **Security**: Row Level Security (RLS) enabled on all tables
- **ACID Compliance**: Payment transactions with idempotency

### Tables (12)

1. **profiles** - Extended user information
2. **operator_applications** - Operator onboarding
3. **operators** - Active operator directory
4. **aircraft** - Operator fleet
5. **inquiries** - Customer booking requests
6. **quotes** - Operator proposals
7. **bookings** - Confirmed reservations
8. **orders** - Purchase records
9. **transactions** - Payment tracking
10. **documents** - User document storage
11. **operator_documents** - Operator compliance docs
12. **audit_logs** - System activity tracking

## Table Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (1:1) ← Extended user data
    ↓
    ├→ operators (via email/user_id)
    │     ↓
    │     ├→ aircraft (1:many)
    │     ├→ operator_documents (1:many)
    │     └→ operator_applications (1:1)
    │
    ├→ inquiries (1:many)
    │     ↓
    │     └→ quotes (1:many)
    │           ↓
    │           ├→ bookings (1:1)
    │           │     ↓
    │           │     └→ orders (1:1)
    │           └→ transactions (1:many)
    │
    └→ documents (1:many)
```

## Role-Based Access Control (RBAC)

### Customer Role
- ✅ View/create own inquiries
- ✅ View quotes for their inquiries
- ✅ Create bookings from accepted quotes
- ✅ View own bookings, orders, transactions
- ❌ Cannot see other customers' data
- ❌ Cannot access operator functions

### Operator Role
- ✅ View all marketplace inquiries
- ✅ Create quotes for any inquiry
- ✅ View/manage own quotes
- ✅ View/update assigned bookings
- ✅ Manage own aircraft fleet
- ✅ Manage own compliance documents
- ❌ Cannot see other operators' data
- ❌ Cannot approve applications

### Admin Role
- ✅ View all data across the platform
- ✅ Approve/reject operator applications
- ✅ Update user profiles
- ✅ Manage operators (suspend/activate)
- ✅ View audit logs
- ✅ Full access to all tables

## Key Features

### 1. ACID-Compliant Payments
- **Idempotency Keys**: Prevent duplicate charges
- **Row-Level Locking**: Prevent race conditions
- **State Machine**: not_started → processing → succeeded/failed
- **Functions**: `atomic_payment_init()`, `finalize_payment()`

### 2. Automatic Triggers
- **Auto-create profile** on user signup
- **Update timestamps** on record changes
- **Aircraft count** auto-updates for operators

### 3. Performance Optimization
- Indexes on foreign keys
- Composite indexes for dashboards
- Partial indexes for active records

### 4. Security Features
- Session management with ban support
- Authentication event logging
- Audit trail for all critical actions

## File Structure

```
database/
├── schema/
│   └── 00_master_schema.sql       # Complete unified schema
├── functions/
│   ├── auth_functions.sql         # Authentication helpers
│   ├── payment_functions.sql      # Payment processing
│   └── operator_functions.sql     # Operator utilities
├── migrations/
│   └── 01_initial_deployment.sql  # Deployment file
├── seed/
│   └── seed_data.sql              # Test data
└── docs/
    ├── README.md                  # This file
    ├── schema_diagram.md          # Visual reference
    └── deployment_guide.md        # How to deploy
```

## Common Queries

### Get Customer Inquiries
```sql
SELECT * FROM inquiries 
WHERE customer_id = auth.uid()
ORDER BY created_at DESC;
```

### Get Operator Marketplace
```sql
SELECT i.*, 
  (SELECT COUNT(*) FROM quotes WHERE inquiry_id = i.id) as quote_count
FROM inquiries i
WHERE i.status IN ('New', 'Open', 'Quoted')
ORDER BY i.created_at DESC;
```

### Get Operator Aircraft
```sql
SELECT a.* FROM aircraft a
JOIN operators o ON o.id = a.operator_id
JOIN profiles p ON p.email = o.email
WHERE p.id = auth.uid();
```

### Check Payment Status
```sql
SELECT t.*, b.booking_reference, b.payment_status
FROM transactions t
JOIN bookings b ON b.quote_id = t.quote_id
WHERE t.user_id = auth.uid()
ORDER BY t.created_at DESC;
```

## Helper Functions

### Authentication
- `revoke_user_sessions(user_id)` - Ban user and clear sessions
- `is_session_valid(user_id)` - Check if user is banned
- `unban_user(user_id)` - Remove ban
- `log_auth_event(type, user_id, success, metadata)` - Audit logging

### Payments
- `atomic_payment_init(quote_id, user_id, idempotency_key, amount, currency)` - Start payment
- `finalize_payment(transaction_id, status, gateway_ref)` - Complete payment
- `check_and_lock_booking_for_payment(quote_id)` - Lock check

### Operators
- `approve_operator_application(app_id, approved_by)` - Approve operator
- `reject_operator_application(app_id, reason, rejected_by)` - Reject operator
- `get_operator_id_from_user(user_id)` - Find operator record

## Maintenance

### Backup
Regular backups are handled by Supabase automatically.

### Monitoring
- Check `audit_logs` for suspicious activity
- Monitor `transactions` for failed payments
- Review `operator_documents` for expiring certificates

### Updates
Schema updates should be done via migration files in `database/migrations/`.

## Support

For questions or issues with the database schema:
1. Check the deployment guide
2. Review RLS policies for access issues
3. Check audit logs for debugging
4. Contact the development team

---

**Version**: 2.0  
**Last Updated**: 2025-12-30  
**Maintained by**: Vedanco Air Development Team
