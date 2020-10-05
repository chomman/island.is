import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
  Inject,
  Req,
  ForbiddenException,
  Query,
  ConflictException,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'

import { LOGGER_PROVIDER, Logger } from '@island.is/logging'
import { SigningServiceResponse } from '@island.is/dokobit-signing'
import { CaseState } from '@island.is/judicial-system/types'

import { JwtAuthGuard } from '../auth'
import { UserService } from '../user'
import { CreateCaseDto, TransitionCaseDto, UpdateCaseDto } from './dto'
import { Case, Notification } from './models'
import { CaseService } from './case.service'
import { CaseValidationPipe } from './case.pipe'
import { transitionCase as transitionUpdate } from './case.state'

@UseGuards(JwtAuthGuard)
@Controller('api')
@ApiTags('cases')
export class CaseController {
  constructor(
    private readonly caseService: CaseService,
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(LOGGER_PROVIDER)
    private readonly logger: Logger,
  ) {}

  @Post('case')
  @ApiCreatedResponse({ type: Case, description: 'Creates a new case' })
  create(
    @Body(new CaseValidationPipe())
    caseToCreate: CreateCaseDto,
  ): Promise<Case> {
    return this.caseService.create(caseToCreate)
  }

  @Put('case/:id')
  @ApiOkResponse({ type: Case, description: 'Updates an existing case' })
  async update(
    @Param('id') id: string,
    @Body() caseToUpdate: UpdateCaseDto,
  ): Promise<Case> {
    const { numberOfAffectedRows, updatedCase } = await this.caseService.update(
      id,
      caseToUpdate,
    )

    if (numberOfAffectedRows === 0) {
      throw new NotFoundException(`A case with the id ${id} does not exist`)
    }

    return updatedCase
  }

  @Put('case/:id/state')
  @ApiOkResponse({
    type: Case,
    description: 'Transitions an existing case to a new state',
  })
  async transition(
    @Param('id') id: string,
    @Body() transition: TransitionCaseDto,
    @Req() req,
  ): Promise<Case> {
    const existingCase = await this.findCaseById(id)

    const user = await this.userService.findByNationalId(req.user.nationalId)

    const update = transitionUpdate(transition, existingCase, user)

    const { numberOfAffectedRows, updatedCase } = await this.caseService.update(
      id,
      // existingCase.modified, Uncomment when client is ready to send last modified timestamp with all updates
      update,
    )

    if (numberOfAffectedRows === 0) {
      throw new ConflictException(
        `A more recent version exists of the case with id ${id}`,
      )
    }

    return updatedCase
  }

  @Get('cases')
  @ApiOkResponse({
    type: Case,
    isArray: true,
    description: 'Gets all existing cases',
  })
  getAll(): Promise<Case[]> {
    return this.caseService.getAll()
  }

  @Get('case/:id')
  @ApiOkResponse({ type: Case, description: 'Gets an existing case' })
  async getById(@Param('id') id: string): Promise<Case> {
    return this.findCaseById(id)
  }

  @Post('case/:id/notification')
  @ApiCreatedResponse({
    type: Notification,
    description: 'Sends a new notification for an existing case',
  })
  async sendNotificationByCaseId(
    @Param('id') id: string,
    @Req() req,
  ): Promise<Notification> {
    const existingCase = await this.findCaseById(id)

    if (
      existingCase.state !== CaseState.DRAFT &&
      existingCase.state !== CaseState.SUBMITTED
    ) {
      throw new ForbiddenException(
        `Cannot send a notification for a case in state ${existingCase.state}`,
      )
    }

    const user = await this.userService.findByNationalId(req.user.nationalId)

    return this.caseService.sendNotificationByCaseId(existingCase, user)
  }

  @Get('case/:id/notifications')
  @ApiOkResponse({
    type: Notification,
    isArray: true,
    description: 'Gets all existing notifications for an existing case',
  })
  async getAllNotificationsById(
    @Param('id') id: string,
  ): Promise<Notification[]> {
    const existingCase = await this.findCaseById(id)

    return this.caseService.getAllNotificationsByCaseId(existingCase)
  }

  @Post('case/:id/signature')
  @ApiCreatedResponse({
    type: SigningServiceResponse,
    description: 'Requests a signature for an existing case',
  })
  async requestSignature(
    @Param('id') id: string,
    @Req() req,
  ): Promise<SigningServiceResponse> {
    const existingCase = await this.findCaseById(id)

    if (
      existingCase.state !== CaseState.ACCEPTED &&
      existingCase.state !== CaseState.REJECTED
    ) {
      throw new ForbiddenException(
        `Cannot sign a ruling for a case in state ${existingCase.state}`,
      )
    }

    const user = await this.userService.findByNationalId(req.user.nationalId)

    return this.caseService.requestSignature(existingCase, user)
  }

  @Get('case/:id/signature')
  @ApiOkResponse({
    type: Case,
    description:
      'Confirms a previously requested signature for an existing case',
  })
  async confirmSignature(
    @Param('id') id: string,
    @Query('documentToken') documentToken: string,
  ): Promise<Case> {
    const existingCase = await this.findCaseById(id)

    if (
      existingCase.state !== CaseState.ACCEPTED &&
      existingCase.state !== CaseState.REJECTED
    ) {
      throw new ForbiddenException(
        `Cannot confirm a ruling signature for a case in state ${existingCase.state}`,
      )
    }

    return this.caseService.confirrmSignature(existingCase, documentToken)
  }

  private async findCaseById(id: string) {
    const existingCase = await this.caseService.findById(id)

    if (!existingCase) {
      throw new NotFoundException(`A case with the id ${id} does not exist`)
    }

    return existingCase
  }
}
