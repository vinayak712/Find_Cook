import express from 'express'
import { getAllCook, saveProfile, getMyProfile, searchCooks, toogleAvailability } from '../contorllers/cookcontroller'
import authorizeRoles from '../middleware/roleMiddleware';
const router = express.Router();
import { auth } from '../middleware/authMiddleware';
router.post("/cook-profile", auth, authorizeRoles("cook"), saveProfile);
router.get("/cook-profile/me", auth, authorizeRoles("cook"), getMyProfile);
router.get("/all-cook", auth, authorizeRoles("user"), getAllCook);
router.patch("/cook-availability", auth, authorizeRoles("cook"), toogleAvailability);
router.get("search-cook", auth, authorizeRoles("cook"), searchCooks);
export default router;