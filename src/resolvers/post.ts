import { Post } from "../entities/Post";
import { Mycontext } from "../types";
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";
import { UserInputError } from "apollo-server-express";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: Mycontext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  getPost(
    @Arg("id", () => Int)
    id: number,
    @Ctx() { em }: Mycontext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: Mycontext
  ): Promise<Post> {
    const post = em.create(Post, { title: title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: Mycontext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });

    if (!post) {
      throw new UserInputError("Not post found");
    }

    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }

    return post;
  }

  @Mutation(() => String)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: Mycontext
  ): Promise<String> {
    await em.nativeDelete(Post, { id });
    return `The post with id ${id} has been deleted`;
  }
}
