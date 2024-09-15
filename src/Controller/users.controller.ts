import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Delete, Put } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import Response from '../Helper/Formatter/Response';
import { UsersService } from '../Service/users.service';
import { User } from '../Model/user.model';
import { CreateUserRequest } from '../Model/dto/Request/user/createUserRequest';
import { UpdateUserRequest } from '../Model/dto/Request/user/updateUserRequest';
import { SucessfulResponse } from '../Model/dto/Response/sucessfulResponse';
import { GetUserResponse } from '../Model/dto/Response/user/getUserResponse';

@Controller('users')
export class UsersController {
    constructor(private readonly _userService: UsersService) {}

    /**
     * Crea un nuevo usuario.
     * @param newUser Datos del nuevo usuario.
     * @returns Respuesta con mensaje de éxito.
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: User })
    @ApiResponse({ status: 400, description: 'Error en la creación del usuario' })
    async createUser(@Body() newUser: CreateUserRequest): Promise<Response<SucessfulResponse>> {
        const response = await this._userService.createUser(newUser);
        return Response.create<SucessfulResponse>(response);
    }

    /**
     * Obtiene todos los usuarios.
     * @returns Lista de usuarios.
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente', type: [GetUserResponse] })
    async findAllUsers(): Promise<Response<GetUserResponse[]>> {
        const response = await this._userService.findAllUsers();
        return Response.create<GetUserResponse[]>(response);
    }

    /**
     * Obtiene un usuario por su ID.
     * @param id ID del usuario a buscar.
     * @returns Usuario encontrado.
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Usuario encontrado exitosamente', type: GetUserResponse })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async findUserById(@Param('id') id: string): Promise<Response<GetUserResponse>> {
        const response = await this._userService.findUserById(id);
        return Response.create<GetUserResponse>(response);
    }

    /**
     * Actualiza la información de un usuario por su ID.
     * @param body Datos actualizados del usuario.
     * @returns Respuesta con mensaje de éxito.
     */
    @Put()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente', type: SucessfulResponse })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    async updateUserById(
        @Body() body: UpdateUserRequest,
    ): Promise<Response<SucessfulResponse>> {
        const response = await this._userService.updateUserById(body);
        return Response.create<SucessfulResponse>(response);
    }

    /**
     * Elimina un usuario por su ID.
     * @param id ID del usuario a eliminar.
     * @returns Respuesta con mensaje de éxito.
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async deleteUserById(@Param('id') id: string): Promise<Response<SucessfulResponse>> {
        const response = await this._userService.deleteUserById(id);
        return Response.create<SucessfulResponse>(response);
    }
}
