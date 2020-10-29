import { Response, Request } from "express";

export type Mycontext = {
  req: Request;
  res: Response;
};
