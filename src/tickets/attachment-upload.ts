import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join, relative, sep } from 'path';
import { diskStorage } from 'multer';

export const ATTACHMENT_UPLOAD_ROOT = join(process.cwd(), 'uploads', 'tickets');
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

const ATTACHMENT_ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/heic',
  'image/heif',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const ATTACHMENT_ALLOWED_EXTENSIONS = new Set(['.heic', '.heif', '.jpg', '.jpeg', '.pdf', '.png']);

export interface AttachmentUploadFile {
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
}

interface AttachmentUploadInputFile {
  originalname: string;
  mimetype: string;
}

export function createAttachmentUploadOptions() {
  return {
    storage: diskStorage({
      destination: (_req: unknown, _file: AttachmentUploadInputFile, cb: (error: Error | null, destination: string) => void) => {
        ensureAttachmentUploadRoot();
        cb(null, ATTACHMENT_UPLOAD_ROOT);
      },
      filename: (_req: unknown, file: AttachmentUploadInputFile, cb: (error: Error | null, filename: string) => void) => {
        cb(null, buildStoredAttachmentFileName(file.originalname));
      },
    }),
    limits: {
      fileSize: ATTACHMENT_MAX_BYTES,
      files: 1,
    },
    fileFilter: (_req: unknown, file: AttachmentUploadInputFile, cb: (error: Error | null, acceptFile: boolean) => void) => {
      if (!isSupportedAttachmentFile(file.originalname, file.mimetype)) {
        cb(new BadRequestException('Only png, jpg, jpeg, heic, and pdf attachments are allowed'), false);
        return;
      }

      cb(null, true);
    },
  };
}

export function isSupportedAttachmentFile(originalname: string, mimetype: string) {
  const extension = getAttachmentFileExtension(originalname);

  return ATTACHMENT_ALLOWED_EXTENSIONS.has(extension) && ATTACHMENT_ALLOWED_MIME_TYPES.has(mimetype.toLowerCase());
}

export function buildAttachmentFileUrl(filePath: string) {
  const normalizedPath = relative(process.cwd(), filePath).split(sep).join('/');
  return `/${normalizedPath}`;
}

export function removeStoredAttachmentFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  rmSync(filePath, { force: true });
}

function ensureAttachmentUploadRoot() {
  mkdirSync(ATTACHMENT_UPLOAD_ROOT, { recursive: true });
}

function buildStoredAttachmentFileName(originalname: string) {
  const extension = getAttachmentFileExtension(originalname);
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const suffix = randomBytes(8).toString('hex');

  return `attachment-${stamp}-${suffix}${extension}`;
}

function getAttachmentFileExtension(originalname: string) {
  if (!originalname) {
    return '';
  }

  const dotIndex = originalname.lastIndexOf('.');
  if (dotIndex < 0) {
    return '';
  }

  return originalname.slice(dotIndex).toLowerCase();
}
