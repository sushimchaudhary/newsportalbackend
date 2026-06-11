import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { IPhoto, PhotoFeature } from '../models/PhotoModel';
import { IAuthRequest } from '../types/AuthType';
import { cloudinaryConfig } from '../config/AppConfig';

cloudinary.config(cloudinaryConfig);

class PhotoFeatureController {
  // ─── GET ALL ────────────────────────────────────────────────────────────────
  async getPhotoFeatures(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query;
      let filter: Record<string, any> = {};

      if (query.search) {
        const searchStr = query.search as string;
        filter = {
          ...filter,
          $or: [
            { title: { $regex: searchStr, $options: 'i' } },
            { description: { $regex: searchStr, $options: 'i' } },
          ],
        };
      }

      if (query.isPublished !== undefined) {
        filter.isPublished = query.isPublished === 'true';
      }

      const currentPage = query.page ? +query.page : 1;
      const limit = query.limit ? +query.limit : 20;
      const skip = (currentPage - 1) * limit;

      const data = await PhotoFeature.find(filter)
        .populate('createdBy', ['_id', 'name', 'email', 'role', 'logo'])
        .populate('updatedBy', ['_id', 'name', 'email', 'role', 'logo'])
        .sort({ createdAt: 'desc' })
        .skip(skip)
        .limit(limit);

      const totalCount = await PhotoFeature.countDocuments(filter);

      res.json({
        data,
        message: 'Photo feature list',
        status: true,
        code: 200,
        success: true,
        total: data.length,
        meta: {
          pagination: {
            page: currentPage,
            limit,
            totalCount,
          },
        },
      });
    } catch (exception) {
      console.error(exception);
      next(exception);
    }
  }

  async getPhotoFeatureBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // १. Slug लाई सुरक्षित तरिकाले प्राप्त र डिकोड गर्ने
      const paramSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
      const decodedSlug = decodeURIComponent(paramSlug).normalize("NFC");
  
      console.log("खोज्दै गरेको स्लग:", decodedSlug);
  
      // २. डेटा खोज्ने (यदि तपाईं viewCount जस्तो केही अपडेट गर्न चाहनुहुन्छ भने findOneAndUpdate प्रयोग गर्न सक्नुहुन्छ)
      const photoFeature = await PhotoFeature.findOne({ slug: decodedSlug })
        .populate('createdBy', ['_id', 'name', 'email', 'role', 'logo'])
        .populate('updatedBy', ['_id', 'name', 'email', 'role', 'logo']);
  
      // ३. नभेटिएमा एरर दिने
      if (!photoFeature) {
        console.log("Photo feature not found for slug:", decodedSlug);
        return next({ code: 404, message: 'Photo feature not found with this slug' });
      }
  
      // ४. सफल रेस्पोन्स
      res.json({
        data: photoFeature,
        message: 'Photo feature detail',
        status: true,
        success: true,
      });
    } catch (exception) {
      next(exception);
    }
  }
  // ─── CREATE ─────────────────────────────────────────────────────────────────
  async createPhotoFeature(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const user = req.loggedInUser;

      if (!user) {
        return next({ code: 401, message: 'Unauthorized: User information missing' });
      }

      // Pull only safe scalar fields from body — never trust req.body.images
      const { title, description, isPublished, captions: rawCaptions } = req.body;

      // Normalize captions to array
      let captions: string[] = [];
      if (rawCaptions) {
        captions = Array.isArray(rawCaptions) ? rawCaptions : [rawCaptions];
      }

      // Build images array purely from uploaded files
      const images: object[] = [];
      if (files?.images?.length > 0) {
        for (let i = 0; i < files.images.length; i++) {
          const file = files.images[i];
          images.push({
            url: file.path,           // Cloudinary secure_url (multer-storage-cloudinary)
            publicId: file.filename,  // Cloudinary public_id
            thumbnail: cloudinary.url(file.filename, {
              transformation: [{ width: 600, height: 400, crop: 'fill' }],
            }),
            caption: captions[i] ?? '',
            order: i,
          });
        }
      }

      const newPhotoFeature = new PhotoFeature({
        title,
        description,
        isPublished: isPublished === true || isPublished === 'true',
        images,
        createdBy: (user as any)._id,
        updatedBy: (user as any)._id,
      });

      await newPhotoFeature.save();

      res.status(201).json({
        data: newPhotoFeature,
        message: 'Photo feature created successfully',
        status: true,
        success: true,
      });
    } catch (exception: any) {
      if (exception.code === 11000) {
        return next({
          code: 400,
          message: `Duplicate field: ${Object.keys(exception.keyValue)} already exists.`,
        });
      }
      next(exception);
    }
  }

  // ─── UPDATE (metadata + optional new images) ─────────────────────────────────
  async updatePhotoFeature(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const photoFeature = await PhotoFeature.findById(id);
      if (!photoFeature) {
        return next({ code: 404, message: 'Photo feature not found' });
      }

      // Pull only safe scalar fields — never trust req.body.images
      const { title, description, isPublished, captions: rawCaptions, imageOrder } = req.body;

      // Build $set payload from scalar fields only
      const setData: Record<string, any> = {
        updatedBy: (req.loggedInUser as any)._id,
      };
      if (title !== undefined) setData.title = title;
      if (description !== undefined) setData.description = description;
      if (isPublished !== undefined) setData.isPublished = isPublished === true || isPublished === 'true';

      // Re-order existing images if payload provided
      if (imageOrder) {
        const parsed = Array.isArray(imageOrder) ? imageOrder : JSON.parse(imageOrder);
        const orderMap: Record<string, number> = {};
        parsed.forEach((item: { id: string; order: number }) => {
          orderMap[item.id] = item.order;
        });
        photoFeature.images.forEach((img: any) => {
          if (orderMap[img._id.toString()] !== undefined) {
            img.order = orderMap[img._id.toString()];
          }
        });
        await photoFeature.save();
      }

      const updateQuery: Record<string, any> = { $set: setData };

      // Append new images if uploaded
      if (files?.images?.length > 0) {
        let captions: string[] = [];
        if (rawCaptions) {
          captions = Array.isArray(rawCaptions) ? rawCaptions : [rawCaptions];
        }
        const startOrder = photoFeature.images.length;
        const newImages = files.images.map((file, i) => ({
          url: file.path,
          publicId: file.filename,
          thumbnail: cloudinary.url(file.filename, {
            transformation: [{ width: 600, height: 400, crop: 'fill' }],
          }),
          caption: captions[i] ?? '',
          order: startOrder + i,
        }));
        updateQuery.$push = { images: { $each: newImages } };
      }

      const updatedPhotoFeature = await PhotoFeature.findByIdAndUpdate(id, updateQuery, {
        // new: true,
        returnDocument: 'after' 
      });

      res.json({
        data: updatedPhotoFeature,
        message: 'Photo feature updated successfully',
        status: true,
        success: true,
      });
    } catch (exception) {
      next(exception);
    }
  }

  // ─── DELETE SINGLE IMAGE FROM A FEATURE ─────────────────────────────────────
  async deleteImage(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { imageId } = req.body;

      const photoFeature = await PhotoFeature.findById(id);
      if (!photoFeature) {
        return next({ code: 404, message: 'Photo feature not found' });
      }

      const image = photoFeature.images.find((img: any) => img._id.toString() === imageId) as IPhoto | undefined;
      if (!image) {
        return next({ code: 404, message: 'Image not found in this feature' });
      }

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(image.publicId);

      await PhotoFeature.findByIdAndUpdate(id, {
        $pull: { images: { _id: imageId } },
        $set: { updatedBy: (req.loggedInUser as any)._id },
      });

      res.json({
        message: 'Image deleted successfully',
        status: true,
        success: true,
      });
    } catch (exception) {
      next(exception);
    }
  }

  // ─── DELETE ENTIRE FEATURE ───────────────────────────────────────────────────
  async deletePhotoFeature(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const photoFeature = await PhotoFeature.findById(id);
      if (!photoFeature) {
        return next({ code: 404, message: 'Photo feature not found' });
      }

      // Delete all images from Cloudinary
      const destroyPromises = photoFeature.images.map((img: IPhoto) =>
        cloudinary.uploader.destroy(img.publicId)
      );
      await Promise.all(destroyPromises);

      await PhotoFeature.findByIdAndDelete(id);

      res.json({
        message: 'Photo feature deleted successfully',
        status: true,
        success: true,
      });
    } catch (exception) {
      next(exception);
    }
  }
}

export default PhotoFeatureController;