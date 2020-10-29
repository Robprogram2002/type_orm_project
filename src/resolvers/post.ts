import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Arg,
  Int,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { UserInputError } from "apollo-server-express";
import { Mycontext } from "src/types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  @UseMiddleware(isAuth)
  async posts(): Promise<Post[]> {
    const posts = await Post.find();
    return posts;
  }

  @Query(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async getPost(
    @Arg("id", () => Int)
    id: number
  ): Promise<Post | undefined> {
    const post = await Post.findOne({ where: { id } });
    return post;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input")
    input: PostInput,
    @Ctx() { req }: Mycontext
  ): Promise<Post> {
    const createPost = await Post.create({
      ...input,
      creatorId: req.session?.userId,
    }).save();
    return createPost;
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      throw new UserInputError("Not post found");
    }

    if (typeof title !== "undefined") {
      // post.title = title;
      // await post.save();
      await Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async deletePost(@Arg("id", () => Int) id: number): Promise<String> {
    await Post.delete(id);
    return `The post with id ${id} has been deleted`;
  }
}
