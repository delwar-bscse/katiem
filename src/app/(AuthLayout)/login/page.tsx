"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import { setCookie } from "cookies-next/client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCookie, setCookie } from "cookies-next";
import { myFetch } from "@/utils/myFetch";
import { toast } from "sonner";

// Schema
const contactUsFormSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    })
  });

// Type
type ContactUsFormValues = z.infer<typeof contactUsFormSchema>;

const defaultValues: Partial<ContactUsFormValues> = {
  email: "",
  password: "",
};

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<ContactUsFormValues>({
    resolver: zodResolver(contactUsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    deleteCookie('role');
  }, []);

  async function onSubmit(data: ContactUsFormValues) {

    const res = await myFetch("/auth/login", {
      method: "POST",
      body: {
        email: data.email,
        password: data.password,
      },
    });

    if (res.success) {
      if (res?.data?.isVerified === false) {
        router.push("/verify-otp");
      } else {
        setCookie("accessToken", res?.data?.accessToken);
        setCookie("refreshToken", res?.data?.refreshToken);
        setCookie("role", res?.data?.role);
        router.push("/");
      }
    } else {
      toast.error(res?.message ?? "Login failed!");
    }
  }


  return (
    <div className="px-2 sm:px-4 md:px-8 py-6 md:py-8 w-full">
      <h2 className="text-2xl md:text-3xl xl:text-4xl font-semibold text-gray-700 text-center">Log In</h2>
      <p className="text-gray-500 text-center pt-2 pb-4">Please enter your email and password to login</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 text-lg">Email</FormLabel>
                <FormControl>
                  <Input variant="yelloBg2" className="" placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 text-lg">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Your Password"
                      variant="yelloBg2"
                      className="pr-10"
                      {...field}
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-600 z-10"
                      onClick={() => setShowPassword(prev => !prev)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end relative -top-3">
            <Link href="/forgot-password" className="text-gray-700 hover:text-gray-600 font-semibold">
              Forgot Password
            </Link>
          </div>


          {/* Submit Button */}
          <Button variant="yelloBtn" size="lg" type="submit" className="w-full">
            Sign In
          </Button>

          <div className="relative -top-2 flex justify-center items-center gap-2">
            Don&apos;t Have An Account?
            <Link href="/signup" className="text-yellow-500 underline hover:text-gray-600 font-semibold">
              Sign Up Now
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SignIn;
