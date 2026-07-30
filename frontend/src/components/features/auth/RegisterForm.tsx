"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth.schema";
import { registerAction } from "@/lib/actions/auth.action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rootError, setRootError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  function onSubmit(values: RegisterInput) {
    setRootError("");
    startTransition(async () => {
      const res = await registerAction(values);
      if (!res.success) {
        setRootError(res.message);
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" className="h-10" placeholder="Name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-danger">{errors.name.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          className="h-10"
          type="email"
          placeholder="you@mail.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-danger">{errors.email.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          className="h-10"
          type="password"
          placeholder="At least 8 characters"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-danger">{errors.password.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm">Confirm Password</Label>
        <Input
          id="confirm"
          className="h-10"
          type="password"
          placeholder="••••••••"
          {...register("confirm")}
        />
        {errors.confirm && (
          <p className="text-sm text-danger">{errors.confirm.message}</p>
        )}
      </div>
      {rootError && <p className="text-sm text-danger">{rootError}</p>}
      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
}
