DO $$
DECLARE
    table_name text := 'events_dev_test';
BEGIN
    EXECUTE format('DELETE FROM %I;', table_name);
    EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY;', table_name);
END $$;