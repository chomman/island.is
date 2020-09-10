import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { UserIdentity } from './user-identity.model'
import { UserIdentityDto } from './dto/user-identity.dto'
import { Logger, LOGGER_PROVIDER } from '@island.is/logging'
import { Counter } from 'prom-client'
import { Claim } from './claim.model'
import { Sequelize } from 'sequelize-typescript'

@Injectable()
export class UserIdentitiesService {
  applicationsRegistered = new Counter({
    name: 'apps_registered2',
    labelNames: ['res1'],
    help: 'Number of applications',
  }) // TODO: How does this work?

  constructor(
    private sequelize: Sequelize,
    @InjectModel(UserIdentity)
    private userIdentityModel: typeof UserIdentity,
    @Inject(LOGGER_PROVIDER)
    private logger: Logger,
  ) {}

  async create(userIdentity: UserIdentityDto): Promise<UserIdentity> {
    this.logger.debug(
      `Creating user identity with subjectIdId - ${userIdentity.subjectId}`,
    )
    this.applicationsRegistered.labels('res1').inc()

    userIdentity.profileId = await this.findLinkableProfileId(userIdentity);

    try {
      return this.sequelize.transaction(t => {
        return this.userIdentityModel.create(userIdentity, {include: [Claim], transaction: t})
      })
    } catch {
      this.logger.warn('Error when executing transaction, rollbacked.');
    }
  }

  async findBySubjectId(subjectId: string): Promise<UserIdentity> {
    this.logger.debug(`Finding user identity for subjectId - "${subjectId}"`)
    return this.userIdentityModel.findOne({
      where: { subjectId },
      include: [Claim]
    })
  }

  private async findLinkableProfileId(userIdentity: UserIdentityDto) : Promise<string> {
    // For now we assume that if an identity exists with a 'natreg' claim, we want
    // to link its profile to the new identity.
    // TODO: Also check 'nat' claim.
    // TODO: We may want to consider which external providers were used, and only allow
    // profile linking for providers with a certain trust level.
    const natreg = userIdentity.claims.find(c => c.type == 'natreg') // TODO: Claim name in environment?

    if (natreg) {
        const linkedIdentity = await this.userIdentityModel.findOne({
          include: [{
            model: Claim,
            where: { type: 'natreg', value: natreg.value} // TODO: Claim name in environment?
          }]
        })

        return linkedIdentity.profileId;
    }
  }

  async findByProviderSubjectId(provider: string, subjectId: string): Promise<UserIdentity> {
    this.logger.debug(`Finding user identity for provider "${provider}" and subjectId - "${subjectId}"`)
    return this.userIdentityModel.findOne({
      where: { providerName: provider, providerSubjectId: subjectId },
      include: [Claim]
    })
  }
}
