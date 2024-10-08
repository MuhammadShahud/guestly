import { Module } from '@nestjs/common';
import { ContactSegmentsService } from './contact-segments.service';
import { ContactSegmentsController } from './contact-segments.controller';
import { contactSegmentSchema } from './entities/contact-segment.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ContactsModule } from 'src/contacts/contacts.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'ContactSegment', schema: contactSegmentSchema },
    ]),
    ContactsModule,
  ],
  controllers: [ContactSegmentsController],
  providers: [ContactSegmentsService],
  exports: [ContactSegmentsService],
})
export class ContactSegmentsModule {}
