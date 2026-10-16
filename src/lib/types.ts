export interface User {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  createdAt: number;
}

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  createdAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  /**
   * For posts created in the app this is a base64 data URI.
   * Seeded demo posts use a bundler asset id (number).
   */
  image: string | number;
  caption: string;
  createdAt: number;
}

export interface Follow {
  followerId: string;
  followingId: string;
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
