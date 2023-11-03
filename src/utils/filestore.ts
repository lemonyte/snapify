import { Drive } from "deta";
import generateThumbnail from "~/utils/generateThumbnail";
import type { MutableRefObject } from "react";

export function getFilestore() {
    return Drive("videos");
}

export async function uploadVideo(id: string, blob: Blob, videoRef: MutableRefObject<HTMLVideoElement | null>) {
    const filestore = getFilestore();
    await filestore.put(`${id}.webm`, { data: Buffer.from(await blob.arrayBuffer()), contentType: blob.type });
    if (videoRef.current) {
      const thumbnail = await generateThumbnail(videoRef.current)
      if (thumbnail) {
        await filestore.put(`${id}.png`, { data: Buffer.from(await thumbnail?.arrayBuffer()), contentType: "image/png" });
      }
    }
}
