import { ApiProperty } from '@nestjs/swagger';

export class Profile {
  @ApiProperty({ example: 1, description: 'ID del perfil' })
  id: number;

  @ApiProperty({ example: 'ADMIN', description: 'Código del perfil' })
  code: string;

  @ApiProperty({ example: 'Administrador', description: 'Nombre del perfil' })
  name: string;
}
