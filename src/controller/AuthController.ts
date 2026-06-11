import type { Request, Response, NextFunction } from "express";
import { IAuthRequest } from "../types/AuthType";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfig, JwtSecret } from "../config/AppConfig";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";

import { User } from "../models/UserModel";

class UserController {
  constructor() {
    cloudinary.config(cloudinaryConfig);
  }

  getHealthCheck = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json({
        data: req.loggedInUser || null,
        message: "OK",
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };


  

  userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      const userDetail = await User.findOne({
        $or: [{ username: username }, { email: username }],
      }).select("+password");

      if (!userDetail) {
        throw { code: 422, message: "User Not registered yet" };
      }

      const isMatch = bcrypt.compareSync(password, userDetail.password!);
      if (!isMatch) {
        throw { code: 422, message: "Invalid credentials" };
      }

      const token = Jwt.sign({ sub: userDetail._id }, JwtSecret!, {
        expiresIn: "1d",
      });

      res.json({
        data: token,
        status: true,
        message: "Login Successful",
      });
    } catch (exception) {
      next(exception);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let filter: any = {};
      const { search, role, page, limit } = req.query;

      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ];
      }
      if (role) filter.role = role;

      const currentPage = page ? +page : 1;
      const pageSize = limit ? +limit : 20;
      const skip = (currentPage - 1) * pageSize;

      const data = await User.find(filter)
        .sort({ createdAt: "desc" })
        .skip(skip)
        .limit(pageSize);

      const totalCount = await User.countDocuments(filter);

      res.json({
        data,
        message: "Users fetched successfully",
        status: true,
        meta: { pagination: { page: currentPage, limit: pageSize, totalCount } },
      });
    } catch (exception) {
      next(exception);
    }
  };

  // createUser = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const data = req.body;
  //     if (req.files && (req.files as any).image) {
  //       data.image = (req.files as any).image[0].path;
  //     }

  //     // Check if user is logged in before assigning createdBy
  //     if (req.loggedInUser) {
  //       data.createdBy = (req.loggedInUser as any)._id;
  //     }

  //     // Password hashing logic (yadi frontend bata plain password aairako cha bhane)
  //     if (data.password) {
  //       data.password = bcrypt.hashSync(data.password, 10);
  //     }

  //     const newUser = new User(data);
  //     await newUser.save();

  //     res.status(201).json({
  //       data: newUser,
  //       message: "User created successfully",
  //       status: true,
  //     });
  //   } catch (exception) {
  //     next(exception);
  //   }
  // };


  createUser = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
  
      // --- SuperAdmin Restriction Logic Start ---
      if (data.role === "SuperAdmin") {
        const existingSuperAdmin = await User.findOne({ role: "SuperAdmin" });
        
        if (existingSuperAdmin) {
          throw { 
            code: 400, 
            message: "System already has a SuperAdmin. Only one SuperAdmin is allowed." 
          };
        }
      }
      // --- SuperAdmin Restriction Logic End ---
  
      // Image Handle
      if (req.files && (req.files as any).image) {
        data.image = (req.files as any).image[0].path;
      }
  
      // CreatedBy Logic
      if (req.loggedInUser) {
        data.createdBy = (req.loggedInUser as any)._id;
      }
  
      // Password hashing
      if (data.password) {
        data.password = bcrypt.hashSync(data.password, 10);
      }
  
      const newUser = new User(data);
      await newUser.save();
  
      res.status(201).json({
        data: newUser,
        message: "User created successfully",
        status: true,
      });
    } catch (exception) {
      next(exception);
    }
  };

  updateUser = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files?.image?.[0]) {
        data.image = files.image[0].path;
      }

      if (req.loggedInUser) {
        data.updatedBy = (req.loggedInUser as any)._id;
      }

      // Password update garna khojeko ho bhane hash garne
      if (data.password) {
        data.password = bcrypt.hashSync(data.password, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(id, { $set: data }, { new: true });

      if (!updatedUser) return next({ code: 404, message: "User not found" });

      res.json({ data: updatedUser, message: "User updated successfully", status: true });
    } catch (exception) {
      next(exception);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) return next({ code: 404, message: "User not found" });
      res.json({ message: "User deleted successfully", status: true });
    } catch (exception) {
      next(exception);
    }
  };
}

export default UserController;