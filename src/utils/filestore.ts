import { Drive } from "deta";
import generateThumbnail from "~/utils/generateThumbnail";
import type { MutableRefObject } from "react";

export function getVideoFilestore() {
    return Drive("videos");
}

export function getThumbnailFilestore() {
    return Drive("thumbnails");
}

export async function getVideo(id: string) {
  return await getVideoFilestore().get(`${id}.webm`);
}

export async function getThumbnail(id: string) {
  return await getThumbnailFilestore().get(`${id}.png`);
}

export async function deleteVideo(id: string) {
  await getVideoFilestore().delete(`${id}.webm`);
  await getThumbnailFilestore().delete(`${id}.png`);
}

export async function uploadVideo(id: string, blob: Blob, videoRef: MutableRefObject<HTMLVideoElement | null>) {
    await getVideoFilestore().put(`${id}.webm`, { data: Buffer.from(await blob.arrayBuffer()), contentType: blob.type });
    if (videoRef.current) {
      const thumbnail = await generateThumbnail(videoRef.current)
      if (thumbnail) {
        await getThumbnailFilestore().put(`${id}.png`, { data: Buffer.from(await thumbnail?.arrayBuffer()), contentType: thumbnail.type });
      }
    }
}
