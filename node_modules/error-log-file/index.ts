import { createWriteStream } from "fs";

export = (
  log: string,
  {
    fileName = "error.log",
    date = new Date()
  }: { fileName?: string; date?: Date } = {}
): any => {
  const stream = createWriteStream(fileName, { flags: "a" });
  stream.write(
    `\n[${date.getFullYear()}-${date.getMonth()}-${date.getDate()}|${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}] ${log.replace(
      /(\r\n\t|\n|\r\t)/gm,
      " ; "
    )}`
  );
  stream.end();
};
