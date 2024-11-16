import { Request, Response } from 'express';
import { readData, readDir } from '../utils/file_manage';



export const fetchLogs = async (req: Request, res: Response) => {
  try {
    const { start = 1, end = 10 } = req.body;
    const { files } = await readDir(); //sorted files list 
    const recordsPerFile = 100; // Number of records per file
    const result: any[] = [];
    let fileData = [];

    // Calculate file indices based on start and end
    const startFileIndex = Math.floor(start / recordsPerFile);
    const endFileIndex = Math.floor(end / recordsPerFile);

    for (let i = startFileIndex; i <= endFileIndex; i++) {
      const fileName = files[i];
      if (!fileName) continue; // Skip if the file doesn't exist

      fileData = (await readData(`log/${fileName}`)) || [];
      const fileStartIndex = i * recordsPerFile;
      const fileEndIndex = fileStartIndex + fileData.length - 1;

      // Extract relevant data from the current file
      const extractStart = Math.max(start, fileStartIndex) - fileStartIndex;
      const extractEnd = Math.min(end, fileEndIndex) - fileStartIndex;

      if (extractStart <= extractEnd) {
        result.push(...fileData.slice(extractStart, extractEnd + 1));
      }

      // Stop early if enough data is collected
      if (result.length >= end - start + 1) break;
    }

    res.status(200).json({ data: result, total: (files.length - 1) * 100 + fileData.length });




    let data = (await readData(`log/${files[0]}`)) || [];



  } catch (err) {
    res.status(500).json({ message: 'Sever error' });
  }

};