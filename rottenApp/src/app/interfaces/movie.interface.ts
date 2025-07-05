// src/app/interfaces/movie.interface.ts
export interface Movie {
  _id: string; // Assuming your backend uses _id for the movie's unique identifier
  tmdbId: number;
  title: string;
  posterUrl: string;
  releaseDate: string;
  description: string;
  categories: string[];
  cast: string[];
  director: string;
  averageUserRating: number;
  averageCriticRating: number;
  // Add other properties if your movie object has them
}

export interface Comment {
  _id: string;
  content: string;
  rating: number;
  movieId: string;
  userId: {
    _id: string;
    username: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserMovieStatus {
  _id: string; // The movie's _id
  tmdbId: number;
  title: string;
  posterUrl: string;
  // Add any other movie properties you get in watchlist/seenlist responses if needed
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  // Add other user properties
}
