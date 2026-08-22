import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuidesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultGuides();
  }

  private async seedDefaultGuides() {
    try {
      const count = await this.prisma.guide.count();
      if (count === 0) {
        console.log('Seeding default Nepal guides...');
        const defaults = [
          {
            fullName: 'Pasang Tamang',
            contactNumber: '+977-9846110022',
            licenseNumber: 'NPL-MTN-8848',
            languages: ['English', 'Nepali', 'Hindi'],
            experienceYears: 8,
            specialization: 'High Altitude Trekking & Climbing',
            dailyRate: 3500,
            bio: 'Certified Annapurna & Everest Base Camp trekking guide with over 8 years experience leading international groups.',
            photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
            approvalStatus: 'Published',
            createdByName: 'Content Team',
          },
          {
            fullName: 'Rohan Thapa',
            contactNumber: '+977-9806112233',
            licenseNumber: 'NPL-PARA-102',
            languages: ['English', 'Nepali'],
            experienceYears: 6,
            specialization: 'FAI Certified Paragliding Tandem Pilot',
            dailyRate: 5000,
            bio: 'Expert paragliding pilot operating in Sarangkot, Pokhara with 2000+ successful tandem flights.',
            photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            approvalStatus: 'Published',
            createdByName: 'Content Team',
          },
          {
            fullName: 'Bikram Shrestha',
            contactNumber: '+977-9851044321',
            licenseNumber: 'NPL-RFT-404',
            languages: ['English', 'Nepali', 'Japanese'],
            experienceYears: 10,
            specialization: 'White Water Rafting & Kayak Rescue Specialist',
            dailyRate: 4000,
            bio: 'Senior river captain certified in swiftwater rescue and Grade 4/5 rapids navigation.',
            photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
            approvalStatus: 'Published',
            createdByName: 'Content Team',
          },
        ];

        for (const guideData of defaults) {
          await this.prisma.guide.create({ data: guideData });
        }
        console.log('Successfully seeded 3 default Nepal guides!');
      }
    } catch (error) {
      console.error('Error seeding default guides:', error);
    }
  }

  create(createGuideDto: CreateGuideDto) {
    return this.prisma.guide.create({
      data: {
        fullName: createGuideDto.fullName,
        contactNumber: createGuideDto.contactNumber,
        licenseNumber: createGuideDto.licenseNumber || null,
        languages: createGuideDto.languages || ['English', 'Nepali'],
        experienceYears: createGuideDto.experienceYears ? Number(createGuideDto.experienceYears) : null,
        specialization: createGuideDto.specialization || 'Mountain Guide',
        dailyRate: createGuideDto.dailyRate ? Number(createGuideDto.dailyRate) : null,
        bio: createGuideDto.bio || null,
        photoUrl: createGuideDto.photoUrl || null,
        approvalStatus: createGuideDto.approvalStatus || 'Published',
        createdByName: createGuideDto.createdByName || 'Admin',
      },
    });
  }

  async findAll() {
    const count = await this.prisma.guide.count();
    if (count === 0) {
      await this.seedDefaultGuides();
    }
    return this.prisma.guide.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.guide.findUnique({ where: { id } });
  }

  update(id: number, updateGuideDto: UpdateGuideDto) {
    return this.prisma.guide.update({
      where: { id },
      data: {
        ...(updateGuideDto.fullName && { fullName: updateGuideDto.fullName }),
        ...(updateGuideDto.contactNumber && { contactNumber: updateGuideDto.contactNumber }),
        ...(updateGuideDto.licenseNumber !== undefined && { licenseNumber: updateGuideDto.licenseNumber }),
        ...(updateGuideDto.languages && { languages: updateGuideDto.languages }),
        ...(updateGuideDto.experienceYears !== undefined && { experienceYears: updateGuideDto.experienceYears ? Number(updateGuideDto.experienceYears) : null }),
        ...(updateGuideDto.specialization && { specialization: updateGuideDto.specialization }),
        ...(updateGuideDto.dailyRate !== undefined && { dailyRate: updateGuideDto.dailyRate ? Number(updateGuideDto.dailyRate) : null }),
        ...(updateGuideDto.bio !== undefined && { bio: updateGuideDto.bio }),
        ...(updateGuideDto.photoUrl !== undefined && { photoUrl: updateGuideDto.photoUrl }),
        ...(updateGuideDto.approvalStatus && { approvalStatus: updateGuideDto.approvalStatus }),
      },
    });
  }

  remove(id: number) {
    return this.prisma.guide.delete({ where: { id } });
  }
}
