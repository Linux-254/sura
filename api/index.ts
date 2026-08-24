import express from "express";
import { app } from "../dist/index.js";

// Keep an explicit Express import in this entrypoint for Vercel's framework detector.
void express;

export default app;

export const config = {
  api: {
    bodyParser: false,
  },
};

