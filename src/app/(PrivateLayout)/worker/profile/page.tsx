

import WorkerDetailsBody from '@/components/cui/WorkerDetailsBody'
// import { workerDetails } from '@/data/workerDatas'
import Image from 'next/image'
import React from 'react'
import { RiSettings5Line } from "react-icons/ri";
import { BiEdit } from "react-icons/bi";
import Link from 'next/link';
import { myFetch } from '@/utils/myFetch';
import { formatUrl } from '@/utils/formatUrl';

const Profile = async () => {
  const res = await myFetch("/user/profile");
  const workerDetails = res?.data
  //console.log("Get User Data : ", res);

  
  return (
    <div className='pb-20'>
      {/* ------------------- Profile & Cover ------------------- */}
      <div className='maxWidth relative'>
        <Image src={formatUrl(workerDetails?.cover ?? "")} width={1200} height={300} alt={workerDetails?.name || "Worker Cover Image"} className='w-full sm:h-50 md:h-75 object-fit' />
        <div className='absolute bottom-0 left-6 md:left-16 rounded-full transform translate-y-1/2'>
          <Image src={formatUrl(workerDetails?.profile ?? "")} width={400} height={400} alt={workerDetails?.name || "Worker Profile Image"} className='w-25 h-25 md:w-50 md:h-50 rounded-full' />
        </div>
      </div>
      <div className='maxWidth flex items-center justify-end gap-2 md:gap-4 pt-2 md:pt-4'>
        <Link href="/worker/profile/edit-profile" className='flex items-center w-8 h-8 md:w-10 md:h-10 justify-center rounded-full bg-brandClr2/50 cursor-pointer'>
          <BiEdit className='md:text-2xl text-gray-600' />
        </Link>
        <Link href="/worker/profile/settings" className='flex items-center gap-2 bg-brandClr2/50 cursor-pointer rounded-full md:rounded-md p-2 md:px-4 md:py-1.5'>
          <span>
            <RiSettings5Line className='md:text-2xl text-gray-600' />
          </span>
          <span className='text-gray-600 text-lg font-semibold hidden md:block'>Settings</span>
        </Link>
      </div>
      <div className='h-5 md:h-20' />

      {/* ------------------- Personal Info ------------------- */}
      <WorkerDetailsBody workerDetails={workerDetails} />
    </div>
  )
}

export default Profile