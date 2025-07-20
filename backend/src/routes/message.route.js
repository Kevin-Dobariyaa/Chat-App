import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUserForSidebar, sendMessage, updateMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users",protectRoute, getUserForSidebar);
router.get("/:id",protectRoute,getMessages);

router.post("/send/:id",protectRoute,sendMessage);  
router.put("/update/:id",protectRoute,updateMessage); // Assuming you want to update the message with the same sendMessage function

export default router;
