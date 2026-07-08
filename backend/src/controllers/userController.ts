import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { ApiError } from "../middleware/errorHandler";

// Stellar public keys (G...) are 56 chars, base32.
const walletSchema = z.object({
  walletAddress: z.string().regex(/^G[A-Z2-7]{55}$/, "Not a valid Stellar public key"),
});

export async function updateWallet(req: Request, res: Response) {
  const { walletAddress } = walletSchema.parse(req.body);

  const user = await User.findByIdAndUpdate(
    req.auth!.userId,
    { walletAddress },
    { new: true }
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
    },
  });
}
