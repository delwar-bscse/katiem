import CustomButton from '@/components/cui/CustomButton'
import JobDetailsBody from '@/components/cui/JobDetailsBody'
import JobDetailsTop from '@/components/cui/JobDetailsTop'
import { APPLICATION_STATUS } from '@/types/jobTypes'
// import { jobDetails } from '@/data/jobDatas'
import { myFetch } from '@/utils/myFetch'
import Link from 'next/link'
import React from 'react'
import BoostJobButton from '@/components/cui/BoostJobButton'


const PostedJobDetails = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const res = await myFetch(`/job/${id}`);
  const jobDetails = res?.data || [];
  //console.log("Job details res : ", jobDetails);


  return (
    <div className='maxWidth pt-4 pb-20'>

      {/* --------------------- Job Header --------------------- */}
      <JobDetailsTop jobDetails={jobDetails} hideApplyButton />

      {/* ------------ Action Buttons - Edit Post, Applied Workers, Approved Workers ------------ */}
      <div className='flex gap-2 py-4 md:py-6 items-center flex-wrap'>
        <div>
          <CustomButton url={`/employer/posted-jobs/edit-job/${jobDetails._id}`} text="Edit Post" variant="button01" className='w-full' />
        </div>
        <div>
          <Link href={`/employer/posted-jobs/worker-list?type=${APPLICATION_STATUS.PENDING}&jobId=${jobDetails._id}`} className='w-full border py-2 px-3 rounded-sm border-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300'>Applied Workers</Link>
        </div>
        <div>
          <Link href={`/employer/posted-jobs/worker-list?type=${APPLICATION_STATUS.APPROVED}&jobId=${jobDetails._id}`} className='w-full border py-2 px-3 rounded-sm border-green-500 hover:bg-green-500 hover:text-white transition-colors duration-300'>Approved Workers</Link>
        </div>
        <div>
          <BoostJobButton jobId={jobDetails._id} />
        </div>
      </div>

      {/* --------------------- Job body (description) --------------------- */}
      <JobDetailsBody jobDetails={jobDetails} />

    </div>
  )
}

export default PostedJobDetails