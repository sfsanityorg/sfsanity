DO $$
DECLARE
    table_name text := 'events_test_simple';
BEGIN
    EXECUTE format(
        'CREATE TABLE %I (
            id SERIAL PRIMARY KEY,
            event_title VARCHAR(255),
            date VARCHAR(1023),
            time_pst VARCHAR(255),
            location VARCHAR(255),
            link VARCHAR(255)
        );
        ALTER TABLE %I ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow inserts  for authenticated users"
            ON %I
            FOR INSERT
            WITH CHECK (true);
        CREATE POLICY "Allow read for everyone"
            ON %I
            FOR SELECT
            USING (true);',
        table_name, table_name, table_name, table_name
    );
END $$;
