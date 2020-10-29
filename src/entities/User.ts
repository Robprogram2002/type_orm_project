import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @UpdateDateColumn()
  updated_at: Date;

  @Field(() => String)
  @CreateDateColumn()
  created_at: Date;

  @Field(() => String)
  @Column({ unique: true })
  username!: string;

  @Field(() => String)
  @Column()
  password!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];
}
