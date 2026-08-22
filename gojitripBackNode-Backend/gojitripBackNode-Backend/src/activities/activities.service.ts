import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultActivities();
  }

  private async seedDefaultActivities() {
    try {
      const count = await this.prisma.activity.count();
      if (count === 0) {
        console.log('Seeding default Nepal activities & guides...');
        const defaults = [
          {
            activityName: 'Sarangkot Sunrise Paragliding Tandem',
            guideName: 'Rohan Thapa (FAI Certified Pilot)',
            guideContact: '+977-9806112233',
            pricing: 9500,
            duration: '30 Mins Flight (2 Hours Total)',
            difficultyLevel: 'Easy',
            availability: 'Daily',
            approvalStatus: 'Published',
            createdByName: 'Content Team',
            imageUrl:
              'https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=800&q=80',
          },
          {
            activityName: 'Muktinath Holy Pilgrimage Horse Ride',
            guideName: 'Pasang Tamang (Certified Mountain Guide)',
            guideContact: '+977-9846110022',
            pricing: 3500,
            duration: '2 Hours',
            difficultyLevel: 'Moderate',
            availability: 'Daily',
            approvalStatus: 'Published',
            createdByName: 'Content Team',
            imageUrl:
              'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
          },
          {
            activityName: 'Trishuli River White Water Rafting',
            guideName: 'Bikram Shrestha (Rescue Certified Guide)',
            guideContact: '+977-9851044321',
            pricing: 4500,
            duration: '3 Hours',
            difficultyLevel: 'Challenging',
            availability: 'Daily',
            approvalStatus: 'Published',
            createdByName: 'Content Team',
            imageUrl:
              'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
          },
          {
            activityName: 'Annapurna Circuit Poon Hill Trek',
            guideName: 'Kaji Sherpa (Senior Trekking Guide)',
            guideContact: '+977-9813245678',
            pricing: 18500,
            duration: '4 Days',
            difficultyLevel: 'Challenging',
            availability: 'Seasonal',
            approvalStatus: 'Published',
            createdByName: 'Content Team',
            imageUrl:
              'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
          },
        ];

        for (const item of defaults) {
          const { imageUrl, ...actData } = item;
          const created = await this.prisma.activity.create({ data: actData });
          if (imageUrl) {
            await this.prisma.media.create({
              data: {
                title: `${item.activityName} Photo`,
                fileType: 'Photo',
                category: 'Activities',
                url: imageUrl,
                fileSizeMb: 2.5,
                tags: ['Activity', 'Guide'],
                uploadedBy: 'Content Team',
                entityId: String(created.id),
                entityType: 'activity',
              },
            });
          }
        }
        console.log('Successfully seeded 4 default Nepal activities & guides!');
      }
    } catch (error) {
      console.error('Error seeding default activities:', error);
    }
  }

  async create(createActivityDto: CreateActivityDto) {
    const { imageUrl, photos, ...actData } = createActivityDto;
    const activity = await this.prisma.activity.create({
      data: {
        activityName: actData.activityName || 'New Activity',
        guideName: actData.guideName || 'N/A',
        guideContact: actData.guideContact || 'N/A',
        pricing: Number(actData.pricing) || 0,
        duration: actData.duration || 'N/A',
        difficultyLevel: actData.difficultyLevel || 'Easy',
        availability: actData.availability || 'Daily',
        approvalStatus: actData.approvalStatus || 'Draft',
        createdByName: actData.createdByName || 'API',
      },
    });

    const imgToSave = imageUrl || (photos && photos[0]);
    if (imgToSave) {
      await this.prisma.media.create({
        data: {
          title: `${activity.activityName} Photo`,
          fileType: 'Photo',
          category: 'Activities',
          url: imgToSave,
          fileSizeMb: 2.0,
          tags: ['Activity'],
          uploadedBy: 'Content Team',
          entityId: String(activity.id),
          entityType: 'activity',
        },
      });
    }

    return this.findOne(activity.id);
  }

  async findAll() {
    const count = await this.prisma.activity.count();
    if (count === 0) {
      await this.seedDefaultActivities();
    }

    const activities = await this.prisma.activity.findMany();
    const activitiesWithImages = await Promise.all(
      activities.map(async (activity) => {
        const mediaList = await this.prisma.media.findMany({
          where: {
            entityId: String(activity.id),
            entityType: 'activity',
          },
          orderBy: { uploadedAt: 'desc' },
        });
        const photos = mediaList.map((m) => m.url);
        const imageUrl = photos[0] || null;
        return { ...activity, imageUrl, photos };
      }),
    );
    return activitiesWithImages;
  }

  async findOne(id: number) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) return null;
    const mediaList = await this.prisma.media.findMany({
      where: {
        entityId: String(id),
        entityType: 'activity',
      },
      orderBy: { uploadedAt: 'desc' },
    });
    const photos = mediaList.map((m) => m.url);
    const imageUrl = photos[0] || null;
    return { ...activity, imageUrl, photos };
  }

  async update(id: number, updateActivityDto: UpdateActivityDto) {
    const { imageUrl, photos, ...actData } = updateActivityDto;
    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        ...(actData.activityName && { activityName: actData.activityName }),
        ...(actData.guideName && { guideName: actData.guideName }),
        ...(actData.guideContact && { guideContact: actData.guideContact }),
        ...(actData.pricing !== undefined && { pricing: Number(actData.pricing) }),
        ...(actData.duration && { duration: actData.duration }),
        ...(actData.difficultyLevel && { difficultyLevel: actData.difficultyLevel }),
        ...(actData.availability && { availability: actData.availability }),
        ...(actData.approvalStatus && { approvalStatus: actData.approvalStatus }),
      },
    });

    const imgToSave = imageUrl || (photos && photos[0]);
    if (imgToSave) {
      await this.prisma.media.create({
        data: {
          title: `${updated.activityName} Photo`,
          fileType: 'Photo',
          category: 'Activities',
          url: imgToSave,
          fileSizeMb: 2.0,
          tags: ['Activity'],
          uploadedBy: 'Content Team',
          entityId: String(updated.id),
          entityType: 'activity',
        },
      });
    }

    return this.findOne(updated.id);
  }

  remove(id: number) {
    return this.prisma.activity.delete({ where: { id } });
  }
}
