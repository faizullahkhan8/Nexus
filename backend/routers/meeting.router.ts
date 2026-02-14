import { Router } from "express";
import { protect } from "../middlewares/Auth";
import {
    getMyMeetings,
    rescheduleMeeting,
    scheduleMeeting,
    updateMeetingStatus,
} from "../controllers/meeting.controller";

const router = Router();

router.post("/schedule", protect, scheduleMeeting);
router.get("/my-meetings", protect, getMyMeetings);
router.put("/status", protect, updateMeetingStatus);
router.put("/reschedule", protect, rescheduleMeeting);

export default router;
