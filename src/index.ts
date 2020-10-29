import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
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

import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

const main = async () => {
  const conn = createConnection({
    type: "postgres",
    database: "typeorm",
    username: "postgres",
    password: "passwordSegura20",
    logging: true,
    synchronize: true,
    entities: [Post, User],
  });

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
    context: ({ req, res }): Mycontext => ({ req, res }),
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
