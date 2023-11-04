import { z } from "zod";

import { createTRPCRouter, procedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { VideoMetadata } from "~/server/db";
import { deleteVideo } from "~/utils/filestore";

export const videoRouter = createTRPCRouter({
  getAll: procedure.query(async ({ ctx: { db } }) => {
    const videos = await db.findMany<VideoMetadata>();

    const videosWithThumbnailUrl = await Promise.all(
      videos.map((video) => {
        const thumbnailUrl = `/api/private/thumbnail?id=${video.id}`;
        return { ...video, thumbnailUrl };
      })
    );

    return videosWithThumbnailUrl;
  }),
  get: procedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const video = await db.findUnique<VideoMetadata>(input.videoId);
      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const signedUrl = `/api/private/video?id=${video.id}`;
      const thumbnailUrl = `/api/private/thumbnail?id=${video.id}`;

      return {
        ...video,
        video_url: signedUrl,
        thumbnailUrl,
      };
    }),
  getPublic: procedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const video = await db.findUnique<VideoMetadata>(input.videoId);
      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!video.sharing) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const signedUrl = `/api/public/video?id=${video.id}`;
      const thumbnailUrl = `/api/public/thumbnail?id=${video.id}`;

      return {
        ...video,
        video_url: signedUrl,
        thumbnailUrl,
      };
    }),
  createVideo: procedure.mutation(async ({ ctx: { db } }) => {
    const id = crypto.randomUUID();
    const video = await db.create<VideoMetadata>({
      key: id,
      id,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      sharing: false,
      delete_after_link_expires: false,
      linkShareSeo: false,
      shareLinkExpiresAt: null,
      title: "",
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
    .mutation(async ({ ctx: { db }, input }) => {
      const { videoId: id } = input;
      const deleteMetadata = await db.deleteMany({
        id: input.videoId,
      });

      if (deleteMetadata.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const deleteVideoObject = await deleteVideo(id);

      return {
        success: true,
        deleteVideo: deleteMetadata,
        deleteVideoObject,
      };
    }),
});
