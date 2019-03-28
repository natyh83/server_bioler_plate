// @flow
import {Logger as logger} from '../utils/logger';

/**
 * Custom swagger error handler
 * author: V.K
 * @param err
 * @param req
 * @param res
 * @param next
 * @constructor
 */
const SwaggerErrorMiddleware = (err: any, req: any, res: any, next: Function) => {
    try {
        if (err) {
            logger.error(`${err}, stack: ${err.stack},  ${JSON.stringify(err, null, 2)}`);
            const readableError = reparseSwaggerError(err.errors || []);
            res.status(400).json({code: 400, errors: readableError[0] || readableError});
        } else {
            next();
        }
    } catch (err) {
        res.status(400).json({code: 400, error: 'failed to parse swagger error'});
    }
};

/**
 * Swagger error parser
 * @param errors
 * @returns {any[]}
 */
const reparseSwaggerError = (errors: Array<any>) => {
    const rErrors = errors.map((err) => {
        const innerErrors: any = err.errors || [];

        if(innerErrors.length > 0) {
            return innerErrors.map(e => {
                return {
                    type: e.code,
                    param: e.path.join(' ')
                }
            });
        } else {
            return [{
                type: err.code,
                param: err.path.join(' ')
            }]
        }
    });

    return rErrors;
};


export {
    SwaggerErrorMiddleware
}
