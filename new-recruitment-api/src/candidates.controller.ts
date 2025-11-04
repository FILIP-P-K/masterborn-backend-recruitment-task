import { Request, Response, NextFunction, Router } from 'express';
import { Database } from 'sqlite';

export class CandidatesController {
    readonly router = Router();

    readonly LEGACY_API_KEY = '0194ec39-4437-7c7f-b720-7cd7b2c8d7f4';
    readonly NEW_API_KEY = 'WTOREK';

    constructor(private db: Database) {
        this.router.get('/candidates', this.verifyApiKey.bind(this), this.getAll.bind(this));
        this.router.post('/candidates', this.verifyApiKey.bind(this), this.create.bind(this));
        this.router.get('/', this.main.bind(this));
    }

    main(req: Request, res: Response) {
        res.send('New Recruitment API');
    }

    verifyApiKey(req: Request, res: Response, next: NextFunction) {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey || apiKey !== this.NEW_API_KEY) {
            return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
        }

        next();
    };

    async getAll(req: Request, res: Response) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const candidates = await this.db.all(
            'SELECT * FROM Candidate LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const total = (await this.db.get('SELECT COUNT(*) as count FROM Candidate')).count;

        res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            candidates,
        });
    }

    async create(req: Request, res: Response) {
        console.log('halo', req.body)
        if (!req.body) {
            res.status(400).json({ message: 'No request body'});
            return;
        }

        const validationErrors = this.validateCandidate(req.body);

        if (validationErrors.length > 0) {
            res.status(400).json({ message: 'Validation failed', errors: validationErrors});
            return;
        }

        const { firstName, lastName, email, phone, experienceYears, notes, status, jobOfferId, consentDate} = req.body;

        const respond = await this.db.run(`INSERT OR IGNORE INTO Candidate 
            (
                firstName,
                lastName,
                email,
                phone,
                experienceYears,
                notes,
                status,
                job_offer_id,
                consentDate
            ) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [firstName, lastName, email, phone, experienceYears, notes, status, jobOfferId, consentDate]
        );

        if (respond.changes === 0) {
            res.status(409).json({message: 'Candidate with this email already exists.'});
            return;
        }
    
        const errors = []
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response = await fetch('http://legacy:4000/candidates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.LEGACY_API_KEY,
                    },
                    body: JSON.stringify({
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                    }),
                });

                res.status(201).json({
                    message: 'Candidate added successfully',
                    candidate: {
                        firstName: firstName, 
                        lastName: lastName,
                        email: email,
                        phone: phone,
                        experienceYears: experienceYears,
                        notes: notes,
                        status: status,
                        jobOfferId: jobOfferId,
                        consentDate: consentDate
                    },
                    legacy: {
                        status: response.status,
                        attemp: attempt,
                        message: (await response.json()).message
                    }
                });

            } catch (err) {
                errors.push(err)
            }

            if (attempt < 3) {
                await new Promise((res) => setTimeout(res, 1000)); // wait until next try
            }
        }

        res.status(201).json({
            message: 'Candidate added successfully', 
            candidate: {
                firstName: firstName, 
                lastName: lastName,
                email: email,
                phone: phone,
                experienceYears: experienceYears,
                notes: notes,
                status: status,
                jobOfferId: jobOfferId,
                consentDate: consentDate
            },
            legacy: {
                status: 504,
                attemp: 3,
                messages: errors
            }
        });
    }

    validateCandidate(candidate: any) {
        const errors = [];

        if (!candidate.firstName) {
            errors.push('First name is required');
        }

        if (!candidate.lastName) {
            errors.push('Last name is required');
        }

        if (!candidate.email) {
            errors.push('Email is required');
        }
        
        if (!/\S+@\S+\.\S+/.test(candidate.email)) {
            errors.push('Invalid email format');
        }

        if (!candidate.phone) {
            errors.push('Phone is required');
        }

        if (candidate.experienceYears !== undefined && candidate.experienceYears !== null) {
            errors.push('experienceYears is required');
        }

        if (!candidate.status) {
            errors.push('status is required');
        }

        if (candidate.jobOfferId !== undefined && candidate.jobOfferId !== null) {
            errors.push('jobOfferId is required');
        }

        if (!candidate.consentDate) {
            errors.push('consentDate is required');
        }

        return errors;
    };
}
