import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BrandLogo } from "@/components/BrandLogo";

const schema = z
  .object({
    firstName: z.string().trim().min(1, "Required").max(50),
    lastName: z.string().trim().min(1, "Required").max(50),
    email: z.string().trim().email("Invalid email").max(255),
    password: z.string().min(8, "At least 8 characters").max(128),
    confirmPassword: z.string(),
    accept: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Create your account — AISLE SPY" },
      { name: "description", content: "Join AISLE SPY and start shopping smarter." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register: doRegister, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { accept: false as any } });

  const onSubmit = async (values: FormValues) => {
    try {
      await doRegister(values);
      toast.success("Account created — let's set things up");
      navigate({ to: "/onboarding", replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
      >
        <div className="mb-6 flex justify-center"><BrandLogo /></div>
        <h1 className="text-2xl font-bold tracking-tight text-secondary">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Just the essentials — you'll finish setup next.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" className="h-12 rounded-xl" {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" className="h-12 rounded-xl" {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" className="h-12 rounded-xl" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" className="h-12 rounded-xl" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" className="h-12 rounded-xl" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={!!watch("accept")}
              onCheckedChange={(v) => setValue("accept", !!v as any, { shouldValidate: true })}
              className="mt-0.5"
            />
            <span>I accept the Terms of Service and Privacy Policy.</span>
          </label>
          {errors.accept && <p className="text-xs text-destructive">{errors.accept.message}</p>}

          <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-xl text-base font-semibold">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" />
        </div>
        <Button type="button" variant="outline" onClick={() => loginWithGoogle().then(() => navigate({ to: "/" }))} className="h-12 w-full rounded-xl text-base font-medium">
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}