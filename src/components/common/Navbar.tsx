"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { Menu } from "lucide-react";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { workerMenus, employerMenus, navbarItemsEmployer, navbarItemsWorker, navbarItemsAll, } from "@/constants/navbarDatas";
import { brandLogo, profileImg } from "@/assets/assets";
import { getUserRole, getUserRoleEmployer, getUserRoleWorker, } from "@/utils/getUserRoleClient";
import { deleteCookie } from "cookies-next";
import { formatUrl } from "@/utils/formatUrl";
import { useNotification } from "@/context/NotificationContext";

const Navbar = ({ userData }: { userData: any }) => {
  const [open, setOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { unreadCount } = useNotification();

  const [navbarItems, setNavbarItems] = useState(navbarItemsAll);
  const [dropdownItems, setDropdownItems] = useState(workerMenus);

  // Fix hydration mismatch states
  const [mounted, setMounted] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);

  // Fix hydration mismatch: check role only on client
  useEffect(() => {
    setMounted(true);
    const activeRole = getUserRole() || null;
    setRole(activeRole);

    if (getUserRoleEmployer()) {
      setNavbarItems(navbarItemsEmployer);
      setDropdownItems(employerMenus);
    } else if (getUserRoleWorker()) {
      setNavbarItems(navbarItemsWorker);
      setDropdownItems(workerMenus);
    } else {
      setNavbarItems(navbarItemsAll);
    }
  }, [pathname]); // Re-check on path change if needed, or empty array if role is static

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  useEffect(() => {
    setUser(userData);
  }, [pathname, userData]);

  const hadleRedirect = (url: string) => {
    if (url === "/login") {
      deleteCookie("role");
      deleteCookie("accessToken");
      deleteCookie("refreshToken");
      window.location.replace("/");
    } else {
      router.push(url);
    }
  };

  return (
    <div className="w-full bg-white h-22 flex items-center sticky top-0 z-50">
      <div className="maxWidth flex justify-between items-center py-3 px-2">
        {/* Brand Logo */}
        <Link href="/" className="flex justify-start items-center">
          <Image
            src={brandLogo}
            alt="Brand Logo"
            width={300}
            height={75}
            className="w-32 h-12 object-fit"
          />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden grow lg:flex justify-center items-center gap-1 font-semibold text-gray-700">
          {navbarItems?.length > 0 &&
            navbarItems?.map((item, index) => (
              <li
                key={index}
                className={`cursor-pointer px-3 py-1 rounded-sm transition-all duration-300 ${isActive(item?.url)
                  ? "bg-brandClr1 text-white font-bold"
                  : "hover:bg-brandClr1 hover:text-white"
                  }`}
              >
                <Link href={item?.url}>{item?.title}</Link>
              </li>
            ))}
        </ul>

        {/* Log in / Mobile Menu Trigger */}
        <div className=" flex justify-end items-center gap-4 relative">
          {mounted && role && (
            <Link
              href="/notifications"
              className="w-9 h-9 md:w-12 md:h-12 rounded-full  bg-gray-200 flex items-center justify-center relative"
            >
              <MdOutlineNotificationsNone className="size-6 md:size-7 text-gray-600 hover:text-gray-800 cursor-pointer" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] px-1">
                  {unreadCount || 4}
                </span>
              )}
            </Link>
          )}
          {mounted && role ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-9 h-9 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-primary">
                    <Image
                      src={user ? formatUrl(user?.profile) : profileImg}
                      alt="User Profile"
                      width={400}
                      height={400}
                      className="object-cover h-9 w-9 md:h-12 md:w-12"
                    />
                  </div>
                  <p className="hidden xl:inline-block font-bold text-gray-700">
                    {user?.name}
                  </p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {dropdownItems.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => hadleRedirect(item?.url)}
                    className={`${isActive(item?.url)
                      ? "bg-brandClr1 text-white font-bold"
                      : "hover:bg-brandClr1 hover:text-white"
                      }`}
                  >
                    {item?.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden lg:flex items-center gap-1 border-2 border-brandClr2 text-brandClr1 font-semibold py-1 px-4 rounded-full customShadow4 ">
              <Link href="/signup">Sign Up</Link>
              <span className="text-xl">/</span>
              <Link href="/login">Log In</Link>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="lg:hidden">
            {mounted && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="cursor-pointer">
                  <Menu className="w-6 h-6 text-gray-600" />
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <SheetHeader className="flex flex-row items-center justify-between pt-8">
                    <SheetTitle className="">
                      <Image
                        src={brandLogo}
                        alt="Brand Logo"
                        width={300}
                        height={75}
                        className="w-30 h-12 object-fit"
                      />
                    </SheetTitle>
                    <SheetClose>
                      <IoClose
                        size={30}
                        className="text-gray-600 hover:text-gray-800 cursor-pointer"
                      />
                    </SheetClose>
                  </SheetHeader>

                  <ul className="flex flex-col mt-6 gap-2 font-medium text-gray-700 px-2">
                    {user && (
                      <li
                        onClick={() => setOpen(false)}
                        className="cursor-pointer hover:bg-gray-100 py-2 rounded"
                      >
                        <Link href="/profile" className="flex gap-2 items-center">
                          <span className="w-12 h-12 block rounded-full overflow-hidden border-2 border-primary">
                            <Image
                              src={user ? formatUrl(user?.profile) : profileImg}
                              alt="User Profile"
                              width={100}
                              height={100}
                              className="object-cover h-12 w-12"
                            />
                          </span>
                          <span className="flex flex-col text-gray-600 text-sm">
                            {user?.name}
                          </span>
                        </Link>
                      </li>
                    )}

                    {navbarItems.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => setOpen(false)}
                        className={`cursor-pointer px-3 py-1 rounded transition-colors duration-200 ${isActive(item?.url)
                          ? "bg-gray-200 text-primary font-semibold"
                          : "hover:bg-gray-100"
                          }`}
                      >
                        <Link href={item?.url}>{item?.title}</Link>
                      </li>
                    ))}

                    {/* Sign Up / Log In and Log Out Button */}
                    <div className="py-6 flex items-center justify-center">
                      {!role ? (
                        <div className="flex items-center justify-center gap-1 border-2 border-brandClr2 text-brandClr1 font-semibold py-1 px-4 rounded-full customShadow4 ">
                          <Link href="/signup" className="text-sm">
                            Sign Up
                          </Link>
                          <span className="">/</span>
                          <Link href="/login" className="text-sm">
                            Log In
                          </Link>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 border-2 border-brandClr2 text-brandClr1 font-semibold py-1 px-4 rounded-full customShadow4 ">
                          <button
                            onClick={() => hadleRedirect("/login")}
                            className="text-sm "
                          >
                            Log out
                          </button>
                        </div>
                      )}
                    </div>
                  </ul>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
