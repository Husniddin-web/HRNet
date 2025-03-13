import { ROLE } from "@prisma/client";

export type JwtPayload = {
  id: number;
  email: string;
  role: ROLE;
};
