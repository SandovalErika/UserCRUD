import { ApiProperty } from '@nestjs/swagger';
import { Profile } from './profileUser.model';

export class User {
  @ApiProperty({ example: 1, description: 'ID del usuario' })
  id: string;

  @ApiProperty({ example: 'Erika Sandoval', description: 'Nombre del usuario' })
  name: string;

  @ApiProperty({ example: 'erikabsandoval@gmail.com', description: 'Correo electrónico del usuario' })
  email: string;

  @ApiProperty({ example: 32, description: 'Edad del usuario' })
  age: number;

  @ApiProperty({ type: Profile, description: 'Datos del perfil del usuario' })
  profile: Profile;
}