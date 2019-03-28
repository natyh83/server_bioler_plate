// @Flow
import {BaseController} from "../controllers/base/controller_base";
import {Logger as logger} from '../utils/logger';
import {isValidObjectId} from "../utils/mongoose";

class ReferrerMiddleware {
    constructor() {
        logger.info("Initiating referrer middleware...");
    }

    /**
     * Authentication middleware
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async referrerMiddleware(req: any, res: any, next: Function) {
        try {
            if (req.method === 'OPTIONS') {
                next();
                return;
            }

            // let refPost = req.query.refPost;
            let assetUrl = req.query.referrer;
            //logger.debug("referrer " + refUser + " to post " + refPost);
            //check if request contains referrer param and set cookie
            const cookieValue = BaseController.getCookie(req, "referrer");
            if (assetUrl) {
                assetUrl = assetUrl.trim();
                const shortlinkService = global["shortlinkService"];
                const shortLinkDoc = await shortlinkService.getAssetByPath(assetUrl);
                if(!shortLinkDoc){
                    logger.error(`referrerMiddleware(): shortlink not found for assetUrl: ${assetUrl}`);
                    next();
                }

                let cookieData = {};
                if (cookieValue) {
                    cookieData = JSON.parse(cookieValue);
                }

                cookieData[shortLinkDoc.assetRef] = shortLinkDoc.userRef;

                logger.info("setting referrer cookie= " + JSON.stringify(cookieData));
                const cookieExpiry = Math.floor(Date.now() / 1000) + parseInt(process.env.REFERRER_COOKIE_EXPIRATION);
                BaseController.setCookie(req, res, "referrer", JSON.stringify(cookieData), cookieExpiry);
            }
            next();
        } catch (err) {
            throw err;
        }
    }
}

export {
    ReferrerMiddleware
}

export default ReferrerMiddleware;