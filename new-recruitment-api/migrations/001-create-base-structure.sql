CREATE TABLE Recruiter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    company TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE JobOffer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    salary_range TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Candidate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    experienceYears INTEGER NOT NULL,
    notes TEXT,
    status TEXT NOT NULL,
    recruiter_id INTEGER,
    job_offer_id INTEGER NOT NULL,
    consentDate DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);