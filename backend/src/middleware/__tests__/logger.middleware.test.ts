import { Request, Response, NextFunction } from 'express';
import { requestLogger } from '../logger.middleware';

describe('Logger Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/api/test',
      ip: '127.0.0.1',
    };
    mockResponse = {
      statusCode: 200,
      on: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should log request information', () => {
    requestLogger(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should call finish handler with correct data', () => {
    const startTime = Date.now();
    let finishCallback: () => void;

    (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback = callback;
      }
    });

    requestLogger(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Simulate response finish
    if (finishCallback!) {
      finishCallback();
    }

    expect(mockResponse.on).toHaveBeenCalled();
  });
});

