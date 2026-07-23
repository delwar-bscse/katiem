"use client"
import { BOOKING_STATUS } from '@/types/jobTypes'
import { formatUrl } from '@/utils/formatUrl'
// import { employerDatas } from '@/data/employerDatas'
import { myFetch } from '@/utils/myFetch'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { toast } from 'sonner'



const OfferJobList = () => {
  const [employerDatas, setEmployerDatas] = React.useState<any>([]);

  const getEmployers = async () => {
    const res = await myFetch(`/booking`);
    const employerDatas = res?.data || [];
    // const meta: any = res?.data?.pagination || {};
    console.log("Booked employer datas : ", employerDatas);
    setEmployerDatas(employerDatas);
  }

  useEffect(() => {
    getEmployers();
  }, []);

  const handleApproveDecline = async (id: any, status: string) => {
    const res = await myFetch(`/booking/${id}`, {
      method: "PATCH",
      body: {
        status: status
      }
    });
    //console.log("Approve res : ", res);
    if (res.success) {
      toast.success(res.message || `Job offer ${status} successfully!`);
      getEmployers();
    } else {
      toast.error(res.message || `Failed to ${status} job.`);
    }
  }


  return (
    <div className='w-full max-w-200 mx-auto'>
      {employerDatas.map((item: any) => (
        <div key={item?._id} className='flex items-center justify-between gap-4 mt-4 shadow-lg p-4 rounded-md bg-brandClr2/10'>
          <div className='flex gap-4'>
            <Image src={formatUrl(item?.employer?.profile)} width={200} height={200} alt="" className='w-25 h-25 rounded-md object-cover' />
            <div className='flex-1'>
              <p className='font-semibold text-gray-800'>{item?.employer?.name}</p>
              <p className='text-gray-500 text-sm'>{item?.employer?.address}</p>
              <p className='text-gray-500 text-sm'>{dayjs(item?.createdAt).format("DD, MMMM YYYY")}</p>
            </div>
          </div>
          {item.status === BOOKING_STATUS.APPROVED &&
            <div className='h-full flex items-end justify-end gap-4'>
              <Link href={`/inbox?chat_id=${item?.chatId}`} className='w-25 bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200 cursor-pointer text-sm font-semibold px-3 py-2 rounded-md text-center'>Message</Link>
            </div>}
          {item.status === BOOKING_STATUS.PENDING && <div className='flex items-center flex-col gap-4'>
            <button onClick={() => handleApproveDecline(item?._id, BOOKING_STATUS.APPROVED)} className='w-25 bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200 cursor-pointer text-sm font-semibold px-3 py-2 rounded-md'>Approve</button>
            <button onClick={() => handleApproveDecline(item?._id, BOOKING_STATUS.DECLINED)} className='w-25 border border-red-500 text-red-500 text-sm font-semibold px-3 py-2 rounded-md cursor-pointer transition-colors hover:border-red-600 hover:text-red-600 hover:transition-colors duration-200'>Decline</button>
          </div>}
          {item.status === BOOKING_STATUS.DECLINED &&
            <div className='h-full flex items-end justify-end gap-4'>
              <p className='w-25 bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 cursor-pointer text-sm font-semibold px-3 py-2 rounded-md text-center'>Declined</p>
            </div>}
        </div>
      ))}
    </div>
  )
}

export default OfferJobList