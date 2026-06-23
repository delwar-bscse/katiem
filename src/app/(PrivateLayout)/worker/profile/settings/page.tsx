"use client"
import React, { useEffect, useState } from 'react'
import { VscLock } from "react-icons/vsc";
import ChangePassword from '@/components/cui/ChangePassword';
import DeleteAccount from '@/components/cui/DeleteAccount';
import { RiDeleteBin6Line } from "react-icons/ri";
import { BiUserCircle } from 'react-icons/bi';
import { MdOutlineLogout } from "react-icons/md";
import EmployeeWorkerProfile from '@/components/cui/EmployeeWorkerProfile';
import { useRouter } from 'next/navigation';
import Image, { StaticImageData } from 'next/image';
import { workerDetails } from '@/data/workerDatas';
import { IoCameraOutline } from "react-icons/io5";
import { TbEPassport } from 'react-icons/tb';
import NidUploadWorker from '@/components/cui/NidUploadWorker';
import { updateImage } from '@/utils/updateImages';
import { myFetch } from '@/utils/myFetch';
import { formatUrl } from '@/utils/formatUrl';
import { deleteCookie } from 'cookies-next';

const profileSidebar = [
  {
    id: 1,
    title: "Personal Information",
    icon: <BiUserCircle className='text-gray-700 text-xl' />,
  },
  {
    id: 2,
    title: "Verification",
    icon: <TbEPassport className='text-gray-700 text-xl' />,
  },
  {
    id: 3,
    title: "Change Password",
    icon: <VscLock className='text-gray-700 text-xl' />,
  },
  {
    id: 4,
    title: "Delete Account",
    icon: <RiDeleteBin6Line className='text-gray-700 text-xl' />,
  },
];

const WorkerSettings = () => {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | StaticImageData>(workerDetails.workerImg);
  const [coverImage, setCoverImage] = useState<string | StaticImageData>(workerDetails.workerCover);

  const handleProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileImage(url);
    updateImage({ image: file, type: "profile" });
  };

  const handleCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverImage(url);
    updateImage({ image: file, type: "cover" });
  };


  const fetchProfile = async () => {
    const res = await myFetch("/user/profile");
    //console.log("Get User Data : ", res);

    if (res.success) {
      const coverImage = formatUrl(res?.data?.cover);
      const profileImage = formatUrl(res?.data?.profile);
      setCoverImage(coverImage);
      setProfileImage(profileImage);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    deleteCookie('role');
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    router.push("/")
  }

  return (
    <div>
      {/* ------------------- Profile & Cover ------------------- */}
      <div className='maxWidth pt-4 pb-4'>
        <div className='relative'>
          <Image src={coverImage} width={1200} height={240} alt={workerDetails.name} className='w-full sm:h-50 md:h-60 object-fit' />
          <div onClick={() => document.getElementById("coverImageId")?.click()} className='w-6 h-6 md:w-8 md:h-8 rounded-full border bg-gray-500/50 flex items-center justify-center absolute bottom-7 right-0 transform -translate-x-1/2 translate-y-1/2'>
            <IoCameraOutline className='text-white text-lg md:text-xl' />
          </div>
          <input id="coverImageId" type="file" accept='image/*' onChange={handleCoverImage} className='hidden' />
          <div className='absolute bottom-0 left-6 md:left-16 rounded-full transform translate-y-1/2 bg-white/50'>
            <Image src={profileImage} width={320} height={320} alt={workerDetails.name} className='w-25 h-25 md:w-40 md:h-40 rounded-full' />

            <div onClick={() => document.getElementById("profileImageId")?.click()} className='w-6 h-6 md:w-8 md:h-8 rounded-full border bg-gray-500/50 flex items-center justify-center absolute bottom-6 md:bottom-8 -right-4 transform -translate-x-1/2 translate-y-1/2'>
              <IoCameraOutline className='text-white text-lg md:text-xl' />
            </div>
            <input id="profileImageId" type="file" accept='image/*' onChange={handleProfileImage} className='hidden' />
          </div>
        </div>
        <div className='h-5 md:h-20' />
      </div>

      {/* ------------------- Settings Sidebar & Content ------------------- */}
      <div className='maxWidth flex flex-col md:flex-row gap-6 md:gap-8 py-8 items-start'>
        {/* Left Sidebar */}
        <div className='w-full md:w-1/4 bg-white rounded-lg border border-gray-100 p-4 shadow-sm md:sticky md:top-24'>
          <ul className='flex flex-col gap-2'>
            {profileSidebar?.map((item) => (
              <li 
                onClick={() => setStep(item.id)} 
                key={item.id} 
                className={`flex items-center gap-2.5 py-2.5 px-4 cursor-pointer rounded-md transition-all duration-200 ${
                  item.id === step 
                    ? "bg-[#FFECAC] text-gray-900 font-semibold shadow-sm" 
                    : "bg-white hover:bg-[#FFECAC]/30 text-gray-600"
                }`}
              >
                <span className='text-xl'>
                  {item.icon}
                </span>
                <span className='text-base font-semibold'>{item.title}</span>
              </li>
            ))}
            <li 
              onClick={handleLogout} 
              className={`flex items-center gap-2.5 py-2.5 px-4 cursor-pointer rounded-md transition-all duration-200 bg-white hover:bg-red-50 text-red-600 mt-4 border-t border-gray-100 pt-4`}
            >
              <span>
                <MdOutlineLogout className='text-red-600 text-xl' />
              </span>
              <span className='text-base font-semibold'>Log Out</span>
            </li>
          </ul>
        </div>

        {/* Right Content Area */}
        <div className='w-full md:w-3/4 bg-white rounded-lg border border-gray-100 p-4 md:p-6 shadow-sm min-h-[400px]'>
          {step === 1 && <EmployeeWorkerProfile />}
          {step === 2 && <NidUploadWorker />}
          {step === 3 && <ChangePassword />}
          {step === 4 && <DeleteAccount />}
        </div>
      </div>
    </div>
  )
}

export default WorkerSettings