-- Initial admin user: bergur / Changeme1!
-- Change this password immediately via /admin after first login.
INSERT INTO users (username, password_hash, role)
VALUES ('bergur', '$2b$12$E7mBGqvbLleW9zMNZc.ws.bkQ78s.f4aAdVZdMY.qKcncM3Rjl0p6', 'ADMIN')
ON CONFLICT (username) DO NOTHING;
