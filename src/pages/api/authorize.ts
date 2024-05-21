import type { NextApiRequest, NextApiResponse } from "next";
import { compare, genSalt, hash } from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, method, body } = req;
  console.log(body.password);

  switch (method) {
    case "POST":
      /* genSalt(10, (err, salt) => {
        if (err) {
        }
        hash(body.password, salt, (err, hash) => {
          if (err) {
          }
          console.log(hash);
        });
      }); */
      compare(body.password, process.env.PASSWORD as string, (err, result) => {
        if (err) {
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
        if (result) {
          res.status(200);
        } else {
          res.status(401);
        }
        res.end();
      });
      break;
  }
}
