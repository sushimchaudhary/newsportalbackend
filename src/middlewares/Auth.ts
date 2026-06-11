import type { Response, NextFunction } from "express";
import Jwt, { JwtPayload } from "jsonwebtoken";
import { JwtSecret } from "../config/AppConfig";
import { User, UserRole } from "../models/UserModel";
import { IAuthRequest } from "../types/AuthType";

interface CustomJwtPayload extends JwtPayload {
  id?: string;
  sub?: string;
}

const Auth = (allowedRole: string[] | null = null) => {
  return async (req: IAuthRequest, res: Response, next: NextFunction) => {
    console.log("\n--- [DEBUG] AUTH MIDDLEWARE STARTED ---");
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        console.log("!!! Failed at Token Check");
        return next({ code: 401, message: "Unauthorized: Token missing or invalid" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = Jwt.verify(token, JwtSecret) as CustomJwtPayload;
      const userId = decoded.sub || decoded.id;
      console.log("2. Decoded UserId:", userId);

      const userDetail = await User.findById(userId);
      if (!userDetail) {
        console.log("!!! Failed: User not found in DB");
        return next({ code: 401, message: "User not found or deactivated" });
      }

      console.log("3. DB User Role:", userDetail.role);
      console.log("4. Allowed Roles for this route:", allowedRole);

      // 1. User detail attach garne (Sabai bhanda mathi)
      req.loggedInUser = {
        _id: userDetail._id as any,
        username: userDetail.username,
        fullName: userDetail.fullName,
        email: userDetail.email,
        contact: userDetail.contact,
        role: userDetail.role,
        image: userDetail.image,
        address: userDetail.address,
      };

      // 2. DEBUGGING: Terminal ma k print hunchha hernus
      const dbRole = String(userDetail.role).toLowerCase();
      const superAdminRole = String(UserRole.SUPER_ADMIN).toLowerCase();

      if (dbRole === superAdminRole) {
        console.log(">>> SUCCESS: SuperAdmin Detected. Bypassing...");
        return next();
      }
      console.log("5. Allowed Roles Check Passed");
      // 4. Allowed Roles Check
      if (allowedRole && allowedRole.length > 0) {
        // Frontend ya Router bata aune allowed roles lai pani check garne
        const hasPermission = allowedRole.some(
          role => role.toLowerCase() === userDetail.role.toLowerCase()
        );
        console.log("6. Has Permission:", hasPermission);
        if (!hasPermission) {
          console.log("!!! Failed: Insufficient Permissions");
          return next({
            code: 403,
            message: "Access denied: insufficient permissions",
          });
        }
      }

      console.log("7. All Checks Passed. Access Granted");
      next();
    } catch (error: any) {
      console.log("!!! Error in Auth Middleware:", error.message);
      return next({ code: 401, message: error.name === "TokenExpiredError" ? "Token expired" : "Invalid token" });
    }
  };
};

export default Auth;