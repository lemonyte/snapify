import { Readable } from "stream";
import { getVideo, getThumbnail } from "~/utils/filestore";
import { db, type VideoMetadata } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug, filetype, id } = req.query as { slug: string; filetype: string, id: string };
  if (req.method === "GET") {
    if (!["public", "private"].includes(slug) || !["video", "thumbnail"].includes(filetype)) {
      res.status(404).end();
      return;
    }
    if (!id) {
      res.status(400).end();
      return;
    }
    const metadata = await db.findUnique<VideoMetadata>(id);
    if (slug === "public" && !metadata?.sharing) {
      res.status(403).end();
      return;
    }
    const blob = filetype === "video" ? await getVideo(id) : await getThumbnail(id);
    if (!blob) {
      res.status(404).end();
      return;
    }
    const readable = Readable.from(Buffer.from(await blob.arrayBuffer()));
    res.status(200).setHeader("Content-Type", blob.type);
    await new Promise(function (resolve) {
      readable.pipe(res);
      readable.on("end", resolve);
    });
  } else {
    res.status(405).end();
  }
}
