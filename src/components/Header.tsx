import Link from "next/link";
import { useEffect, useState } from "react";
import VideoRecordModal from "./VideoRecordModal";
import VideoUploadModal from "./VideoUploadModal";
import VideoMoreMenu from "./VideoMoreMenu";
import ShareModal from "./ShareModal";
import NewVideoMenu from "./NewVideoMenu";
import logo from "~/assets/logo.png";
import Image from "next/image";
import type { RouterOutputs } from "~/utils/api";

export default function Header({
  isPublic,
  video,
}: {
  isPublic: boolean;
  video?: RouterOutputs["video"]["get"];
}) {
  const [attop, setAtTop] = useState(true);
  useEffect(() => {
    document.addEventListener("scroll", () => {
      setAtTop(window.scrollY <= 1);
    });
  }, []);

  return (
    <div
      style={{ borderColor: attop ? "transparent" : "#E5E5E5" }}
      className="header sticky top-0 z-10 flex h-[64px] border-b bg-white bg-opacity-40 backdrop-blur-sm backdrop-saturate-200"
    >
      <div className="flex min-h-[62px] w-full items-center justify-between border-b border-solid border-b-[#E7E9EB] bg-white px-6">
        <Link href="/" className="flex items-center">
          <Image
            className="cursor-pointer p-2"
            src={logo}
            alt="logo"
            width={42}
            height={42}
            unoptimized
          />
          <span>Snapify</span>
        </Link>

        <div className="flex flex-row items-center justify-center">
          {!isPublic ? (
            <>
              {video ? (
                <>
                  <VideoMoreMenu video={video} />
                  <ShareModal video={video} />
                </>
              ) : null}
              <Link href="/" className="mr-4 px-2 py-2">
                <span className="cursor-pointer rounded border border-[#0000001a] px-2 py-2 text-sm text-[#292d34] hover:bg-[#fafbfc]">
                  My Library
                </span>
              </Link>
              <VideoRecordModal />
              <VideoUploadModal />
              <NewVideoMenu />
            </>
          ) : (
            <Link href="https://deta.space/discovery/@lemonyte/snapify">
              <span className="cursor-pointer rounded border border-[#0000001a] px-2 py-2 text-sm text-[#292d34] hover:bg-[#fafbfc]">
                Install on Space
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
