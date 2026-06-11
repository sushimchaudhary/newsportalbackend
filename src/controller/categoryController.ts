import { Request, Response, NextFunction } from "express";
import { Category } from "../models/categoryModel";
import { IAuthRequest } from "../types/AuthType";

class CategoryController {
    
   
    async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let filter: any = {};
            const query = req.query;
    
            if (query.search) {
                const searchStr = query.search as string;
                filter.name = { $regex: searchStr, $options: 'i' };
            }
    
            if (query.parentId) {
                filter.parentId = query.parentId;
            } else if (query.parentId === 'null') {
                filter.parentId = null;
            }
          
    
            const currentPage = query.page ? +query.page : 1;
            const limit = query.limit ? +query.limit : 50;
            const skip = (currentPage - 1) * limit;
    
            const data = await Category.find(filter)
                .populate('createdBy', ['_id', 'name', 'email'])
                .populate('updatedBy', ['_id', 'name', 'email'])
                .populate('parentId', 'name') 
                .sort({ name: "asc" })
                .skip(skip)
                .limit(limit);
    
            const totalCount = await Category.countDocuments(filter);
    
            res.json({
                data,
                message: "Category list fetched successfully",
                status: true,
                meta: {
                    pagination: {
                        page: currentPage,
                        limit: limit,
                        totalCount: totalCount
                    }
                }
            });
        } catch (exception) {
            next(exception);
        }
    }

    
    async createCategory(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = { ...req.body };
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const user = req.loggedInUser;

            if (!user) {
                return next({ code: 401, message: "Unauthorized" });
            }

            if (files && files.image && files.image[0]) {
                data.image = files.image[0].path;
            }
            if (data.status) {
                data.is_active = data.status === "active";
                delete data.status; 
            }

            data.createdBy = (user as any)._id;
            data.updatedBy = (user as any)._id;

            const newCategory = new Category(data);
            await newCategory.save();

            res.status(201).json({
                data: newCategory,
                message: "Category created successfully",
                status: true
            });
        } catch (exception: any) {
            if (exception.code === 11000) {
                return next({ code: 400, message: "Category name already exists" });
            }
            next(exception);
        }
    }

   
    async updateCategory(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const category = await Category.findById(id);
            if (!category) {
                return next({ code: 404, message: "Category not found" });
            }

            if (files && files.image && files.image[0]) {
                data.image = files.image[0].path;
            }

            if (data.status) {
                data.is_active = data.status === "active";
                delete data.status; 
            }

            data.updatedBy = (req.loggedInUser as any)._id;

            const updatedCategory = await Category.findByIdAndUpdate(id, { $set: data }, { new: true });

            res.json({
                data: updatedCategory,
                message: "Category updated successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }

  
    async deleteCategory(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await Category.findByIdAndDelete(id);

            if (!deleted) {
                return next({ code: 404, message: "Category not found" });
            }

            res.json({
                message: "Category deleted successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }
}

export default CategoryController;