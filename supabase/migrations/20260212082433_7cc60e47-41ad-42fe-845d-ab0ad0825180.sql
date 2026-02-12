-- Revoke broad anon SELECT grant on all public tables
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;