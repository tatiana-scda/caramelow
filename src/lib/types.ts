export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  createdAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  image: string;
  caption: string;
  createdAt: number;
}

export interface FeedPost {
  post: Post;
  author: PublicUser;
}

export interface UserStats {
  posts: number;
  followers: number;
  following: number;
}
