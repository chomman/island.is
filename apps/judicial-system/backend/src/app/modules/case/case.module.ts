import { DataSourceConfig } from 'apollo-datasource'

import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { Logger, LOGGER_PROVIDER } from '@island.is/logging'
import { SmsService, SmsServiceOptions, SMS_OPTIONS } from '@island.is/nova-sms'
import { SigningService, SIGNING_OPTIONS } from '@island.is/dokobit-signing'
import { EmailService, EMAIL_OPTIONS } from '@island.is/email-service'

import { environment } from '../../../environments'
import { UserModule } from '../user'
import { Case, Notification } from './models'
import { CaseController } from './case.controller'
import { CaseService } from './case.service'

@Module({
  imports: [UserModule, SequelizeModule.forFeature([Case, Notification])],
  controllers: [CaseController],
  providers: [
    CaseService,
    {
      provide: SMS_OPTIONS,
      useValue: environment.smsOptions,
    },
    {
      provide: SmsService,
      useFactory: (options: SmsServiceOptions, logger: Logger) => {
        const smsService = new SmsService(options, logger)
        smsService.initialize({} as DataSourceConfig<{}>)
        return smsService
      },
      inject: [SMS_OPTIONS, LOGGER_PROVIDER],
    },
    {
      provide: SIGNING_OPTIONS,
      useValue: environment.signingOptions,
    },
    SigningService,
    {
      provide: EMAIL_OPTIONS,
      useValue: environment.emailOptions,
    },
    EmailService,
  ],
})
export class CaseModule {}
