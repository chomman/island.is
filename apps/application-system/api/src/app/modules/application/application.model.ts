import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ApplicationTypes } from '@island.is/application/core'

@Table({
  tableName: 'application',
  timestamps: true,
  indexes: [
    {
      fields: ['type_id', 'applicant'],
    },
  ],
})
export class Application extends Model<Application> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  @ApiProperty()
  id!: string

  @CreatedAt
  @ApiProperty()
  created!: Date

  @UpdatedAt
  @ApiProperty()
  modified!: Date

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  applicant!: string

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  @ApiProperty()
  assignees!: string[]

  @Column({
    type: DataType.STRING,
  })
  @ApiProperty()
  state!: string

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
  })
  @ApiPropertyOptional()
  attachments?: object

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: Object.values(ApplicationTypes),
  })
  @ApiProperty({ enum: ApplicationTypes })
  typeId!: string

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
    allowNull: false,
  })
  @ApiProperty()
  answers!: object

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
    allowNull: false,
  })
  @ApiProperty()
  externalData!: object
}
