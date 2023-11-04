import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Link from "next/link";
import { getTime } from "~/utils/getTime";
import { ShareModal } from "~/components/ShareModal";
import VideoMoreMenu from "~/components/VideoMoreMenu";
import VideoRecordModal from "~/components/VideoRecordModal";
import logo from "~/assets/logo.png";

const VideoList: NextPage = () => {
  const router = useRouter();
  const { slug, videoId } = router.query as { slug: string; videoId: string };

  const endpoint =
    slug === "public"
      ? (api.video.getPublic as unknown as typeof api.video.get)
      : api.video.get;
  const { data: video, isLoading } = endpoint.useQuery(
    { videoId },
    {
      enabled: router.isReady,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error?.data?.code === "FORBIDDEN") return false;
        else return failureCount < 2;
      },
    }
  );

  if (!isLoading && !video) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <span className="max-w-[80%] text-center text-2xl font-medium">
          This recording is currently unavailable
        </span>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {video?.title ?? "Snapify | The Open Source Loom Alternative"}
        </title>
        <meta property="og:image" content={video?.thumbnailUrl} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="600" />
        <meta
          name="description"
          content="Share high-quality videos asynchronously and collaborate on your own schedule"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen w-screen flex-col items-center justify-center">
        {slug !== "public" ? (
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
            <div className="flex items-center justify-center">
              {video ? (
                <>
                  <VideoMoreMenu video={video} />
                  <ShareModal video={video} />
                </>
              ) : null}

              <>
                <Link href="/">
                  <span className="cursor-pointer rounded border border-[#0000001a] px-2 py-2 text-sm text-[#292d34] hover:bg-[#fafbfc]">
                    My Library
                  </span>
                </Link>
              </>
            </div>
          </div>
        ) : null}

        <div className="flex h-full w-full grow flex-col items-center justify-start overflow-auto bg-[#fbfbfb]">
          <div className="flex aspect-video max-h-[calc(100vh_-_169px)] w-full justify-center bg-black 2xl:max-h-[1160px]">
            {video?.video_url && (
              <>
                <video controls className="h-full w-full">
                  <source src={video.video_url} />
                  Your browser does not support the video tag.
                </video>
              </>
            )}
          </div>
          <div className="mb-10 mt-4 w-full max-w-[1800px] pl-[24px]">
            <div className="mb-4 flex flex-col">
              <div className="mb-4 flex flex-col">
                <span className="text-[18px] text-lg font-medium">
                  {video?.title ?? video?.id}
                </span>
                <span className="text-[18px] text-sm text-gray-800">
                  {video ? getTime(new Date(video.createdAt)) : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <VideoRecordModal />
    </>
  );
};

export default VideoList;
