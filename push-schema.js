const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const sql = `
CREATE TABLE IF NOT EXISTS documents (
  id varchar(255) PRIMARY KEY,
  deal_id varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  category varchar(100),
  file_url text,
  file_size integer,
  mime_type varchar(100),
  uploaded_by varchar(36),
  created_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT documents_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES deals(id),
  CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES "user"(id)
);

CREATE TABLE IF NOT EXISTS diligence_checklist (
  id varchar(255) PRIMARY KEY,
  deal_id varchar(255) NOT NULL,
  category varchar(100) NOT NULL,
  item varchar(500) NOT NULL,
  completed boolean DEFAULT false,
  notes text,
  assigned_to varchar(36),
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT diligence_checklist_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES deals(id),
  CONSTRAINT diligence_checklist_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES "user"(id)
);
`;

pool.query(sql, (err, res) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Tables created successfully');
  pool.end();
});
