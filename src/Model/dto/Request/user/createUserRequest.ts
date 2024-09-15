import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsInt, Min, ValidateNested, IsString } from 'class-validator';

export class CreateUserRequest {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Erika Sandoval',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'erikabsandoval@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Edad del usuario, debe ser un número entero mayor o igual a 18',
    example: 30,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(18)
  age: number;

  @ApiProperty({
    description: 'Perfil del usuario',
    example: 'ADMIN',
  })
  @IsNotEmpty()
  @IsString()
  profile: string;
}
