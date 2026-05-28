import express from "express";
import * as healthController from "../controllers/health.controller.js";

const { Router } = express;
const router = Router();

// GET /api/health
router.get("/", healthController.check);

export default router;
