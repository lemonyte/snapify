import { Readable } from "stream";
import { getFilestore } from "~/utils/filestore";
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
  const filestore = getFilestore();
  if (req.method === "GET") {
    if (!req.query.id) {
      res.status(400).end();
      return;
    }
    const blob = await filestore.get(req.query.id as string);
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
  } else if (req.method === "PUT") {
    res.status(418).send("Not implemented");
    // console.log("PUT", req.headers["content-type"])
    // console.log("reading body")
    // const data = req.read() as Buffer;
    // console.log("putting file")
    // const result = await filestore.put(req.query.id as string, {
    //   contentType: req.headers["content-type"],
    //   data: data,
    // })
    // res.status(201).send(result);
  } else {
    res.status(405).end();
  }
}
