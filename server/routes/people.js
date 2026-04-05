import express from "express";
import logger from "../logger.js";
import { PeopleService } from "../services/PeopleService.js";

const router = express.Router();

router.get("/", (req, res) => {
  const page = parseInt(String(req.query.page || "1"), 10) || 1;
  const limit = parseInt(String(req.query.limit || "5"), 10) || 5;

  const result = PeopleService.getPeople(page, limit);

  logger.info("Getting people list", {
    page: result.page,
    limit: result.limit,
    total: result.total,
    hasMore: result.hasMore,
  });

  res.json(result);
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const person = PeopleService.getPersonById(id);

  if (!person) {
    logger.warn("Person not found", { id });
    return res.status(404).json({ error: "Person not found" });
  }

  logger.info("Getting person", { id });
  res.json(person);
});

export default router;
