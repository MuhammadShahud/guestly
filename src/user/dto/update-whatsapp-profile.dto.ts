import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class UpdateWhatsappProfileDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    logo: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    description: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    address: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    website: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    category: string
}


