DO $$
DECLARE
    table_name text := 'events_dev_test';
BEGIN
    EXECUTE format(
        'CREATE TABLE %I (
            id SERIAL PRIMARY KEY,
            event_title VARCHAR(255),
            event_description VARCHAR(1023),
            event_host VARCHAR(255),
            event_organizer VARCHAR(255),
            event_keywords VARCHAR(255),
            date_display VARCHAR(255),
            date_iso VARCHAR(255),
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
