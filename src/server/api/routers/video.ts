import { z } from "zod";

import {
  createTRPCRouter,
  procedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { Video } from "~/server/db";

export const videoRouter = createTRPCRouter({
  getAll: procedure.query(async ({ ctx: { db } }) => {
    const videos = (await db.findMany<Video>()).map((video) => {
      return { ...video, shareLinkExpiresAt: new Date(video.shareLinkExpiresAt) };
    });

    const videosWithThumbnailUrl = await Promise.all(
      videos.map((video) => {
        const thumbnailUrl = `/api/video?id=${video.id}.png`;
        return { ...video, thumbnailUrl };
      })
    );

    return videosWithThumbnailUrl;
  }),
  get: procedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const video = await db.findUnique<Video>(input.videoId);
      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const shareLinkExpiresAt = new Date(video.shareLinkExpiresAt);

      const signedUrl = `/api/video?id=${video.id}.webm`;

      const thumbnailUrl = `/api/video?id=${video.id}.png`;

      return { ...video, video_url: signedUrl, thumbnailUrl, shareLinkExpiresAt };
    }),
  createVideo: procedure
    .mutation(async ({ ctx: { db } }) => {
      const id = crypto.randomUUID();
      const video = await db.create<Video>({
        key: id,
        id,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        sharing: false,
        delete_after_link_expires: false,
        linkShareSeo: false,
      });

      return video;
    }),
  setSharing: procedure
    .input(z.object({ videoId: z.string(), sharing: z.boolean() }))
    .mutation(async ({ ctx: { db }, input }) => {
      const updateVideo = await db.updateMany(
        { id: input.videoId },
        { sharing: input.sharing }
      );

      if (updateVideo.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return {
        success: true,
        updateVideo,
      };
    }),
  setDeleteAfterLinkExpires: procedure
    .input(
      z.object({ videoId: z.string(), delete_after_link_expires: z.boolean() })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const updateVideo = await db.updateMany(
        {
          id: input.videoId,
        },
        {
          delete_after_link_expires: input.delete_after_link_expires,
        }
      );

      if (updateVideo.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return {
        success: true,
        updateVideo,
      };
    }),
  setShareLinkExpiresAt: procedure
    .input(
      z.object({
        videoId: z.string(),
        shareLinkExpiresAt: z.nullable(z.date()),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const updateVideo = await db.updateMany(
        {
          id: input.videoId,
        },
        {
          shareLinkExpiresAt: input.shareLinkExpiresAt?.getTime(),
        }
      );

      if (updateVideo.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return {
        success: true,
        updateVideo,
      };
    }),
  renameVideo: procedure
    .input(
      z.object({
        videoId: z.string(),
        title: z.string(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const updateVideo = await db.updateMany(
        {
          id: input.videoId,
        },
        {
          title: input.title,
        }
      );

      if (updateVideo.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return {
        success: true,
        updateVideo,
      };
    }),
  deleteVideo: procedure
    .input(
      z.object({
        videoId: z.string(),
      })
    )
    .mutation(async ({ ctx: { db, filestore }, input }) => {
      const deleteVideo = await db.deleteMany({
        id: input.videoId,
      });

      if (deleteVideo.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const deleteVideoObject = await filestore.delete(input.videoId);

      const deleteThumbnailObject = await filestore.delete(
        input.videoId + ".png"
      );

      return {
        success: true,
        deleteVideo,
        deleteVideoObject,
        deleteThumbnailObject,
      };
    }),
});
