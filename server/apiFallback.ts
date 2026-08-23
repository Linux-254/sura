import type { Request, Response } from "express";

type TrpcFallbackError = {
  error: {
    json: {
      message: string;
      code: number;
      data: {
        code: "NOT_FOUND";
        httpStatus: number;
        path: string;
      };
    };
  };
};

function errorForPath(path: string): TrpcFallbackError {
  return {
    error: {
      json: {
        message: "The SURA API route is unavailable. Please retry the request.",
        code: -32004,
        data: {
          code: "NOT_FOUND",
          httpStatus: 404,
          path,
        },
      },
    },
  };
}

export function createTrpcApiFallback(pathname: string, isBatch: boolean): TrpcFallbackError | TrpcFallbackError[] {
  const procedurePath = pathname.replace(/^\/api\/trpc\/?/, "") || "unknown";
  const procedures = procedurePath.split(",").filter(Boolean);
  const payload = procedures.map(errorForPath);

  return isBatch ? payload : (payload[0] ?? errorForPath("unknown"));
}

/**
 * Keeps API paths out of the SPA HTML fallback. A valid JSON envelope gives
 * tRPC an actionable error instead of an `Unexpected token '<'` parse failure.
 */
export function apiJsonFallback(req: Request, res: Response) {
  const isBatch = req.query.batch === "1";
  res.status(404).json(createTrpcApiFallback(req.path, isBatch));
}
