"use client"

import Image from 'next/image'
import React from 'react'
import { LuLayers2 } from "react-icons/lu";
import { GrLocation } from "react-icons/gr";
import { FiClock } from "react-icons/fi";
// import { jobDetails } from '@/data/jobDatas';
import { HiOutlineCurrencyPound } from "react-icons/hi";
import { MdArrowBack, MdOutlineStarPurple500, MdOutlineVerifiedUser } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { getUserRoleEmployer, getUserRoleWorker } from '@/utils/getUserRoleClient';
import { toast } from 'sonner';
import { CustomModal } from '../modal/CustomModal';
import TakeReview from './TakeReview';
import Link from 'next/link';
import { formatUrl } from '@/utils/formatUrl';
import dayjs from 'dayjs';
import { myFetch } from '@/utils/myFetch';
import { APPLICATION_STATUS } from '@/types/jobTypes';
import { BsExclamationCircle } from 'react-icons/bs';

interface JobDetailsTopProps {
  jobDetails: any;
  hideApplyButton?: boolean;
}

const JobDetailsTop = ({ jobDetails, hideApplyButton = false }: JobDetailsTopProps) => {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isEmployer, setIsEmployer] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsEmployer(getUserRoleEmployer());
  }, []);

  console.log("Job details Top: ", jobDetails);


  const goBack = () => {
    window.history.back()
  }

  const handleApply = async () => {
    if (getUserRoleWorker()) {
      const res = await myFetch(`/application/${jobDetails._id}`, {
        method: "POST",
      })
      //console.log("Apply res : ", res);
      if (res.success) {
        toast.success(res.message || "Applied successfully!");
        document.getElementById("cancel")?.click()
        router.refresh();
      } else {
        toast.error(res.message || "Please login as a worker first");
      }
    } else {
      toast.error("Please login as a worker first");
    }
  }

  return (
    <div>
      <div onClick={goBack} className='flex items-center gap-2 md:gap-4 cursor-pointer pb-4 md:pb-6 group'>
        <span className='size-6 md:size-9 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-200'>
          < MdArrowBack className='size-4 md:size-6' />
        </span>
        <h2 className='text-xl md:text-3xl font-semibold text-gray-600'>View Details</h2>
      </div>
      <div key={jobDetails._id} className='flex flex-col md:flex-row gap-8 bg-white'>

        {/* --------------------- Job Image --------------------- */}
        <div>
          <Image src={formatUrl(jobDetails.images[0])} width={500} height={400} alt={jobDetails.companyName} className='w-full sm:w-100 h-67.5 rounded-md' />
        </div>

        {/* --------------------- Job Header --------------------- */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <h3 className='font-semibold text-2xl text-gray-800'>{jobDetails.companyName}</h3>
            <div className='flex items-center gap-1'>
              <MdOutlineStarPurple500 className='text-brandClr2 size-7' />
              <p className='text-xl font-semibold text-gray-600'>4.5</p>
            </div>
          </div>
          <div className='space-y-3'>
            <ul className='space-y-2 text-lg text-gray-500'>
              <li className='flex items-center gap-3'>
                <LuLayers2 />
                <span>{jobDetails.companyName}</span>
              </li>
              <li className='flex items-center gap-3'>
                <GrLocation />
                <span>{jobDetails.address}</span>
              </li>
              <li className='flex items-center gap-3'>
                <FiClock />
                <span>{dayjs(jobDetails.createdAt).format("DD, MMMM YYYY")}</span>
              </li>
              <li className='flex items-center gap-3'>
                <HiOutlineCurrencyPound />
                <span>{jobDetails.salary}</span>
              </li>
              <li className={`flex items-center gap-3 ${jobDetails?.createdBy?.isAccountVerified ? "text-green-500" : "text-red-500"}`}>
                <MdOutlineVerifiedUser />
                {jobDetails?.createdBy?.isAccountVerified ? <CustomModal
                  title="ID Verified"
                  trigger={<button className='text-green-500 flex items-center gap-1 cursor-pointer'>Verified <BsExclamationCircle size={14} /></button>}
                >
                  <p>This job has been posted by a user who has provided a government-issued ID to confirm they are a real person. Instant Labour has not verified the accuracy of the job details or carried out checks on the employer, role, or compliance with applicable laws. Users are responsible for reviewing job information before applying or engaging.</p>
                </CustomModal> : <span className=''>Not Verified</span>}
              </li>
            </ul>


            {/* -------------------Apply Now, Contact & Review Button ------------------- */}
            {!hideApplyButton && mounted && !isEmployer && (jobDetails.isApplied ? <div>
              {jobDetails.applicationStatus === APPLICATION_STATUS.APPROVED ? <div className='flex gap-4 items-center'>
                <Link href={`/inbox?chat_id=${jobDetails?.chatId}`} className='border-2 border-brandClr2 bg-brandClr2 text-gray-800 font-semibold py-2 px-8 rounded-sm hover:bg-brandClr2/90 transition-colors duration-300'>Contact Now</Link>
                <CustomModal
                  title="Feedback"
                  trigger={<button className='border-2 border-blue-600 text-blue-600 font-semibold py-2 px-8 rounded-sm hover:border-blue-700 transition-colors duration-300 cursor-pointer'>Feed Back</button>}
                >
                  <TakeReview id={jobDetails?.createdBy?._id} />
                </CustomModal>
              </div> : <div>
                <p className='text-gray-500'>Status : Your application status is {jobDetails.applicationStatus}</p>
              </div>}
            </div> : <div className='flex'>
              <CustomModal title="" trigger={<button className='border-2 border-brandClr2 bg-brandClr2 text-gray-800 font-semibold py-2 px-8 rounded-sm hover:bg-brandClr2/90 transition-colors duration-300'>Apply Now</button>} >
                <p className='text-center text-2xl text-gray-700 font-bold'>Are You Sure You Want To Apply</p>
                <div className='w-full max-w-50 mx-auto flex justify-center gap-4'>
                  <div className='flex-1 max-w-50 mx-auto mt-12'>
                    <button onClick={() => document.getElementById("cancel")?.click()} className='w-full border border-red-500 px-4 py-1.5 rounded-sm'>No</button>
                  </div>
                  <div className='flex-1 max-w-50 mx-auto mt-12'>
                    <button onClick={handleApply} className='w-full bg-green-500 text-white px-4 py-1.5 rounded-sm'>Yes</button>
                  </div>
                </div>
              </CustomModal>
            </div>)}
          </div>

        </div>
      </div>
    </div>
  )
}

export default JobDetailsTop