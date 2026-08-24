import express from "express";
import { createApp } from "../server/_core/index";

// Keep an explicit Express import in this entrypoint for Vercel's framework detector.
void express;

const app = createApp();

export default app;

export const config = {
  api: {
    bodyParser: false,
  },
};

