import { Injectable, BadRequestException } from '@nestjs/common';
import { CacheManagerService } from './cacheManager.service';
import { User } from 'src/Model/user.model';
import { Profile } from '../Model/profileUser.model';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserRequest } from '../Model/dto/Request/user/createUserRequest';
import { UpdateUserRequest } from '../Model/dto/Request/user/updateUserRequest';
import { SucessfulResponse } from '../Model/dto/Response/sucessfulResponse'; 
import { GetUserResponse } from '../Model/dto/Response/user/getUserResponse';
import HttpCustomException from '../Exception/HttpCustomException';
import { StatusCodeEnums } from 'src/Enum/StatusCodeEnum';

@Injectable()
export class UsersService {
    constructor(
        private readonly _cacheService: CacheManagerService,
    ) {}

    /**
     * Crea un nuevo usuario.
     * @param newUser - Los datos del nuevo usuario.
     * @returns Respuesta indicando el éxito de la creación.
     */
    async createUser(newUser: CreateUserRequest): Promise<SucessfulResponse> {
        let profiles = await this._cacheService.get<Profile[]>('defaultProfiles');
        
       /** Validación: Si los perfiles no están cargados, recargarlos */
    if (!profiles || profiles.length === 0) {
        await this._cacheService.loadDefaultProfiles();
        profiles = await this._cacheService.get<Profile[]>('defaultProfiles');

        if (!profiles || profiles.length === 0) {
            throw new Error('Profiles could not be loaded into the cache.');
        }
    }

        /** Validación: Verificar si el perfil existe en el caché */
        const existingProfile: Profile = this._profileValidation(profiles, newUser.profile);
        
        /** Obtener la lista de usuarios existente desde la caché */
        let users: User[] = await this._cacheService.get<User[]>('allUsers') || [];
    
        /** Validación: Verificar que el correo electrónico sea único */
        this._uniqueEmailValidation(users, newUser.email);

        /** Generar un UUID para el nuevo usuario */
        const userWithId: User = {
            ...newUser,
            id: uuidv4(),
            profile: existingProfile,
        };
    
        /** Agregar el nuevo usuario a la lista */
        users.push(userWithId);
    
        /** Guardar la nueva lista de usuarios en la caché */
        await this._cacheService.set('allUsers', users, 360000);
        
        return new SucessfulResponse('User created successfully');
    }

    /**
     * Obtiene todos los usuarios.
     * @returns Lista de usuarios en formato GetUserResponse.
     */
    async findAllUsers(): Promise<GetUserResponse[]> {
        /** Intenta obtener los usuarios desde el caché */
        const cachedUsers: User[] = await this._cacheService.get<User[]>('allUsers');

        /** Validación: Si no hay usuarios en caché */
        if (!cachedUsers || cachedUsers.length === 0) {
            return [];
        }

        /** Mapea los usuarios obtenidos en una respuesta de GetUserResponse[] */
        return cachedUsers.map(user => new GetUserResponse(user));
    }

    /**
     * Obtiene un usuario por su ID.
     * @param id - ID del usuario a buscar.
     * @returns Usuario en formato GetUserResponse.
     */
    async findUserById(id: string): Promise<GetUserResponse> {
        /** Obtener el array de usuarios almacenado en la caché bajo la clave 'allUsers' */
        const users: User[] = await this._cacheService.get<User[]>('allUsers') || [];
        
        /** Validación: Buscar el usuario por su ID dentro del array de usuarios */
        const user = this._userValidation(users, id);

        /** Devolver el usuario encontrado */
        return new GetUserResponse(user);
    }

    /**
     * Actualiza la información de un usuario por su ID.
     * @param body - Datos actualizados del usuario.
     * @returns Respuesta indicando el éxito de la actualización.
     */
    async updateUserById(body: UpdateUserRequest): Promise<SucessfulResponse> {
        /** Obtener el array de usuarios almacenado en la caché bajo la clave 'allUsers' */
        const users: User[] = await this._cacheService.get<User[]>('allUsers') || [];
        
        /** Validación: Buscar el usuario por su ID dentro del array de usuarios */
        const findUserById: User = this._userValidation(users, body.id);

        /** Verificar si el perfil existe en la caché */
        const profiles: Profile[] = await this._cacheService.get<any[]>('defaultProfiles');
        const existingProfile: Profile = this._profileValidation(profiles, body.profile);

        /** Actualizar la información del usuario */
        const updatedUser: User = {
            ...findUserById,
            ...body,
            profile: existingProfile,
        };

        /** Reemplazar el usuario en el array con el usuario actualizado */
        const updatedUsers: User[] = users.map(user =>
            user.id === body.id ? updatedUser : user
        );
        
        /** Guardar el array de usuarios actualizado en la caché */
        await this._cacheService.set('allUsers', updatedUsers, 360000);

        /** Devolver el usuario actualizado */
        return new SucessfulResponse('User updated successfully');
    }

   /**
 * Elimina un usuario por su ID.
 * @param id - ID del usuario a eliminar.
 * @returns Respuesta indicando el éxito de la eliminación.
 */
async deleteUserById(id: string): Promise<SucessfulResponse> {
    /** Obtener el array de usuarios almacenado en la caché bajo la clave 'allUsers' */
    const users: User[] = await this._cacheService.get<User[]>('allUsers') || [];
    
    /** Validación: Buscar el usuario por su ID dentro del array de usuarios */
    const userIndex: number = users.findIndex(user => user.id === id);

    /** Validación: Si el usuario no se encuentra */
    if (userIndex === -1) {
        throw new HttpCustomException(`Usuario con ID ${id} no encontrado`, StatusCodeEnums.USER_NOT_FOUND);
    }

    /** Eliminar el usuario del array */
    users.splice(userIndex, 1);

    /** Guardar la lista de usuarios actualizada en la caché */
    await this._cacheService.set('allUsers', users, 360000);

    /** Devolver una respuesta indicando que el usuario se eliminó correctamente */
    return new SucessfulResponse('User deleted successfully');
}


    /**
     * Encuentra un perfil por su código.
     * @param profiles - Lista de perfiles.
     * @param profileCode - Código del perfil a buscar.
     * @returns Perfil encontrado.
     */
    private _profileValidation(profiles: any[], profileCode: string): any {
        console.log(profiles)
        const profile: Profile = profiles.find(profile => profile.code === profileCode);
        if (!profile) {
            throw new HttpCustomException(`Perfil con código ${profileCode} no encontrado.`, StatusCodeEnums.PROFILE_NOT_FOUNT);
        }
        return profile;
    }

    /**
     * Valida que el correo electrónico sea único.
     * @param users - Lista de usuarios.
     * @param email - Correo electrónico a verificar.
     */
    private _uniqueEmailValidation(users: User[], email: string): void {
        const existingUser: User = users.find(user => user.email === email);
        if (existingUser) {
            throw new HttpCustomException(`El email ${email} ya se encuentra registrado.`, StatusCodeEnums.EMAIL_DUPLICATED);
        }
    }

    /**
     * Busca un usuario por su ID en un array de usuarios.
     * @param users - Lista de usuarios.
     * @param id - ID del usuario a buscar.
     * @returns Usuario encontrado.
     */
    private _userValidation(users: User[], id: string): User {
        const user: User = users.find(user => user.id === id);
        if (!user) {
            throw new HttpCustomException(`Usuario con ID ${id} no encontrado`, StatusCodeEnums.USER_NOT_FOUND);
        }
        return user;
    }
}
