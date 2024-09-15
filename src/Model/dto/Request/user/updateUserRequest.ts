import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, Min, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateUserRequest {
    @ApiProperty({
        description: 'ID del usuario',
        example: '60956654-a678-4970-9572-5201f18a98d2',
    })
    @IsNotEmpty()
    @IsString()
    id: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Erika Sandoval',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'erikabsandoval@example.com',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Edad del usuario, debe ser un número entero mayor o igual a 18',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(18)
  age: number;

  @ApiProperty({
    description: 'Perfil del usuario',
    example: 'ADMIN',
  })
  @IsOptional()
  @IsString()
  profile: string;
}
