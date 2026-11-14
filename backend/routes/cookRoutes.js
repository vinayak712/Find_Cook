import express from 'express'
import { getAllCook, saveProfile, getMyProfile, searchCooks, toogleAvailability, addReview, uploadFoodImage, removeFoodImage, uploadProfileImage, toggleFavorite, getFavorites, getCookById } from '../contorllers/cookcontroller.js'
import authorizeRoles from '../middleware/roleMiddleware.js';
const router = express.Router();
import auth from '../middleware/authMiddleware.js';
router.post("/cook-profile", auth, authorizeRoles("cook"), saveProfile);
router.get("/cook-profile/me", auth, authorizeRoles("cook"), getMyProfile);
router.get("/all-cook", auth, authorizeRoles("user"), getAllCook);
router.patch("/cook-availability", auth, authorizeRoles("cook"), toogleAvailability);
router.get("/search-cook", auth, authorizeRoles("cook", "user"), searchCooks);
router.post("/:id/review", auth, authorizeRoles("user"), addReview);
router.post("/upload-food-image", auth, authorizeRoles("cook"), uploadFoodImage);
router.delete("/remove-food-image", auth, authorizeRoles("cook"), removeFoodImage);
router.post("/upload-profile-image", auth, authorizeRoles("cook"), uploadProfileImage);
router.get("/favorites", auth, authorizeRoles("user"), getFavorites);
router.post("/favorites/:cookId", auth, authorizeRoles("user"), toggleFavorite);
router.get("/:id", auth, authorizeRoles("user"), getCookById);
export default router;