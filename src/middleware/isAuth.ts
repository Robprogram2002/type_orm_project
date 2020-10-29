import { AuthenticationError } from "apollo-server-express";
import { Mycontext } from "src/types";
import { MiddlewareFn } from "type-graphql/dist/interfaces/Middleware";

export const isAuth: MiddlewareFn<Mycontext> = ({ context }, next) => {
  if (!context.req.session?.userId) {
    throw new AuthenticationError("Not authenticated");
  }

  return next();
};
