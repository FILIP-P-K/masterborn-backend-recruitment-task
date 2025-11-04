import express from "express";
import { Database } from "sqlite";
import { CandidatesController } from "./candidates.controller";

export const setupApp = async (db: Database) => {
    const app = express();

    app.use(express.json());

    app.use(new CandidatesController(db).router);

    return app;
}
