import { IUser } from "./AuthType";



declare global {
    namespace Express {
        interface Request {
            loggedInUser?: IUser;
        }
    }
}