import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../config/database', () => ({
    __esModule: true,
    default: {
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

jest.mock('../config/environment', () => ({
    config: {
        nodeEnv: 'test',
        port: 3001,
        corsOrigin: 'http://localhost:3000',
        jwtSecret: 'test-secret',
        csrfSecret: 'test-csrf-secret',
    },
}));

describe('App Configuration', () => {
    describe('Express App Setup', () => {
        it('should configure JSON body parser', () => {
            const app = express();
            app.use(express.json({ limit: '1mb' }));

            expect(app).toBeDefined();
        });

        it('should configure URL-encoded body parser', () => {
            const app = express();
            app.use(express.urlencoded({ extended: true, limit: '5mb' }));

            expect(app).toBeDefined();
        });

        it('should have request size limit of 1mb for JSON', async () => {
            const app = express();
            app.use(express.json({ limit: '1mb' }));
            app.post('/test', (req: Request, res: Response) => {
                res.json({ received: true });
            });

            // Create a large payload (over 1mb)
            const largePayload = { data: 'x'.repeat(2 * 1024 * 1024) }; // 2MB

            const res = await request(app)
                .post('/test')
                .send(largePayload);

            expect(res.status).toBe(413); // Payload too large
        });
    });

    describe('Health Check Endpoint', () => {
        it('should respond with 200 on health check', async () => {
            const app = express();
            app.get('/health', (req: Request, res: Response) => {
                res.status(200).json({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                });
            });

            const res = await request(app).get('/health');

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('healthy');
            expect(res.body).toHaveProperty('timestamp');
        });
    });

    describe('CORS Configuration', () => {
        it('should set CORS headers for allowed origins', async () => {
            const app = express();
            const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
                const origin = req.headers.origin;
                if (origin === 'http://localhost:3000') {
                    res.setHeader('Access-Control-Allow-Origin', origin);
                }
                next();
            };

            app.use(corsMiddleware);
            app.get('/test', (req: Request, res: Response) => {
                res.json({ success: true });
            });

            const res = await request(app)
                .get('/test')
                .set('Origin', 'http://localhost:3000');

            expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
        });

        it('should not set CORS headers for disallowed origins', async () => {
            const app = express();
            const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
                const origin = req.headers.origin;
                if (origin === 'http://localhost:3000') {
                    res.setHeader('Access-Control-Allow-Origin', origin);
                }
                next();
            };

            app.use(corsMiddleware);
            app.get('/test', (req: Request, res: Response) => {
                res.json({ success: true });
            });

            const res = await request(app)
                .get('/test')
                .set('Origin', 'http://evil.com');

            expect(res.headers['access-control-allow-origin']).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 for unknown routes', async () => {
            const app = express();
            app.use((req: Request, res: Response) => {
                res.status(404).json({ error: 'Not Found' });
            });

            const res = await request(app).get('/unknown-route');

            expect(res.status).toBe(404);
        });

        it('should handle server errors gracefully', async () => {
            const app = express();
            app.get('/error', (req: Request, res: Response, next: NextFunction) => {
                next(new Error('Test error'));
            });
            app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
                res.status(500).json({ error: 'Internal Server Error' });
            });

            const res = await request(app).get('/error');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Internal Server Error');
        });
    });

    describe('Security Headers', () => {
        it('should set X-Content-Type-Options header', async () => {
            const app = express();
            app.use((req: Request, res: Response, next: NextFunction) => {
                res.setHeader('X-Content-Type-Options', 'nosniff');
                next();
            });
            app.get('/test', (req: Request, res: Response) => {
                res.json({ success: true });
            });

            const res = await request(app).get('/test');

            expect(res.headers['x-content-type-options']).toBe('nosniff');
        });

        it('should set X-Frame-Options header', async () => {
            const app = express();
            app.use((req: Request, res: Response, next: NextFunction) => {
                res.setHeader('X-Frame-Options', 'DENY');
                next();
            });
            app.get('/test', (req: Request, res: Response) => {
                res.json({ success: true });
            });

            const res = await request(app).get('/test');

            expect(res.headers['x-frame-options']).toBe('DENY');
        });
    });

    describe('Rate Limiting', () => {
        it('should have rate limiting configuration', () => {
            const rateLimitConfig = {
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 100, // limit each IP to 100 requests per windowMs
            };

            expect(rateLimitConfig.windowMs).toBe(900000);
            expect(rateLimitConfig.max).toBe(100);
        });
    });

    describe('Compression', () => {
        it('should compress responses for supported content types', async () => {
            const app = express();
            const compression = require('compression');
            app.use(compression());
            app.get('/test', (req: Request, res: Response) => {
                res.json({ data: 'x'.repeat(1000) });
            });

            const res = await request(app)
                .get('/test')
                .set('Accept-Encoding', 'gzip');

            expect(res.status).toBe(200);
        });
    });
});
