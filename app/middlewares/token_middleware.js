// @Flow
import {UserService} from '../services';
import {PermissionError, TokenError} from "../errors";
import {BaseController} from "../controllers/base/controller_base";
import {UserHelper} from '../helpers/user_helper';
import {jsonToQueryString} from "../utils/objects";

class TokenMiddleware {
    constructor({}, userService: UserService) {
        this.userService = userService;
    }

    /**
     * Authentication middleware
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async tokenAuthMiddleware(req: any, res: any, next: Function) {
        if (req.method === 'OPTIONS') {
            next();
            return;
        }

        const decodedToken = await BaseController.decodeToken(req);
        if (!decodedToken.userId) {
            BaseController.handleError(new TokenError('invalid token structure', null, `can't find user ID at decoded token ${decodedToken}`), res);
            return;
        }

        const existingUser = await this.userService.users.findById(decodedToken.userId).cache(120, decodedToken.userId).lean();
        if (!existingUser) {
            if (res) {
                BaseController.handleError(new TokenError('invalid token', null, `user not found, userId: ${decodedToken.userId}`), res);
            }
            return;

        }

        const userHelper = new UserHelper({
            userId: typeof(existingUser._id)=== "string"?  this.userService.db.getMongoose().Types.ObjectId (existingUser._id): existingUser._id,
            _id: typeof(existingUser._id)=== "string"?  this.userService.db.getMongoose().Types.ObjectId (existingUser._id): existingUser._id,
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
            complianceLevel: existingUser.complianceLevel,
            isTest: existingUser.isTest,
            progressStatus: existingUser.progressStatus,
            bio: existingUser.bio,
            smsVerification: existingUser.smsVerification,
        });

        req.user = userHelper;

        if (userHelper.isBlocked()) {
            BaseController.clearCookie(req, res, process.env.JWT_COOKIE_NAME);
            return BaseController.handleError(new PermissionError(`user ${userHelper.userId} is  blocked`), res);
        }

        next();
    }
}

export {
    TokenMiddleware
}

export default TokenMiddleware;