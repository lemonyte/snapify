import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { getFilestore } from "~/utils/filestore";
import { verifySignature } from "@upstash/qstash/nextjs";
import type { Video } from "~/server/db";

export default verifySignature(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const expiredVideos = await db.findMany<Video>({
    "shareLinkExpiresAt?le": new Date().getTime(),
    delete_after_link_expires: true,
    sharing: true,
  });

  const updatedVideos = await db.updateMany(
    {
      "shareLinkExpiresAt?le": new Date().getTime(),
      delete_after_link_expires: false,
      sharing: true,
    },
    { sharing: false }
  );

  const expiredVideoIds = expiredVideos.map((x) => x.id);
  expiredVideos.map(async (video) => {
    return await getFilestore().delete(video.id)
  });

  const query = expiredVideoIds.map(x => ({ id: x }));
  const deletedVideos = await db.deleteMany(query);

  res.status(200).json({ expiredVideos, updatedVideos, deletedVideos });
});
