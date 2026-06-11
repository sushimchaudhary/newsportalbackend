import { Router } from 'express';
import authCheck from '../middlewares/Auth';
import Uploader from '../middlewares/Uploader';
import bodyValidator from '../middlewares/BodyValidatorMiddleware';
import {
  CreatePhotoFeatureSchema,
  UpdatePhotoFeatureSchema,
  DeleteImageSchema,
} from '../validation-schema/PhotofeatureValidation';
import PhotoFeatureController from '../controller/PhotofeatureController';

const photoFeatureRouter = Router();
const photoFeatureCtrl = new PhotoFeatureController();

// ─── Public ──────────────────────────────────────────────────────────────────
photoFeatureRouter.get('/', photoFeatureCtrl.getPhotoFeatures);
// PhotoFeatureRouter.ts मा स्पष्ट नाम दिनुहोस्
photoFeatureRouter.get('/:slug', photoFeatureCtrl.getPhotoFeatureBySlug);
// ─── Protected ───────────────────────────────────────────────────────────────

// Create — with multiple image upload (field name: "images")
photoFeatureRouter.post(
  '/',
  authCheck(),                              // editor / superadmin check inside authCheck or a separate role guard
  Uploader().fields([{ name: 'images', maxCount: 20 }]),
  bodyValidator(CreatePhotoFeatureSchema as any),
  photoFeatureCtrl.createPhotoFeature
);

// Update metadata + optionally append more images
photoFeatureRouter.put(
  '/:id',
  authCheck(),
  Uploader().fields([{ name: 'images', maxCount: 20 }]),
  bodyValidator(UpdatePhotoFeatureSchema as any),
  photoFeatureCtrl.updatePhotoFeature
);

// Delete a single image inside a feature
photoFeatureRouter.delete(
  '/:id/image',
  authCheck(),
  bodyValidator(DeleteImageSchema as any),
  photoFeatureCtrl.deleteImage
);

// Delete entire photo feature (+ all Cloudinary images)
photoFeatureRouter.delete('/:id', authCheck(), photoFeatureCtrl.deletePhotoFeature);

export default photoFeatureRouter;