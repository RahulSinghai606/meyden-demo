import { handleRouteError } from '../response';
import { Response } from 'express';
import { logger } from '../logger';

// Mock logger
jest.mock('../logger', () => ({
    logger: {
        error: jest.fn(),
    },
}));

describe('Response Utils', () => {
    describe('handleRouteError', () => {
        let res: Partial<Response>;
        let jsonMock: jest.Mock;
        let statusMock: jest.Mock;

        beforeEach(() => {
            jsonMock = jest.fn();
            statusMock = jest.fn().mockReturnValue({ json: jsonMock });
            res = {
                status: statusMock,
            };
        });

        it('should log error and send 500 response', () => {
            const error = new Error('Test error');
            handleRouteError(res as Response, error, 'TEST_ERROR');

            expect(logger.error).toHaveBeenCalledWith('Internal server error', expect.anything());
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Internal server error',
                code: 'TEST_ERROR',
            });
        });

        it('should use custom message', () => {
            const error = new Error('Test error');
            handleRouteError(res as Response, error, 'TEST_ERROR', 'Custom message');

            expect(logger.error).toHaveBeenCalledWith('Custom message', expect.anything());
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Custom message',
                code: 'TEST_ERROR',
            });
        });
    });
});
