
SHOW port;
SHOW listen_addresses;
SHOW password_encryption;

SELECT
    type,
    database,
    user_name,
    address,
    auth_method
FROM pg_hba_file_rules;

SELECT
    extname,
    extversion
FROM pg_extension
ORDER BY extname;

SHOW ssl;
SHOW ssl_min_protocol_version;

SELECT
    a.pid,
    a.usename,
    a.client_addr,
    s.ssl,
    s.version,
    s.cipher
FROM pg_stat_activity AS a
JOIN pg_stat_ssl AS s
    ON a.pid = s.pid
WHERE a.pid = pg_backend_pid();
