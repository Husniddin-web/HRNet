import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as fs from "fs/promises"; // Asynchronous FS
import * as path from "path";
import * as uuid from "uuid";
import { Express as ExpressType } from "express";

@Injectable()
export class FileUploadService {
  private readonly uploadPath = path.resolve(__dirname, "..", "..", "upload");

  async saveFile(file: any): Promise<string> {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });

      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuid.v4()}${fileExtension}`;
      await fs.writeFile(path.join(this.uploadPath, fileName), file.buffer);

      return fileName;
    } catch (error) {
      console.error("File upload error:", error);
      throw new InternalServerErrorException("Failed to save file");
    }
  }
}
