import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({ email: z.string().trim().toLowerCase().email() });
const genericMessage = "If this is the authorized email, a secure sign-in link is on its way.";

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) return NextResponse.json({ message: "Supabase is not configured yet." }, { status: 503 });
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowedEmail || parsed.data.email !== allowedEmail) return NextResponse.json({ message: genericMessage });

  const supabase = await createClient();
  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return NextResponse.json({ message: "The sign-in link could not be sent. Try again shortly." }, { status: 502 });
  return NextResponse.json({ message: genericMessage });
}

