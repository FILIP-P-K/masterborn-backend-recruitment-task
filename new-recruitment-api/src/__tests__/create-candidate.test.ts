import { Application } from 'express';
import { Database } from 'sqlite';
import { setupApp } from '../app';
import { setupDb } from '../db';
import http from 'http';


describe('Create Candidate', () => {
  let server: http.Server;
  let db: Database;
  const PORT = process.env.PORT ?? 3000;
  const NEW_API_KEY = 'WTOREK';

  beforeAll(async () => {
    db = await setupDb();
    const app = await setupApp(db);

    server = app.listen(PORT, () => {
        console.log(`[server]: Test server is running at http://localhost:${PORT}`);
    });
  });

  afterAll(async () => {
    server.close();
    await db.close();
  });

  it('should create a new candidate successfully', async () => {
    const newCandidate = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '123456789',
      experienceYears: 3,
      status: 'nowy',
      consentDate: new Date().toISOString(),
    };

    const response = await fetch(`http://localhost:${PORT}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NEW_API_KEY,
      },
      body: JSON.stringify(newCandidate),
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.message).toBe('Candidate added successfully');
    expect(data.candidate?.email).toBe(newCandidate.email);
  });
});
