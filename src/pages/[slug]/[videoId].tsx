import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { getTime } from "~/utils/getTime";
import VideoRecordModal from "~/components/VideoRecordModal";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import React, { useState, useEffect } from "react";

const VideoList: NextPage = () => {
  const router = useRouter();
  const { slug, videoId } = router.query as { slug: string; videoId: string };
  const [aspectRatio, setAspectRatio] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setAspectRatio(screen.height / screen.width);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
    <div className="flex h-screen flex-col">
      <Head>
        <title>
          {video?.title || "Snapify | The Open Source Loom Alternative"}
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
      <Header isPublic={slug !== "private"} video={video} />
      <main className="flex w-screen flex-grow flex-col items-center justify-center">
        <div className="flex h-full w-full grow flex-col items-center justify-start overflow-auto bg-[#fbfbfb]">
          <div
            className={`flex max-h-[calc(100vh-62px)] w-screen justify-center`}
            style={{ height: `calc(${aspectRatio}*100vw)` }}
          >
            {video?.video_url ? (
              <video
                controls
                className="h-full max-h-[calc(100vh-62px)] w-full bg-black"
                style={{ height: `calc(${aspectRatio}*100vw)` }}
              >
                <source src={video.video_url} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div
                className="flex max-h-[calc(100vh-62px)] w-screen flex-col justify-center bg-black text-gray-400 text-center text-xl"
                style={{ height: `calc(${aspectRatio}*100vw)` }}
              >
                Loading...
              </div>
            )}
          </div>
          <div className="my-4 w-full px-[24px]">
            <div className="mb-4 flex flex-col">
              <span className="text-[18px] text-lg font-medium">
                {video ? video.title || video.id : "Loading..."}
              </span>
              <span className="text-[18px] text-sm text-gray-800">
                {video ? getTime(new Date(video.createdAt)) : "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <VideoRecordModal />
    </div>
  );
};

export default VideoList;
