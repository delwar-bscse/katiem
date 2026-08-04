"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { Textarea } from "@/components/ui/textarea"
import { TfiEmail } from "react-icons/tfi";
import { myFetch } from "@/utils/myFetch";
import { toast } from "sonner";

// Schema
const contactUsFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  message: z.string().min(2, "Full name must be at least 2 characters."),
});

// Type
type ContactUsFormValues = z.infer<typeof contactUsFormSchema>;

const defaultValues: Partial<ContactUsFormValues> = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
};

{/* ---------------------------- Sign Up Form ---------------------------- */ }
const ContactUsSection = () => {
  const form = useForm<ContactUsFormValues>({
    resolver: zodResolver(contactUsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ContactUsFormValues) {
    //console.log("form data:", data);
    toast.loading("Sending ...", { id: "contact-us" });
    const res = await myFetch("/public/contact", {
      method: "POST",
      body: {
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        message: data.message,
      },
    })

    if (res.success) {
      toast.success(res.message || "Send successfully!", { id: "contact-us" });
    } else {
      toast.error(res.message || "Something went wrong!", { id: "contact-us" });
    }
  }

  return (
    <div className="w-full max-w-[800px] mx-auto flex flex-col sm:flex-row text-center justify-center gap-4 lg:gap-8 px-2">
      {/* ---------------------------- Sign Up Form ---------------------------- */}
      <div className="customShadow flex-1 p-4">
        <h2 className="font-semibold text-3xl text-gray-700 border-b-2 pb-4">Need More Help ?</h2>
        <p className="flex items-center gap-2 font-semibold text-gray-700 pt-8">
          <span className="text-brandClr1 flex items-center justify-center customShadow w-10 h-10 rounded-full">
            <TfiEmail />
          </span>
          <span className="text-gray-700">admin@instantlabour.co.uk</span>
        </p>
      </div>
      {/* ---------------------------- Sign Up Form ---------------------------- */}
      <div className="customShadow p-4 basis-[60%]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input variant="borderblack" placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input variant="borderblack" placeholder="Enter your email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input variant="borderblack" placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea variant="borderblack" placeholder="Enter your message" {...field} className="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button variant="yelloBtn" size="lg" type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </Form>
      </div>

    </div>
  );
};

export default ContactUsSection;
