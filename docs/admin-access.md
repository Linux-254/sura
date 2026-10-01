# SURA admin access

SURA uses **Supabase Auth plus a database role**, not a secret password embedded in the client and not URL obscurity as the security boundary.

## Owner access path

1. Create or sign in to the owner account through the normal SURA Auth flow.
2. In the Supabase SQL editor for the SURA project, find the owner profile ID:

```sql
select id, email
from auth.users
where email = 'owner@example.com'
limit 1;
```

3. Grant the admin role using the returned UUID. Replace both placeholders before running:

```sql
insert into public.profile_roles (profile_id, role, granted_by)
values (
  'OWNER_PROFILE_UUID',
  'admin'::public.sura_role,
  'OWNER_PROFILE_UUID'
)
on conflict (profile_id, role) do nothing;
```

4. Open the private route:

```text
https://sura-cy-tech.vercel.app/#admin
```

The same route can be used locally at `http://localhost:3000/#admin`.

## Security model

- The Operations button appears in the private dashboard only when the loaded profile has the `admin` role.
- The `#admin` route is only a navigation hint. It is **not** the authorization boundary.
- `GET /api/v1/admin/overview` checks the authenticated Supabase bearer token and the `admin` role server-side.
- `PATCH /api/v1/admin/businesses/:businessId` accepts `admin` or `moderator` roles and only allows the controlled statuses `pending_review`, `verified`, and `rejected`.
- A signed-in non-admin receives a restricted-area state and a server-side `403` for admin API requests.

## Current operations surface

- Profile count
- Pending studio count
- Verified studio count
- Order count
- Receipt count
- Pending business review queue
- Approve or reject a pending studio

Never put an admin password, service-role key, or permanent bypass token in the browser bundle, Vercel public environment variables, or source code.
