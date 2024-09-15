import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from '../../Controller/users.controller';
import { UsersService } from '../../Service/users.service';

import { Profile } from '../../Model/profileUser.model';
import { User } from '../../Model/user.model';

import { CreateUserRequest } from '../../Model/dto/Request/user/createUserRequest';
import { UpdateUserRequest } from '../../Model/dto/Request/user/updateUserRequest';
import { GetUserResponse } from '../../Model/dto/Response/user/getUserResponse';
import { SucessfulResponse } from '../../Model/dto/Response/sucessfulResponse';

import Response from '../../Helper/Formatter/Response';

const mockProfiles: Profile[] = [
  { id: 1, code: 'ADMIN', name: 'Administrator' },
  { id: 2, code: 'USER', name: 'Regular User' },
];

const mockExistingUser: User = {
  id: '94adcc2d-9447-4285-8812-edaa9ef8bc98',
  name: 'Erika Sandoval',
  email: 'erikabsandoval@gmail.com',
  age: 30,
  profile: { id: 1, code: 'ADMIN', name: 'Administrator' },
};

const mockNewUser: CreateUserRequest = {
  name: 'Erika Sandoval',
  email: 'erikabsandoval@gmail.com',
  age: 32,
  profile: 'ADMIN',
};

const mockUpdateUser: UpdateUserRequest = {
  id: '94adcc2d-9447-4285-8812-edaa9ef8bc98',
  name: 'Erika Belen Sandoval',
  email: 'erikabsandoval@gmail.com',
  age: 30,
  profile: 'ADMIN',
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findAllUsers: jest.fn(),
            findUserById: jest.fn(),
            updateUserById: jest.fn(),
            deleteUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should create a user and return a success message', async () => {
      const newUser: CreateUserRequest = mockNewUser;

      const result = new SucessfulResponse('User created successfully');

      jest.spyOn(service, 'createUser').mockResolvedValue(result);

      const response = await controller.createUser(newUser);
      expect(response).toEqual(Response.create<SucessfulResponse>(result));
      expect(service.createUser).toHaveBeenCalledWith(newUser);
    });
  });

  describe('findAllUsers', () => {
    it('should return a list of users', async () => {
      const usersResponse: GetUserResponse[] = [mockExistingUser];

      jest.spyOn(service, 'findAllUsers').mockResolvedValue(usersResponse);

      const response = await controller.findAllUsers();
      expect(response).toEqual(
        Response.create<GetUserResponse[]>(usersResponse),
      );
      expect(service.findAllUsers).toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should return a user by ID', async () => {
      const userId = '123';
      const userResponse: GetUserResponse = mockExistingUser;

      jest.spyOn(service, 'findUserById').mockResolvedValue(userResponse);

      const response = await controller.findUserById(userId);
      expect(response).toEqual(Response.create<GetUserResponse>(userResponse));
      expect(service.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUserById', () => {
    it('should update a user and return a success message', async () => {
      const updateUser: UpdateUserRequest = mockUpdateUser;

      const result = new SucessfulResponse('User updated successfully');

      jest.spyOn(service, 'updateUserById').mockResolvedValue(result);

      const response = await controller.updateUserById(updateUser);
      expect(response).toEqual(Response.create<SucessfulResponse>(result));
      expect(service.updateUserById).toHaveBeenCalledWith(updateUser);
    });
  });

  describe('deleteUserById', () => {
    it('should delete a user by ID and return a success message', async () => {
      const userId = '123';
      const result = new SucessfulResponse('User deleted successfully');

      jest.spyOn(service, 'deleteUserById').mockResolvedValue(result);

      const response = await controller.deleteUserById(userId);
      expect(response).toEqual(Response.create<SucessfulResponse>(result));
      expect(service.deleteUserById).toHaveBeenCalledWith(userId);
    });
  });
});
