import type { NextApiRequest, NextApiResponse } from "next";
import { deleteVideo } from "~/utils/filestore";
import { db, type VideoMetadata } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const expiredVideos = await db.findMany<VideoMetadata>({
    "shareLinkExpiresAt?lte": new Date().getTime(),
    delete_after_link_expires: true,
    sharing: true,
  });

  const updatedVideos = await db.updateMany<VideoMetadata>(
    {
      "shareLinkExpiresAt?lte": new Date().getTime(),
      delete_after_link_expires: false,
      sharing: true,
    },
    { sharing: false }
  );

  expiredVideos.map(async (video) => {
    await deleteVideo(video.id);
  });

  const deletedVideos = expiredVideos.length !== 0 ? await db.deleteMany<VideoMetadata>(expiredVideos.map((video) => ({ id: video.id }))) : [];

  res.status(200).json({ expiredVideos, updatedVideos, deletedVideos });
}
