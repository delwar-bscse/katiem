/* eslint-disable react-hooks/exhaustive-deps */
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
import { useEffect, useState } from "react";
import { myFetch } from "@/utils/myFetch";
import { toast } from "sonner";
import LocationAutocompleteGoogleMap from "../map/LocationAutocompleteGoogleMap";
import { revalidate } from "@/helpers/revalidateHelper";
import { getUserRoleEmployer } from "@/utils/getUserRoleClient";

// Schema
const contactUsFormSchema = z
  .object({
    name: z.string(),
    number: z.string().max(11, {
      message: "Please enter a valid phone number.",
    }),
    location: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  });

// Type
type ContactUsFormValues = z.infer<typeof contactUsFormSchema>;

const defaultValues: Partial<ContactUsFormValues> = {
  name: "",
  number: "",
  location: "",
};

const EmployeeWorkerProfile = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState<any>();
  const isEmployer = getUserRoleEmployer();

  const form = useForm<ContactUsFormValues>({
    resolver: zodResolver(contactUsFormSchema),
    defaultValues,
    mode: "onChange",
  });



  const fetchProfile = async () => {
    const res = await myFetch("/user/profile",
      {
        method: "GET",
      }
    );
    //console.log("Get User Data : ", res);

    if (res.success) {
      setUserProfile(res?.data);
      form.reset({
        name: res?.data?.name || "",
        number: res?.data?.phone || "",
        location: res?.data?.address || "",
        longitude: res?.data?.coordinates?.[0] || undefined,
        latitude: res?.data?.coordinates?.[1] || undefined,
      })
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  async function onSubmit(data: ContactUsFormValues) {
    //console.log("Submitted Data:", data);

    const res = await myFetch("/user/profile", {
      method: "PATCH",
      body: {
        name: data.name,
        phone: data.number,
        address: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    //console.log("Profile Update :", res);
    if (res.success) {
      toast.success(res.message || "Profile updated!");
      await fetchProfile();
      setIsEditMode(false);
      revalidate("user");
    } else {
      toast.error(res.message || "Something went wrong!");
    }

  }

  return (
    <div className="w-full max-w-2xl">
      {!isEditMode && <div className="border rounded-md shadow p-6">
        <div className="space-y-4">
          {userProfile?.name && <p className="text-gray-600"><span className="font-semibold w-40 inline-block">{`${isEmployer ? "Employer" : "Worker"} Name`}</span>: {userProfile?.name}</p>}
          <p className="text-gray-600"><span className="font-semibold w-40 inline-block">Email</span>: {userProfile?.email}</p>
          <p className="text-gray-600"><span className="font-semibold w-40 inline-block">Contact</span>: {userProfile?.phone}</p>
          <p className="text-gray-600"><span className="font-semibold w-40 inline-block">Location</span>: {userProfile?.address}</p>
          <p className="text-gray-600 capitalize"><span className="font-semibold w-40 inline-block">Role</span>: {userProfile?.role}</p>
        </div>
        {/* Submit Button */}
        <div className="mt-4">
          <Button onClick={() => setIsEditMode(true)} variant="yelloBtn" type="button" size="lg" className="w-full sm:w-fit sm:px-10 mt-4">
            Edit Profile
          </Button>
        </div>
      </div>}



      {isEditMode && <div className="border rounded-md shadow p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-600">{`${isEmployer ? "Employer" : "Worker"} Name ${isEmployer ? "(Optional)" : ""}`}</FormLabel>
                  <FormControl>
                    <Input variant="yelloBg2" placeholder="Enter Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Number */}
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-600">Number</FormLabel>
                  <FormControl>
                    <Input variant="yelloBg2" placeholder="Enter Your Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            {/* <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-600">Location</FormLabel>
                  <FormControl>
                    <Input variant="yelloBg2" placeholder="Enter Your Location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-600">Location</FormLabel>
                  <FormControl>
                    <LocationAutocompleteGoogleMap
                      value={field.value}
                      onChange={field.onChange}
                      onSelectLocation={({ address, lat, lng }) => {
                        form.setValue("location", address);
                        form.setValue("latitude", lat);
                        form.setValue("longitude", lng);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button variant="yelloBtn" type="submit" size="lg" className="w-full sm:w-fit sm:px-10 mt-4">
              Save
            </Button>
          </form>
        </Form>
      </div>}
    </div>
  );
};

export default EmployeeWorkerProfile;
