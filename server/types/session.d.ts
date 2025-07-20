import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: number;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
      roleId: number;
    };
  }
}