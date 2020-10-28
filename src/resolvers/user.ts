import { User } from "../entities/User";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Mycontext } from "../types";
import argon2 from "argon2";

@InputType() //typos para los paramteros
class UsernamePasswordFields {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class ErrorField {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType() //tipos para ser  retornados
class UserResponse {
  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async currentUser(@Ctx() { req, em }: Mycontext) {
    //
    if (!req.session!.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session!.userId });
    return user;
  }
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordFields,
    @Ctx() { em }: Mycontext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "The username must have 3 or more charcters",
          },
        ],
      };
    } else if (options.password.length <= 6) {
      return {
        errors: [
          {
            field: "password",
            message: "Password must have 6 or more characters ",
          },
        ],
      };
    }

    const hashed_password = await argon2.hash(options.password);

    const user = em.create(User, {
      username: options.username,
      password: hashed_password,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "This username already exist, please take other",
            },
          ],
        };
      }
    }
    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordFields,
    @Ctx() { em, req }: Mycontext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "that username doesn't exist",
          },
        ],
      };
    }

    const valid_password = await argon2.verify(user.password, options.password);
    if (!valid_password) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }

    req.session!.userId = user.id;

    return {
      user,
    };
  }
}
