import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  create(createMediaDto: CreateMediaDto) {
    return this.prisma.media.create({ data: createMediaDto as any });
  }

  upload(uploadMediaDto: UploadMediaDto) {
    return this.prisma.media.create({
      data: {
        title: uploadMediaDto.title,
        url: uploadMediaDto.url,
        category: uploadMediaDto.category,
        entityId: uploadMediaDto.entityId,
        entityType: uploadMediaDto.entityType,
        fileType: 'Photo',
        fileSizeMb: 1.0,
        tags: [],
        uploadedBy: 'System',
      },
    });
  }

  findAll() {
    return this.prisma.media.findMany();
  }

  findOne(id: number) {
    return this.prisma.media.findUnique({ where: { id } });
  }

  update(id: number, updateMediaDto: UpdateMediaDto) {
    return this.prisma.media.update({
      where: { id },
      data: updateMediaDto as any,
    });
  }

  remove(id: number) {
    return this.prisma.media.delete({ where: { id } });
  }
}
