/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import InputList from "./InputList";
import { SALARY_TYPE } from "@/constants/salaryObject";
import { AVAILABILITY } from "@/constants/availabilityObject";
import { myFetch } from "@/utils/myFetch";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import LocationAutocompleteGoogleMap from "../map/LocationAutocompleteGoogleMap";

/* ==============================
   Types
============================== */

type EditPostFormValues = {
  companyName?: string;
  category?: string;
  subCategory?: string;
  location: string;
  longitude?: number;
  latitude?: number;
  salary?: string;
  availability: string[];
  overview?: string;
  preEmploymentCheck?: boolean;
};

/* ==============================
   Defaults
============================== */

const defaultValues: Partial<EditPostFormValues> = {
  companyName: "",
  category: "",
  subCategory: "",
  location: "",
  longitude: 0,
  latitude: 0,
  salary: "",
  availability: [],
  overview: "",
  preEmploymentCheck: false,
};

/* ==============================
   Component
============================== */

const JobPostForm = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id || "";

  const [categoryDatas, setCategoryDatas] = useState<any>([]);
  const [subCategories, setSubCategories] = useState<any>([]);

  const [keyResponsibilities, setKeyResponsibilities] = useState<string[]>([]);
  const [skillRequirements, setSkillRequirements] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);

  const [salaryType, setSalaryType] = useState<string>(SALARY_TYPE.Hourly);
  const [deadline, setDeadline] = useState<number>(7);
  const [image, setImage] = useState<File | null>(null);

  const form = useForm<EditPostFormValues>({
    defaultValues,
    mode: "onChange",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      const res = await myFetch(`/job/${jobId}`, {
        method: "GET",
      });

      form.reset({
        companyName: res?.data?.companyName || "",
        category: res?.data?.category || "",
        subCategory: res?.data?.subCategory || "",
        location: res?.data?.address || "",
        longitude: res?.data?.longitude || 0,
        latitude: res?.data?.latitude || 0,
        salary: res?.data?.salary || "",
        availability: res?.data?.availability || [],
        overview: res?.data?.overview || "",
      });

      setSalaryType(res?.data?.salaryType || "");
      setKeyResponsibilities(res?.data?.responsibilities || []);
      setSkillRequirements(res?.data?.skillRequirements || []);
      setBenefits(res?.data?.benefits || []);
    };

    if (jobId) fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await myFetch("/category", {
        method: "GET",
      });
      setCategoryDatas(res?.data);
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data: EditPostFormValues) => {
    // console.log({data})

    const payload = {
      title: data.companyName,
      companyName: data.companyName,
      category: data.category,
      subCategory: data.subCategory,
      // address: "Dhaka, Bangladesh",
      // latitude: 23.810331,
      // longitude: 90.412521,
      address: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      postDuration: deadline,
      overview: data.overview,
      salaryType,
      salary: Number(data.salary),
      availability: data.availability,
      responsibilities: keyResponsibilities,
      skillRequirements,
      benefits,
    };
    console.log("Onsubmit work", payload);

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    if (image) {
      formData.append("images", image);
    }

    const url = jobId ? `/job/${jobId}` : `/job`;
    const method = jobId ? "PATCH" : "POST";

    const res = await myFetch(url, {
      method: method,
      body: formData,
    });
    console.log("Job post/edit res : ", res)

    if (res.success) {
      toast.success(res.message);
      router.push("/employer/posted-jobs");
      router.refresh();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="w-full border border-gray-200 shadow px-4 py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Company Name */}
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">
                  Company Name (Optional)
                </FormLabel>
                <FormControl>
                  <Input type="text" variant="borderblack" placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-800 text-xl">
                  Category
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const selectedItem = categoryDatas?.find(
                      (item: any) => item.title === value
                    );
                    setSubCategories(selectedItem?.subCategories);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      variant="borderblack"
                      size="lg"
                      className="w-full"
                    >
                      <SelectValue placeholder={form.getValues("category") ?? "Select a Category"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryDatas?.map((item: any) => (
                      <SelectItem
                        key={item?._id}
                        value={item?.title}
                      >
                        {item?.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sub Category */}
          <FormField
            control={form.control}
            name="subCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-800 text-xl">
                  Sub Category
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      variant="borderblack"
                      size="lg"
                      className="w-full"
                    >
                      <SelectValue placeholder={form.getValues("subCategory") ?? "Select a Sub Category"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subCategories?.map((item: string, index: number) => (
                      <SelectItem key={index} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">Location</FormLabel>
                <FormControl>
                  {/* <Input variant="borderblack" {...field} /> */}
                  <LocationAutocompleteGoogleMap
                    value={field.value}
                    onChange={field.onChange}
                    onSelectLocation={(data) => {
                      //console.log(data)
                      form.setValue("location", data.address);
                      form.setValue("longitude", data.lng);
                      form.setValue("latitude", data.lat);
                    }}
                    inputClassVarient="borderblack"
                    placeholder="Enter Location"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Deadline */}
          <div className="flex gap-3">
            {[7, 14].map((d) => (
              <span
                key={d}
                onClick={() => setDeadline(d)}
                className={`cursor-pointer border-2 px-3 py-2 font-semibold ${deadline === d
                  ? "bg-yellow-500 border-yellow-500"
                  : "border-blue-600 text-blue-600"
                  }`}
              >
                {d} Days Post
              </span>
            ))}
          </div>

          {/* Availability */}
          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">Availability</FormLabel>
                <div className="flex flex-wrap gap-3 border p-3">
                  {Object.values(AVAILABILITY).map((value) => {
                    const checked = field.value.includes(value);
                    return (
                      <label key={value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            field.onChange(
                              checked
                                ? field.value.filter(v => v !== value)
                                : [...field.value, value]
                            );
                          }}
                        />
                        {value}
                      </label>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image */}
          <div>
            <p className="text-xl font-semibold pb-1">Upload Image</p>
            <Input
              type="file"
              accept="image/*"
              variant="borderblack"
              onChange={handleImageUpload}
            />
          </div>

          {/* Salary */}
          <div>
            {/* <p className="text-xl font-semibold pb-1">Saying Salary</p> */}
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="flex gap-2">
                    <p className="text-xl font-semibold pb-1">Salary</p>
                    {Object.values(SALARY_TYPE).map((value) => (
                      <span
                        key={value}
                        onClick={() => setSalaryType(value)}
                        className={`cursor-pointer rounded px-2 py-1 text-sm ${salaryType === value
                          ? "bg-yellow-500"
                          : "bg-gray-200 text-gray-500"
                          }`}
                      >
                        {value}
                      </span>
                    ))}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Salary Amount"
                      variant="borderblack"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Overview */}
          <FormField
            control={form.control}
            name="overview"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">Job Overview</FormLabel>
                <FormControl>
                  <Textarea variant="borderblack" placeholder="Type here Job Overview" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <InputList
            title="Key Responsibilities"
            list={keyResponsibilities}
            setList={setKeyResponsibilities}
          />
          <InputList
            title="Skill Requirements"
            list={skillRequirements}
            setList={setSkillRequirements}
          />
          <InputList
            title="Benefits"
            list={benefits}
            setList={setBenefits}
          />
          {/* Pre Employment Check */}
          <FormField
            control={form.control}
            name="preEmploymentCheck"
            render={({ field }) => (
              <FormItem>
                <FormControl>

                  <div className="flex items-baseline">
                    <input
                      type="checkbox"
                      required
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mr-2"
                    />
                    <span className=''>I acknowledge that a &quot;Verified&quot; badge only confirms a user&apos;s identity has been checked. I agree that I am solely responsible for performing all mandatory pre-employment checks, including Right to Work, references, and DBS checks.</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" variant="yelloBtn" size="llg">
              Publish
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
};

export default JobPostForm;
