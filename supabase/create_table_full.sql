DO $$
DECLARE
    table_name text := 'events_test_full';
BEGIN
    EXECUTE format(
        'CREATE TABLE %I (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255),
            hosts_organizers VARCHAR(1023),
            presenters VARCHAR(255),
            sponsors VARCHAR(255),
            venue_name VARCHAR(255),
            address VARCHAR(255),
            city VARCHAR(255),
            summary VARCHAR(255),
            summary_keywords VARCHAR(255),
            categories_tags_host VARCHAR(255),
            time_range VARCHAR(255),
            date_range VARCHAR(255),
            date_start_iso VARCHAR(255),
            date_end_iso VARCHAR(255),
            weekday_start VARCHAR(255),
            weekday_end VARCHAR(255),
            url_in_sanitzed VARCHAR(255),
            url_out_resolved VARCHAR(255)
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
