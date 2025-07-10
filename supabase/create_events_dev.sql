CREATE TABLE events_dev (
    id SERIAL PRIMARY KEY,      -- Auto-incrementing primary key
    event_title VARCHAR(255),   -- Event name
    date VARCHAR(255),          -- Event date as string, not DATE
    time_pst VARCHAR(255),      -- Event as string, not TIME PST
    location VARCHAR(255),      -- Event location
    link VARCHAR(255)           -- Link to the event
);
ALTER TABLE events_dev ENABLE ROW LEVEL SECURITY;
create policy "Allow inserts  for authenticated users"
on events_dev
for insert
with check (true);
CREATE POLICY "Allow read for everyone"
ON events_dev
FOR SELECT
USING (true);
