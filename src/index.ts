import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";
import ConectRedis from "connect-redis";
import { Mycontext } from "./types";
import cors from "cors";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  // const post = orm.em.create(Post, { title: "my second post" });
  // await orm.em.persistAndFlush(post);
  const app = express();

  const RedisStore = ConectRedis(session);
  const redisClient = redis.createClient({ port: 6379 });

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //ten years
        httpOnly: true,
        secure: __prod__, // cookie only work in https
        sameSite: "lax",
      },
      secret: "lkdsasdasjdiossiajdijs",
      resave: false,
      saveUninitialized: false,
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): Mycontext => ({ em: orm.em, req, res }),
  });

  server.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("Server running on port 4000");
  });

  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
};

main().catch((err) => {
  console.error(err);
});
