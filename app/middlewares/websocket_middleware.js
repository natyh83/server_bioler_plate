// @flow
import {DecodeToken} from '../utils/jwt';
import {UserHelper} from "../helpers/user_helper";
import {UserService} from '../services';
import cookie from 'cookie';
import {TokenError} from "../errors";
import {Logger as logger} from '../utils/logger';

const AUTHORIZATION_HEADER = 'authorization';

/**
 * Websocket token middleware, works coupled with socket.io
 * @param socket
 * @param next
 * @constructor
 */
class JWTHandshakeMiddleware {
    userService: UserService;

    constructor({database}: any, userService: UserService) {
        this.userService = userService;
    }

    _decode(headers: any) {
        const cookies = headers.cookie;
        let parsedCookies = null;
        if (cookies) {
            parsedCookies = cookie.parse(cookies);
        }

        let token = '';

        if (parsedCookies && parsedCookies[process.env.JWT_COOKIE_NAME]) {
            token = cookie.parse(cookies)[process.env.JWT_COOKIE_NAME];
        } else {
            token = headers[AUTHORIZATION_HEADER];
            if (!token) {
                throw new TokenError("JWTHandshakeMiddleware._decode() token is missing");
            }

            token = token.split(';').map((obj) => {
                const keys = obj.split('=');
                const dic: Object = {};
                dic[keys[0]] = keys[1];

                if (dic[process.env.JWT_COOKIE_NAME]) {
                    return dic[process.env.JWT_COOKIE_NAME]
                }
            });

            if (typeof token !== 'string' && token.length === 0) {
                return null;
            }

            token = token[0];
        }

        const parsedToken = DecodeToken(token);
        return parsedToken;
    }

    _decodeTokenStr(tokenStr: string) {
        if (!tokenStr) {
            throw new TokenError("_decodeTokenStr(): token is missing");
        }

        if (typeof tokenStr !== 'string' && tokenStr.length === 0) {
            return null;
        }

        const parsedToken = DecodeToken(tokenStr);
        return parsedToken;
    }

    /**
     * Attach socket.io handshake
     * @param socket
     * @param next
     * @returns {Promise<void>}
     */
    async attach(socket: any, next: Function) {
        try {
            // const parsedToken = this._decode(socket.handshake.headers);

            const parsedToken = this._decode(socket.request.headers);
            if (parsedToken && parsedToken.data.userId) {
                const existingUser = await this.userService.users.findById(parsedToken.data.userId, {
                        smsVerification: 0,
                        password: 0,
                        phone: 0
                    }).lean();

                if (!existingUser) {
                    logger.error("websocket - user not found");
                    socket.disconnect(true);
                    return;
                }

                socket.user = new UserHelper({
                    userId: existingUser._id,
                    _id: existingUser._id,
                    email: existingUser.email,
                    roles: existingUser.roles,
                    displayName: existingUser.displayName,
                    title: existingUser.title,
                    accountId: existingUser.accountId,
                    imageHash: existingUser.imageHash,
                    over18: existingUser.over18,
                    managedGroups: existingUser.managedGroups,
                    whiteListGroups: existingUser.whiteListGroups,
                    blackListGroups: existingUser.blackListGroups,
                    progressStatus:existingUser.progressStatus
                });

                next(socket);
                return;
            }

            logger.warn("websocket - missing or invalid token");
            socket.disconnect(true);
        } catch (err) {
            // logger.info(err.message);
            socket.disconnect(true);
        }
    }

    /**
     * Attach socket.io handshake
     * @param socket
     * @param next
     * @returns {Promise<void>}
     */
    // async attachByQueryToken(socket: any, next: Function) {
    //     try {
    //         const parsedToken = this._decodeTokenStr(socket.handshake.query.token);
    //         if (parsedToken && parsedToken.data.userId) {
    //             const existingUser = await this.userService.users.findById(parsedToken.data.userId, {
    //                 userId: 1,
    //                 email: 1,
    //                 roles: 1,
    //                 displayName: 1,
    //                 title: 1,
    //                 accountId: 1,
    //                 imageHash: 1,
    //                 over18: 1,
    //                 managedGroups: 1,
    //                 whiteListGroups: 1,
    //                 blackListGroups: 1,
    //                 complianceLevel: 1
    //             });
    //             if (!existingUser) {
    //                 socket.disconnect(true);
    //                 return;
    //             }
    //
    //             socket.user = new UserHelper({
    //                 userId: existingUser._id,
    //                 email: existingUser.email,
    //                 roles: existingUser.roles,
    //                 displayName: existingUser.displayName,
    //                 title: existingUser.title,
    //                 accountId: existingUser.accountId,
    //                 imageHash: existingUser.imageHash,
    //                 over18: existingUser.over18,
    //                 managedGroups: existingUser.managedGroups,
    //                 whiteListGroups: existingUser.whiteListGroups,
    //                 blackListGroups: existingUser.blackListGroups
    //             });
    //
    //             next(socket);
    //             return;
    //         }
    //
    //         logger.error("websocket - missing or invalid token");
    //         socket.disconnect(true);
    //     } catch (err) {
    //         logger.error(err.message);
    //         socket.disconnect(true);
    //     }
    // }
}

export {
    JWTHandshakeMiddleware
}