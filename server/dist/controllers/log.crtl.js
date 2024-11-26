"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLogs = void 0;
const file_manage_1 = require("../utils/file_manage");
const fetchLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { start = 1, end = 10 } = req.body;
        const { files } = yield (0, file_manage_1.readDir)(); //sorted files list 
        const recordsPerFile = 100; // Number of records per file
        const result = [];
        let fileData = [];
        // Calculate file indices based on start and end
        const startFileIndex = Math.floor(start / recordsPerFile);
        const endFileIndex = Math.floor(end / recordsPerFile);
        for (let i = startFileIndex; i <= endFileIndex; i++) {
            const fileName = files[i];
            if (!fileName)
                continue; // Skip if the file doesn't exist
            fileData = (yield (0, file_manage_1.readData)(`log/${fileName}`)) || [];
            const fileStartIndex = i * recordsPerFile;
            const fileEndIndex = fileStartIndex + fileData.length - 1;
            // Extract relevant data from the current file
            const extractStart = Math.max(start, fileStartIndex) - fileStartIndex;
            const extractEnd = Math.min(end, fileEndIndex) - fileStartIndex;
            if (extractStart <= extractEnd) {
                result.push(...fileData.slice(extractStart, extractEnd + 1));
            }
            // Stop early if enough data is collected
            if (result.length >= end - start + 1)
                break;
        }
        res.status(200).json({ data: result, total: (files.length - 1) * 100 + fileData.length });
        let data = (yield (0, file_manage_1.readData)(`log/${files[0]}`)) || [];
    }
    catch (err) {
        res.status(500).json({ message: 'Sever error' });
    }
});
exports.fetchLogs = fetchLogs;
